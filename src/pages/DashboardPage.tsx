import React, { useEffect, useState } from 'react'
import { Card } from '@/components'
import { DashboardData } from '@/types'
import { AnalisadorMEI } from '@/utils/mei-rules'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#22c55e', '#ef4444']

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

const CustomTooltip = (props: any) => {
  const { active, payload } = props
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow">
        <p className="text-gray-800">{`${payload[0].payload.mes || payload[0].payload.name}: ${formatarMoeda(payload[0].value)}`}</p>
      </div>
    )
  }
  return null
}

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockData: DashboardData = {
      faturamento_mes: 15000,
      faturamento_ano: 150000,
      nfs_total: 45,
      nfs_pendentes: 8,
      clientes_total: 25,
      clientes_ativos: 22,
      pagamentos_pendentes: 12,
      valor_pendente: 8500,
      mei_status: 'conforme',
      top_clientes: [
        { id: '1', nome: 'Cliente A', valor_total: 25000, nfs_total: 15 },
        { id: '2', nome: 'Cliente B', valor_total: 18000, nfs_total: 10 },
        { id: '3', nome: 'Cliente C', valor_total: 12000, nfs_total: 8 },
      ],
      grafico_faturamento: [
        { mes: 'Janeiro', valor: 12000 },
        { mes: 'Fevereiro', valor: 14000 },
        { mes: 'Março', valor: 15000 },
      ],
      grafico_pagamentos: [
        { mes: 'Pendentes', valor: 8500 },
        { mes: 'Pagos', valor: 141500 },
      ],
    }

    setTimeout(() => {
      setDashboardData(mockData)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div className="text-center text-red-600">Erro ao carregar dados</div>
  }

  const meiAnalise = AnalisadorMEI.verificarConformidadeMensal(dashboardData.faturamento_mes)
  const recomendacoes = AnalisadorMEI.obterRecomendacoes(
    dashboardData.faturamento_mes,
    dashboardData.faturamento_ano,
    dashboardData.nfs_pendentes
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao FaturaMEI v1.7.0</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Faturamento Mês</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-2">
              {formatarMoeda(dashboardData.faturamento_mes)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{meiAnalise.percentual.toFixed(2)}% do limite</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Notas Pendentes</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">{dashboardData.nfs_pendentes}</h3>
            <p className="text-xs text-gray-500 mt-1">de {dashboardData.nfs_total} notas</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Clientes Ativos</p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">{dashboardData.clientes_ativos}</h3>
            <p className="text-xs text-gray-500 mt-1">de {dashboardData.clientes_total} clientes</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Pagamentos Pendentes</p>
            <h3 className="text-2xl font-bold text-red-600 mt-2">
              {formatarMoeda(dashboardData.valor_pendente)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{dashboardData.pagamentos_pendentes} pendências</p>
          </div>
        </Card>
      </div>

      <Card title="Status de Conformidade MEI">
        <div className={`p-4 rounded-lg ${meiAnalise.status === 'conforme' ? 'bg-green-50 border border-green-200' : meiAnalise.status === 'alerta' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {meiAnalise.status === 'conforme' ? '✅' : meiAnalise.status === 'alerta' ? '⚠️' : '❌'}
            </span>
            <div>
              <h4 className="font-semibold">
                {meiAnalise.status === 'conforme'
                  ? 'Empresa em conformidade'
                  : meiAnalise.status === 'alerta'
                    ? 'Aproximando do limite'
                    : 'Limite excedido'}
              </h4>
              <p className="text-sm text-gray-600">Faturamento: {meiAnalise.percentual.toFixed(1)}% do limite mensal</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Recomendações">
        <div className="space-y-2">
          {recomendacoes.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-lg mt-1">{rec.substring(0, 1)}</span>
              <p className="text-gray-700">{rec.substring(1)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Faturamento Mensal">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.grafico_faturamento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#0284c7" name="Faturamento" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Status de Pagamentos">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.grafico_pagamentos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, valor }) => `${name}: ${formatarMoeda(valor)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {dashboardData.grafico_pagamentos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Top 3 Clientes">
        <div className="space-y-3">
          {dashboardData.top_clientes.map((cliente) => (
            <div key={cliente.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{cliente.nome}</p>
                <p className="text-sm text-gray-600">{cliente.nfs_total} notas fiscais</p>
              </div>
              <p className="font-bold text-blue-600">{formatarMoeda(cliente.valor_total)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
