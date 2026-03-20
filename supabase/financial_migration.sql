-- Financial Module Updates
-- 1. Profiles updates: Add balances and custom pricing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS balance_available DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS balance_processing DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS custom_prices JSONB DEFAULT '{}'::jsonb;

-- 2. Financial Transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'Repasse/Venda', 'Solicitação de Saque', 'Estorno', 'Recusado'
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Disponível', 'Processando', 'Liquidado', 'Estornado', 'Recusado')),
  reference_type TEXT, -- 'Order', 'Withdrawal'
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for financial_transactions
CREATE POLICY "Users can view their own transactions." ON public.financial_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access on transactions." ON public.financial_transactions
  FOR ALL USING (public.is_admin());

-- 3. Trigger to handle Repasse/Venda on Order marked as 'Pago'
CREATE OR REPLACE FUNCTION public.handle_order_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_commission DECIMAL(12,2);
  v_description TEXT;
BEGIN
  -- We only care when status changes to 'Pago'
  IF (NEW.status = 'Pago' AND (OLD.status IS NULL OR OLD.status != 'Pago')) THEN
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
  
  -- Handle 'Cancelado' or 'Estornado' if it was previously 'Pago'
  IF (NEW.status IN ('Cancelado', 'Arquivado') AND OLD.status = 'Pago') THEN
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

DROP TRIGGER IF EXISTS on_order_payment ON public.orders;
CREATE TRIGGER on_order_payment
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_payment();
