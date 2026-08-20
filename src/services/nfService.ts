import { supabase } from './supabaseClient'
import { NotaFiscal, NotaFiscalForm, PaginatedResponse, ApiResponse } from '@/types'

export const nfService = {
  async listar(empresaId: string, page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<NotaFiscal>>> {
    try {
      const offset = (page - 1) * pageSize

      const { data: notas, error, count } = await supabase
        .from('notas_fiscais')
        .select('*', { count: 'exact' })
        .eq('empresa_id', empresaId)
        .order('data_emissao', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) return { success: false, error: error.message }

      return {
        success: true,
        data: {
          data: notas || [],
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async obterPorId(nfId: string): Promise<ApiResponse<NotaFiscal>> {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('id', nfId)
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async criar(empresaId: string, clienteId: string, dados: NotaFiscalForm): Promise<ApiResponse<NotaFiscal>> {
    try {
      const valorTotal = dados.items.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0)
      const valorLiquido = valorTotal - dados.valor_desconto + (dados.valor_juros || 0)

      const { data: nf, error: nfError } = await supabase
        .from('notas_fiscais')
        .insert([{
          empresa_id: empresaId,
          cliente_id: clienteId,
          numero_nf: `NF-${Date.now()}`,
          ...dados,
          valor_total: valorTotal,
          valor_liquido: valorLiquido,
          status: 'rascunho',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        }])
        .select()
        .single()

      if (nfError) return { success: false, error: nfError.message }

      if (dados.items.length > 0) {
        const { error: itemError } = await supabase
          .from('itens_nf')
          .insert(dados.items.map((item) => ({
            nf_id: nf.id,
            ...item,
            valor_total: item.quantidade * item.valor_unitario,
          })))

        if (itemError) return { success: false, error: itemError.message }
      }

      return { success: true, data: nf, message: 'Nota fiscal criada com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async atualizarStatus(nfId: string, novoStatus: string): Promise<ApiResponse<NotaFiscal>> {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .update({
          status: novoStatus,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', nfId)
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data, message: 'Status atualizado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async deletar(nfId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .eq('id', nfId)

      if (error) return { success: false, error: error.message }
      return { success: true, message: 'Nota fiscal deletada com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },
}
