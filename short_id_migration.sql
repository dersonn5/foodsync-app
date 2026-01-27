-- 1. Adicionar coluna para o código curto
ALTER TABLE orders ADD COLUMN IF NOT EXISTS short_id TEXT;

-- 2. Função para gerar códigos curtos (Ex: 9A2-B7C)
CREATE OR REPLACE FUNCTION generate_short_id() RETURNS TRIGGER AS $$
BEGIN
  -- Gera uma string aleatória de 6 caracteres baseada no MD5 do UUID + Timestamp para garantir unicidade
  NEW.short_id := upper(substring(md5(NEW.id::text || clock_timestamp()::text) from 1 for 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para criar automaticamente em novos pedidos
DROP TRIGGER IF EXISTS set_short_id ON orders;
CREATE TRIGGER set_short_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_short_id();

-- 4. ATUALIZAR PEDIDOS ANTIGOS (Para não quebrar o que já existe)
UPDATE orders SET short_id = upper(substring(md5(id::text) from 1 for 6)) WHERE short_id IS NULL;
