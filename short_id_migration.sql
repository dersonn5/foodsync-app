-- Adiciona coluna de código curto para facilitar leitura do QR Code
ALTER TABLE orders ADD COLUMN IF NOT EXISTS short_id TEXT;

-- Função para gerar ID curto automático (Ex: A192B5)
CREATE OR REPLACE FUNCTION generate_short_id() RETURNS TRIGGER AS $$
BEGIN
  -- Gera 6 caracteres aleatórios e maiúsculos
  NEW.short_id := upper(substring(md5(random()::text) from 1 for 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar o short_id automaticamente ao inserir novo pedido
DROP TRIGGER IF EXISTS set_short_id ON orders;
CREATE TRIGGER set_short_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_short_id();

-- (Opcional) Popula pedidos existentes que não tenham short_id
UPDATE orders 
SET short_id = upper(substring(md5(random()::text) from 1 for 6)) 
WHERE short_id IS NULL;
