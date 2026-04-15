-- Correção da Trigger de Comissionamento
-- Emissão do certificado sem pagamento não deve gerar repasse.
-- O repasse só é gerado quando o status for explicitamente 'Pago'.

CREATE OR REPLACE FUNCTION public.handle_order_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_commission DECIMAL(12,2);
  v_description TEXT;
  v_tx_exists BOOLEAN;
BEGIN
  -- Regra 1: Pagamento de comissão Apenas no status "Pago"
  IF (NEW.status = 'Pago' AND (OLD.status IS NULL OR OLD.status != 'Pago')) THEN
    v_seller_id := NEW.seller_id;
    v_commission := NEW.seller_commission;
    v_description := 'Repasse/Venda #' || substring(NEW.protocol from 10);

    IF v_seller_id IS NOT NULL AND v_commission > 0 THEN
      -- Create entry in financial_transactions
      INSERT INTO public.financial_transactions (
        user_id,
        type, -- 'Repasse/Venda'
        description,
        amount,
        status,
        reference_type,
        reference_id
      ) VALUES (
        v_seller_id,
        'Repasse/Venda',
        v_description,
        v_commission,
        'Disponível',
        'Order',
        NEW.id
      );

      -- Update profile balance
      UPDATE public.profiles
      SET balance_available = balance_available + v_commission
      WHERE id = v_seller_id;
    END IF;
  END IF;
  
  -- Regra 2: Estorno de comissão
  -- Só estornamos se a encomenda foi para 'Cancelado', 'Arquivado' OU 'Estornado'
  IF (NEW.status IN ('Cancelado', 'Arquivado', 'Estornado') AND OLD.status NOT IN ('Cancelado', 'Arquivado', 'Estornado')) THEN
    v_seller_id := NEW.seller_id;
    v_commission := NEW.seller_commission;
    v_description := 'Estorno Venda #' || substring(NEW.protocol from 10);

    -- Verifica se EXISTE uma transação de Repasse para este pedido antes de estornar
    -- Isso previne estorno de pedidos "Emitidos" que nunca foram Pagos.
    SELECT EXISTS(
      SELECT 1 FROM public.financial_transactions 
      WHERE reference_id = NEW.id AND type = 'Repasse/Venda'
    ) INTO v_tx_exists;

    IF v_tx_exists AND v_seller_id IS NOT NULL AND v_commission > 0 THEN
       -- Create negative entry
      INSERT INTO public.financial_transactions (
        user_id,
        type,
        description,
        amount,
        status,
        reference_type,
        reference_id
      ) VALUES (
        v_seller_id,
        'Estorno',
        v_description,
        -v_commission,
        'Estornado',
        'Order',
        NEW.id
      );

      -- Deduct from profile balance
      UPDATE public.profiles
      SET balance_available = balance_available - v_commission
      WHERE id = v_seller_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
