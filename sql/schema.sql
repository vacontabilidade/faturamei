-- ============================================
-- SCHEMA SQL - FaturaMEI v1.7.0
-- PostgreSQL + Supabase
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: empresas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  cpf_responsavel VARCHAR(14) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cep VARCHAR(10),
  endereco VARCHAR(255),
  numero VARCHAR(10),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  logo_url TEXT,
  cor_primaria VARCHAR(7) DEFAULT '#0ea5e9',
  cor_secundaria VARCHAR(7) DEFAULT '#1e40af',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: perfis_usuario
CREATE TABLE IF NOT EXISTS perfis_usuario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, nome)
);

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES perfis_usuario(id),
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(2) NOT NULL CHECK (tipo IN ('PF', 'PJ')),
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cep VARCHAR(10),
  endereco VARCHAR(255),
  numero VARCHAR(10),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  limite_credito DECIMAL(15, 2) DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, cpf_cnpj)
);

-- Tabela: notas_fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero_nf VARCHAR(50) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  data_emissao TIMESTAMP NOT NULL,
  data_vencimento TIMESTAMP NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  valor_desconto DECIMAL(15, 2) DEFAULT 0,
  valor_juros DECIMAL(15, 2) DEFAULT 0,
  valor_liquido DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'emitida', 'paga', 'cancelada')),
  descricao TEXT,
  chave_nfe VARCHAR(50),
  xml_url TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: itens_nf
CREATE TABLE IF NOT EXISTS itens_nf (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nf_id UUID NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  descricao VARCHAR(500) NOT NULL,
  quantidade DECIMAL(15, 4) NOT NULL,
  valor_unitario DECIMAL(15, 2) NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  aliquota_icms DECIMAL(5, 2) DEFAULT 0,
  aliquota_iss DECIMAL(5, 2) DEFAULT 0,
  ncm VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nf_id UUID NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('dinheiro', 'cheque', 'pix', 'ted', 'cartao_credito', 'cartao_debito', 'boleto', 'transferencia')),
  valor DECIMAL(15, 2) NOT NULL,
  data_pagamento TIMESTAMP NOT NULL,
  data_vencimento TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'confirmado', 'falha')),
  comprovante_url TEXT,
  referencia_externo VARCHAR(100),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: extratos_bancarios
CREATE TABLE IF NOT EXISTS extratos_bancarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  banco VARCHAR(100),
  agencia VARCHAR(10),
  conta VARCHAR(20),
  data_inicio DATE,
  data_fim DATE,
  saldo_inicial DECIMAL(15, 2),
  saldo_final DECIMAL(15, 2),
  arquivo_url TEXT,
  processado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: transacoes_extrato
CREATE TABLE IF NOT EXISTS transacoes_extrato (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extrato_id UUID NOT NULL REFERENCES extratos_bancarios(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  descricao VARCHAR(500),
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('credito', 'debito')),
  valor DECIMAL(15, 2) NOT NULL,
  saldo DECIMAL(15, 2),
  referencia VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: limites_mei
CREATE TABLE IF NOT EXISTS limites_mei (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  limite_mensal DECIMAL(15, 2) DEFAULT 30833.33,
  limite_anual DECIMAL(15, 2) DEFAULT 370000.00,
  faturamento_mensal_atual DECIMAL(15, 2) DEFAULT 0,
  faturamento_anual_atual DECIMAL(15, 2) DEFAULT 0,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: certificados_digitais
CREATE TABLE IF NOT EXISTS certificados_digitais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
  nome_proprietario VARCHAR(255),
  cnpj VARCHAR(18),
  data_validade_inicio DATE,
  data_validade_fim DATE,
  serial_number VARCHAR(100),
  arquivo_url TEXT,
  ativo BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validado_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: logs
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('create', 'update', 'delete', 'login', 'download', 'exportar')),
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: versoes
CREATE TABLE IF NOT EXISTS versoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(20) NOT NULL UNIQUE,
  data_lancamento DATE,
  descricao TEXT,
  breaking_changes TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_notas_fiscais_empresa_id ON notas_fiscais(empresa_id);
CREATE INDEX idx_notas_fiscais_cliente_id ON notas_fiscais(cliente_id);
CREATE INDEX idx_notas_fiscais_status ON notas_fiscais(status);
CREATE INDEX idx_pagamentos_nf_id ON pagamentos(nf_id);
CREATE INDEX idx_pagamentos_empresa_id ON pagamentos(empresa_id);
CREATE INDEX idx_logs_empresa_id ON logs(empresa_id);

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW vw_faturamento_mensal AS
SELECT
  e.id as empresa_id,
  e.razao_social,
  DATE_TRUNC('month', nf.data_emissao)::DATE as mes,
  COUNT(nf.id) as total_notas,
  SUM(nf.valor_liquido) as total_faturamento
FROM empresas e
LEFT JOIN notas_fiscais nf ON e.id = nf.empresa_id
WHERE nf.status != 'cancelada'
GROUP BY e.id, e.razao_social, DATE_TRUNC('month', nf.data_emissao);

CREATE VIEW vw_contas_receber AS
SELECT
  nf.id as nf_id,
  nf.numero_nf,
  e.razao_social as empresa,
  c.nome as cliente,
  nf.valor_liquido,
  nf.data_vencimento,
  CASE
    WHEN nf.status = 'paga' THEN 'Paga'
    WHEN CURRENT_DATE > nf.data_vencimento THEN 'Vencida'
    ELSE 'Aberta'
  END as status_pagamento
FROM notas_fiscais nf
JOIN empresas e ON nf.empresa_id = e.id
JOIN clientes c ON nf.cliente_id = c.id
WHERE nf.tipo = 'saida' AND nf.status != 'cancelada';

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DADOS INICIAIS
-- ============================================

INSERT INTO versoes (numero, data_lancamento, descricao) VALUES
  ('1.7.0', CURRENT_DATE, 'FaturaMEI v1.7.0 Parakos - Versão inicial');

COMMIT;
