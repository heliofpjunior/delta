-- Migration: Fix Order Status Constraints and Commission Triggers
-- Date: 2026-02-27

-- 1. Update the status check constraint on public.orders
-- First, find the constraint name. Usually it's something like 'orders_status_check'
DO $$ 
DECLARE 
    constraint_name TEXT;
BEGIN 
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.orders'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) LIKE '%status%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pago', 'Pendente', 'Cancelado', 'Rascunho', 'Arquivado', 'Emitido', 'Agendado', 'Validado', 'Aprovado', 'Reprovado'));

-- 2. Update the handle_order_payment trigger function
CREATE OR REPLACE FUNCTION public.handle_order_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_commission DECIMAL(12,2);
  v_description TEXT;
BEGIN
  -- We now care when status changes to 'Pago' OR 'Emitido'
  -- But we only trigger if it wasn't already 'Pago' or 'Emitido' (to avoid double commission)
  IF (NEW.status IN ('Pago', 'Emitido') AND (OLD.status IS NULL OR OLD.status NOT IN ('Pago', 'Emitido'))) THEN
    v_seller_id := NEW.seller_id;
    v_commission := NEW.seller_commission;
    v_description := 'Repasse/Venda #' || substring(NEW.protocol from 10);

    IF v_seller_id IS NOT NULL AND v_commission > 0 THEN
      -- Create entry in financial_transactions
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
  
  -- Handle 'Cancelado' or 'Arquivado' if it was previously in a commissioned state
  IF (NEW.status IN ('Cancelado', 'Arquivado') AND OLD.status IN ('Pago', 'Emitido')) THEN
    v_seller_id := NEW.seller_id;
    v_commission := NEW.seller_commission;
    v_description := 'Estorno Venda #' || substring(NEW.protocol from 10);

    IF v_seller_id IS NOT NULL AND v_commission > 0 THEN
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
