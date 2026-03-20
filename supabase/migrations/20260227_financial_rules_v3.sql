-- Migration: Financial Rules v3 - Global Balance Formula
-- Date: 2026-02-27

-- Update sync_user_balance to follow the rule:
-- Available = (All Commissions) - (Withdrawals Processed/Processing)
-- This is simply the sum of all transactions that are not Estornado or Recusado.
CREATE OR REPLACE FUNCTION public.sync_user_balance(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET 
        balance_available = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM public.financial_transactions 
            WHERE user_id = p_user_id 
              AND status IN ('Disponível', 'Processando', 'Liquidado')
        ),
        balance_processing = (
            SELECT COALESCE(ABS(SUM(amount)), 0) 
            FROM public.financial_transactions 
            WHERE user_id = p_user_id 
              AND status = 'Processando' 
              AND type = 'Solicitação de Saque'
        )
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update process_full_withdrawal to ensure it uses the correct available balance pool
CREATE OR REPLACE FUNCTION public.process_full_withdrawal(p_user_id UUID, p_pix_key TEXT)
RETURNS JSONB AS $$
DECLARE
    v_total_available DECIMAL(12,2);
    v_withdrawal_id UUID;
BEGIN
    -- Calculate total available balance using the NEW rule
    SELECT COALESCE(SUM(amount), 0) INTO v_total_available
    FROM public.financial_transactions
    WHERE user_id = p_user_id 
      AND status IN ('Disponível', 'Processando', 'Liquidado');

    IF v_total_available <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente para saque. Saldo atual: R$ ' || v_total_available);
    END IF;

    -- Create common withdrawal record
    INSERT INTO public.withdrawals (
        user_id,
        amount,
        status,
        pix_key
    ) VALUES (
        p_user_id,
        v_total_available,
        'Pendente',
        p_pix_key
    ) RETURNING id INTO v_withdrawal_id;

    -- Create transactional record in financial_transactions
    INSERT INTO public.financial_transactions (
        user_id,
        type,
        description,
        amount,
        status,
        reference_type,
        reference_id
    ) VALUES (
        p_user_id,
        'Solicitação de Saque',
        'Saque Total via Pix: ' || p_pix_key,
        -v_total_available,
        'Processando',
        'Withdrawal',
        v_withdrawal_id
    );

    -- Update only 'Disponível' commissions to 'Processando'
    -- Actually, if they are already 'Processando' from a previous (partial) withdrawal that didn't consume them, 
    -- they will stay 'Processando' but now linked to the new withdrawal?
    -- To keep it simple and follow the user's logic, we just shift all 'Disponível' to 'Processando'
    UPDATE public.financial_transactions
    SET status = 'Processando',
        reference_id = v_withdrawal_id,
        reference_type = 'Withdrawal'
    WHERE user_id = p_user_id AND status = 'Disponível';

    -- Sync profile table using the helper
    PERFORM public.sync_user_balance(p_user_id);

    RETURN jsonb_build_object(
        'success', true, 
        'withdrawal_id', v_withdrawal_id, 
        'amount', v_total_available
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
