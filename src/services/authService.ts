import { supabase } from './supabaseClient'
import { Usuario, LoginForm, ApiResponse } from '@/types'

export const authService = {
  async login(data: LoginForm): Promise<ApiResponse<{ usuario: Usuario; token: string }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha,
      })

      if (authError) return { success: false, error: authError.message }

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user?.id)
        .single()

      if (userError) return { success: false, error: userError.message }

      return {
        success: true,
        data: {
          usuario: userData,
          token: authData.session?.access_token || '',
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async registrar(email: string, senha: string, nomeCompleto: string, empresaId: string): Promise<ApiResponse<Usuario>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      })

      if (authError) return { success: false, error: authError.message }

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user?.id,
          email,
          nome_completo: nomeCompleto,
          empresa_id: empresaId,
          ativo: true,
          data_criacao: new Date().toISOString(),
        }])
        .select()
        .single()

      if (userError) return { success: false, error: userError.message }
      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) return { success: false, error: error.message }
      return { success: true, message: 'Logout realizado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async obterUsuarioAtual(): Promise<ApiResponse<Usuario | null>> {
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return { success: true, data: null }

      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.session.user.id)
        .single()

      if (error) return { success: false, error: error.message }
      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async estaAutenticado(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession()
      return !!data.session
    } catch {
      return false
    }
  },
}
