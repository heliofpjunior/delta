
-- Migration SQL for Financial Withdrawals Module
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS withdrawal_id UUID REFERENCES financial_transactions(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS proof_url TEXT; 
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS observations TEXT;

-- Index for auditing performances
CREATE INDEX IF NOT EXISTS idx_ft_withdrawal_id ON financial_transactions(withdrawal_id);

-- Update the process_full_withdrawal RPC to link credits to the new request
CREATE OR REPLACE FUNCTION process_full_withdrawal(p_user_id UUID, p_pix_key TEXT)
RETURNS JSON AS $$
DECLARE
    v_balance DECIMAL;
    v_tx_id UUID;
BEGIN
    -- 1. Buscar o saldo disponível atual
    SELECT balance_available INTO v_balance 
    FROM profiles 
    WHERE id = p_user_id 
    FOR UPDATE;

    -- 2. Validar se tem saldo
    IF v_balance <= 0 OR v_balance IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Saldo insuficiente para saque.');
    END IF;

    -- 3. Registrar a transação de saída (negativa) no extrato
    INSERT INTO financial_transactions (
        user_id, 
        amount, 
        type, 
        status, 
        description
    ) VALUES (
        p_user_id,
        -v_balance,
        'Solicitação de Saque',
        'Processando',
        'Saque via PIX para chave: ' || p_pix_key
    ) RETURNING id INTO v_tx_id;

    -- 4. LINK ALL AVAILABLE CREDITS to this withdrawal request
    UPDATE financial_transactions
    SET withdrawal_id = v_tx_id
    WHERE user_id = p_user_id 
    AND type = 'Crédito de Comissão' 
    AND status = 'Disponível';

    -- 5. Atualizar o perfil
    UPDATE profiles 
    SET 
        balance_available = 0,
        balance_processing = COALESCE(balance_processing, 0) + v_balance
    WHERE id = p_user_id;

    -- 6. Retornar sucesso
    RETURN json_build_object(
        'success', true, 
        'withdrawal_id', v_tx_id, 
        'amount', v_balance
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
