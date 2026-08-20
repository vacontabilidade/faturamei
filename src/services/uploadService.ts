import { supabase } from './supabaseClient'
import { ApiResponse } from '@/types'

export const uploadService = {
  async uploadArquivo(
    arquivo: File,
    caminhoStorage: string,
    empresaId: string
  ): Promise<ApiResponse<{ url: string; path: string }>> {
    try {
      const nomeArquivo = `${empresaId}/${Date.now()}-${arquivo.name}`
      const caminhoCompleto = `${caminhoStorage}/${nomeArquivo}`

      const { data, error } = await supabase.storage
        .from('faturamei-files')
        .upload(caminhoCompleto, arquivo, { upsert: false })

      if (error) return { success: false, error: error.message }

      const { data: urlData } = supabase.storage
        .from('faturamei-files')
        .getPublicUrl(data.path)

      return {
        success: true,
        data: { url: urlData.publicUrl, path: data.path },
        message: 'Arquivo enviado com sucesso',
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async uploadLogo(arquivo: File, empresaId: string): Promise<ApiResponse<string>> {
    try {
      const resultado = await this.uploadArquivo(arquivo, 'logos', empresaId)
      if (!resultado.success || !resultado.data) {
        return { success: false, error: 'Erro ao fazer upload da logo' }
      }
      return { success: true, data: resultado.data.url, message: 'Logo enviada com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async uploadComprovante(arquivo: File, empresaId: string): Promise<ApiResponse<string>> {
    try {
      const resultado = await this.uploadArquivo(arquivo, 'comprovantes', empresaId)
      if (!resultado.success || !resultado.data) {
        return { success: false, error: 'Erro ao fazer upload do comprovante' }
      }
      return { success: true, data: resultado.data.url, message: 'Comprovante enviado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async uploadExtratoBancario(arquivo: File, empresaId: string): Promise<ApiResponse<string>> {
    try {
      if (!arquivo.type.includes('pdf')) {
        return { success: false, error: 'Apenas arquivos PDF são aceitos' }
      }
      const resultado = await this.uploadArquivo(arquivo, 'extratos', empresaId)
      if (!resultado.success || !resultado.data) {
        return { success: false, error: 'Erro ao fazer upload do extrato' }
      }
      return { success: true, data: resultado.data.url, message: 'Extrato enviado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async deletarArquivo(caminhoStorage: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.storage.from('faturamei-files').remove([caminhoStorage])
      if (error) return { success: false, error: error.message }
      return { success: true, message: 'Arquivo deletado com sucesso' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },
}
