import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/components'
import { authService } from '@/services/authService'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const resultado = await authService.login({ email, senha })

      if (resultado.success) {
        localStorage.setItem('usuario', JSON.stringify(resultado.data?.usuario))
        localStorage.setItem('token', resultado.data?.token || '')
        navigate('/dashboard')
      } else {
        setErro(resultado.error || 'Erro ao fazer login')
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FaturaMEI</h1>
          <p className="text-gray-600">Sistema de Faturamento para MEI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {erro && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{erro}</div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Desenvolvido por <span className="font-semibold">DSP Group</span></p>
          <p>v1.7.0 Parakos</p>
        </div>
      </Card>
    </div>
  )
}
