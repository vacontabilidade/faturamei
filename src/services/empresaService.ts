import { supabase } from './supabaseClient'
import { Empresa, ApiResponse } from '@/types'

export const empresaService = {
  async obter(empresaId: string): Promise<ApiResponse<Empresa>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async atualizar(empresaId: string, dados: Partial<Empresa>): Promise<ApiResponse<Empresa>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(dados)
        .eq('id', empresaId)
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data, message: 'Empresa atualizada com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async atualizarCores(empresaId: string, corPrimaria: string, corSecundaria: string): Promise<ApiResponse<Empresa>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({ cor_primaria: corPrimaria, cor_secundaria: corSecundaria })
        .eq('id', empresaId)
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data, message: 'Cores atualizadas com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async atualizarLogo(empresaId: string, logoUrl: string): Promise<ApiResponse<Empresa>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({ logo_url: logoUrl })
        .eq('id', empresaId)
        .select()
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data, message: 'Logo atualizada com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },
}
