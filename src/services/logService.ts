import { supabase } from './supabaseClient'
import { Log, ApiResponse } from '@/types'

export const logService = {
  async registrarLog(
    empresaId: string,
    usuarioId: string,
    tipo: 'create' | 'update' | 'delete' | 'login' | 'download' | 'exportar',
    tabela: string,
    registroId: string,
    dadosAnteriores?: Record<string, any>,
    dadosNovos?: Record<string, any>
  ): Promise<ApiResponse<Log>> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .insert([{
          empresa_id: empresaId,
          usuario_id: usuarioId,
          tipo,
          tabela,
          registro_id: registroId,
          dados_anteriores: dadosAnteriores,
          dados_novos: dadosNovos,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao registrar log:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erro ao registrar log:', error)
      return { success: false, error: String(error) }
    }
  },

  async obterLogs(empresaId: string, limit: number = 100): Promise<ApiResponse<Log[]>> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) return { success: false, error: error.message }
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async exportarRelatorio(empresaId: string, dataInicio: string, dataFim: string): Promise<ApiResponse<Log[]>> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('empresa_id', empresaId)
        .gte('timestamp', dataInicio)
        .lte('timestamp', dataFim)
        .order('timestamp', { ascending: false })

      if (error) return { success: false, error: error.message }
      return { success: true, data: data || [], message: 'Relatório gerado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },
}
