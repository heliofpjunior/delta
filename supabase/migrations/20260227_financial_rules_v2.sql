-- Migration: Financial Rules v2 - Full Withdrawal and Balance Consistency
-- Date: 2026-02-27

-- 1. Function to process a full withdrawal request
CREATE OR REPLACE FUNCTION public.process_full_withdrawal(p_user_id UUID, p_pix_key TEXT)
RETURNS JSONB AS $$
DECLARE
    v_total_available DECIMAL(12,2);
    v_withdrawal_id UUID;
BEGIN
    -- Calculate total available balance from 'Disponível' transactions
    SELECT COALESCE(SUM(amount), 0) INTO v_total_available
    FROM public.financial_transactions
    WHERE user_id = p_user_id AND status = 'Disponível';

    IF v_total_available <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente para saque');
    END IF;

    -- Create common withdrawal record (if table exists and is used)
    -- Based on schema.sql, we have public.withdrawals
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

    -- Update all 'Disponível' transactions to 'Processando' for this user
    -- This links them logically to the current pending withdrawal
    UPDATE public.financial_transactions
    SET status = 'Processando',
        reference_id = v_withdrawal_id,
        reference_type = 'Withdrawal'
    WHERE user_id = p_user_id AND status = 'Disponível';

    -- Update profile balance available and processing
    -- available goes to 0, processing increases by the total
    UPDATE public.profiles
    SET balance_available = 0,
        balance_processing = COALESCE(balance_processing, 0) + v_total_available
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true, 
        'withdrawal_id', v_withdrawal_id, 
        'amount', v_total_available
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure balance consistency helper
CREATE OR REPLACE FUNCTION public.sync_user_balance(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET 
        balance_available = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM public.financial_transactions 
            WHERE user_id = p_user_id AND status = 'Disponível'
        ),
        balance_processing = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM public.financial_transactions 
            WHERE user_id = p_user_id AND status = 'Processando' AND amount > 0
        ) - (
             -- This is complex since we need to subtract only the negative 'Solicitação de Saque' that are processing?
             -- Actually, the user rule is: Available = Sum of available commissions.
             -- Let's keep it simple as requested: Available is what is available to be taken.
             -- The process_full_withdrawal already handles the move.
             0
        )
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
