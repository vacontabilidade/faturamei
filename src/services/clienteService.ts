import { supabase } from './supabaseClient'
import { Cliente, ClienteForm, PaginatedResponse, ApiResponse } from '@/types'

export const clienteService = {
  async listar(empresaId: string, page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<Cliente>>> {
    try {
      const offset = (page - 1) * pageSize

      const { data: clientes, error, count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome', { ascending: true })
        .range(offset, offset + pageSize - 1)

      if (error) return { success: false, error: error.message }

      return {
        success: true,
        data: {
          data: clientes || [],
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

  async obterPorId(clienteId: string): Promise<ApiResponse<Cliente>> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async criar(empresaId: string, dados: ClienteForm): Promise<ApiResponse<Cliente>> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          empresa_id: empresaId,
          ...dados,
          ativo: true,
          data_criacao: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data, message: 'Cliente criado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async atualizar(clienteId: string, dados: Partial<ClienteForm>): Promise<ApiResponse<Cliente>> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(dados)
        .eq('id', clienteId)
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data, message: 'Cliente atualizado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async deletar(clienteId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', clienteId)

      if (error) return { success: false, error: error.message }
      return { success: true, message: 'Cliente deletado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },
}
