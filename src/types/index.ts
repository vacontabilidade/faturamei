export interface Usuario {
  id: string
  email: string
  nome_completo: string
  empresa_id: string
  perfil_id?: string
  ativo: boolean
  data_criacao: string
  ultimo_acesso?: string
}

export interface Empresa {
  id: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  cpf_responsavel: string
  email: string
  telefone?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  logo_url?: string
  cor_primaria: string
  cor_secundaria: string
  data_criacao: string
  ativo: boolean
}

export interface Cliente {
  id: string
  empresa_id: string
  tipo: 'PF' | 'PJ'
  nome: string
  cpf_cnpj: string
  email?: string
  telefone?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  limite_credito: number
  data_criacao: string
  ativo: boolean
  notas?: string
}

export interface NotaFiscal {
  id: string
  empresa_id: string
  cliente_id: string
  numero_nf: string
  tipo: 'entrada' | 'saida'
  data_emissao: string
  data_vencimento: string
  valor_total: number
  valor_desconto: number
  valor_juros: number
  valor_liquido: number
  status: 'rascunho' | 'emitida' | 'paga' | 'cancelada'
  descricao: string
  chave_nfe?: string
  xml_url?: string
  items?: ItemNF[]
  pagamentos?: Pagamento[]
  criado_em: string
  atualizado_em: string
}

export interface ItemNF {
  id: string
  nf_id: string
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  aliquota_icms: number
  aliquota_iss: number
  ncm?: string
}

export interface Pagamento {
  id: string
  nf_id: string
  empresa_id: string
  tipo: 'dinheiro' | 'cheque' | 'pix' | 'ted' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia'
  valor: number
  data_pagamento: string
  data_vencimento?: string
  status: 'pendente' | 'processando' | 'confirmado' | 'falha'
  comprovante_url?: string
  referencia_externo?: string
  criado_em: string
}

export interface ExtratoBancario {
  id: string
  empresa_id: string
  banco?: string
  agencia?: string
  conta?: string
  data_inicio?: string
  data_fim?: string
  saldo_inicial?: number
  saldo_final?: number
  transacoes?: TransacaoExtrato[]
  arquivo_url?: string
  processado: boolean
  criado_em: string
}

export interface TransacaoExtrato {
  id: string
  extrato_id: string
  data: string
  descricao: string
  tipo: 'credito' | 'debito'
  valor: number
  saldo?: number
  referencia?: string
}

export interface Log {
  id: string
  empresa_id: string
  usuario_id?: string
  tipo: 'create' | 'update' | 'delete' | 'login' | 'download' | 'exportar'
  tabela: string
  registro_id: string
  dados_anteriores?: Record<string, any>
  dados_novos?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LoginForm {
  email: string
  senha: string
}

export interface ClienteForm {
  tipo: 'PF' | 'PJ'
  nome: string
  cpf_cnpj: string
  email?: string
  telefone?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  limite_credito: number
  notas?: string
}

export interface NotaFiscalForm {
  cliente_id: string
  tipo: 'entrada' | 'saida'
  data_emissao: string
  data_vencimento: string
  valor_desconto: number
  valor_juros?: number
  descricao: string
  items: ItemNFForm[]
}

export interface ItemNFForm {
  descricao: string
  quantidade: number
  valor_unitario: number
  aliquota_icms?: number
  aliquota_iss?: number
  ncm?: string
}

export interface DashboardData {
  faturamento_mes: number
  faturamento_ano: number
  nfs_total: number
  nfs_pendentes: number
  clientes_total: number
  clientes_ativos: number
  pagamentos_pendentes: number
  valor_pendente: number
  mei_status: 'conforme' | 'alerta' | 'excedido'
  top_clientes: Array<{ id: string; nome: string; valor_total: number; nfs_total: number }>
  grafico_faturamento: Array<{ mes: string; valor: number }>
  grafico_pagamentos: Array<{ mes: string; valor: number }>
}
