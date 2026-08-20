import Decimal from 'decimal.js'

export class AnalisadorMEI {
  static readonly LIMITE_MENSAL = new Decimal('30833.33')
  static readonly LIMITE_ANUAL = new Decimal('370000.00')
  static readonly ALIQUOTA_PIS = 0.0305
  static readonly ALIQUOTA_COFINS = 0.076
  static readonly ALIQUOTA_ICMS = 0.18
  static readonly ALIQUOTA_ISS = 0.05

  static verificarConformidadeMensal(faturamentoMes: number) {
    const valor = new Decimal(faturamentoMes)
    const percentual = valor.dividedBy(this.LIMITE_MENSAL).times(100).toNumber()

    let status: 'conforme' | 'alerta' | 'excedido' = 'conforme'
    if (percentual > 100) {
      status = 'excedido'
    } else if (percentual > 80) {
      status = 'alerta'
    }

    return { conforme: status !== 'excedido', percentual: Math.min(percentual, 100), status }
  }

  static verificarConformidadeAnual(faturamentoAno: number) {
    const valor = new Decimal(faturamentoAno)
    const percentual = valor.dividedBy(this.LIMITE_ANUAL).times(100).toNumber()

    let status: 'conforme' | 'alerta' | 'excedido' = 'conforme'
    if (percentual > 100) {
      status = 'excedido'
    } else if (percentual > 80) {
      status = 'alerta'
    }

    return { conforme: status !== 'excedido', percentual: Math.min(percentual, 100), status }
  }

  static calcularPIS(faturamentoBase: number): number {
    return new Decimal(faturamentoBase).times(this.ALIQUOTA_PIS).toNumber()
  }

  static calcularCOFINS(faturamentoBase: number): number {
    return new Decimal(faturamentoBase).times(this.ALIQUOTA_COFINS).toNumber()
  }

  static calcularICMS(valorItem: number, aliquota: number = this.ALIQUOTA_ICMS): number {
    return new Decimal(valorItem).times(aliquota).toNumber()
  }

  static calcularISS(valorServico: number, aliquota: number = this.ALIQUOTA_ISS): number {
    return new Decimal(valorServico).times(aliquota).toNumber()
  }

  static calcularDASEstimado(faturamentoMes: number): number {
    const pis = this.calcularPIS(faturamentoMes)
    const cofins = this.calcularCOFINS(faturamentoMes)
    return new Decimal(pis).plus(cofins).toNumber()
  }

  static simularFaltaParaLimite(faturamentoAtual: number, ehMensal: boolean = true) {
    const faturamento = new Decimal(faturamentoAtual)
    const limite = ehMensal ? this.LIMITE_MENSAL : this.LIMITE_ANUAL

    if (faturamento.greaterThanOrEqualTo(limite)) {
      return { faltaEmReais: 0, reaisRestantes: 0, percentualRestante: 0 }
    }

    const restante = limite.minus(faturamento)
    return {
      faltaEmReais: restante.toNumber(),
      reaisRestantes: restante.toNumber(),
      percentualRestante: restante.dividedBy(limite).times(100).toNumber(),
    }
  }

  static obterRecomendacoes(faturamentoMes: number, faturamentoAno: number, nfsPendentes: number): string[] {
    const recomendacoes: string[] = []

    const statusMensal = this.verificarConformidadeMensal(faturamentoMes)
    const statusAnual = this.verificarConformidadeAnual(faturamentoAno)

    if (statusMensal.status === 'excedido') {
      recomendacoes.push('⚠️ Faturamento mensal EXCEDIDO. Considere formalizar como PJ.')
    } else if (statusMensal.status === 'alerta') {
      recomendacoes.push('⚠️ Aproximando do limite mensal (80%). Acompanhe o faturamento.')
    }

    if (statusAnual.status === 'excedido') {
      recomendacoes.push('⚠️ Faturamento anual EXCEDIDO. Ação urgente necessária.')
    } else if (statusAnual.status === 'alerta') {
      recomendacoes.push('ℹ️ Aproximando do limite anual (80%). Planeje o crescimento.')
    }

    if (nfsPendentes > 10) {
      recomendacoes.push(`📋 Você tem ${nfsPendentes} notas fiscais pendentes. Regularize.`)
    }

    if (recomendacoes.length === 0) {
      recomendacoes.push('✅ Tudo em conformidade com as limitações MEI.')
    }

    return recomendacoes
  }

  static gerarRelatorioConformidade(faturamentoMes: number, faturamentoAno: number) {
    const statusMensal = this.verificarConformidadeMensal(faturamentoMes)
    const statusAnual = this.verificarConformidadeAnual(faturamentoAno)

    const pis = this.calcularPIS(faturamentoMes)
    const cofins = this.calcularCOFINS(faturamentoMes)
    const dasEstimado = this.calcularDASEstimado(faturamentoMes)

    const conforme = statusMensal.conforme && statusAnual.conforme
    let razao = 'Empresa em conformidade com limites MEI'

    if (!statusMensal.conforme) {
      razao = `Limite mensal EXCEDIDO`
    }
    if (!statusAnual.conforme) {
      razao = `Limite anual EXCEDIDO`
    }

    const proximasAcoes: string[] = []
    if (!conforme) {
      proximasAcoes.push('Consultar contador para análise de formalização como PJ')
      proximasAcoes.push('Revisar estrutura de preços e margens')
    }
    proximasAcoes.push('Manter registros de todas as transações')
    proximasAcoes.push('Emitir notas fiscais regularmente')

    return {
      mes: statusMensal,
      ano: statusAnual,
      impostos_estimados: { pis, cofins, das_estimado: dasEstimado },
      analise: { conforme, razao, proximas_acoes: proximasAcoes },
    }
  }
}

export const useMEIAnalysis = (faturamentoMes: number, faturamentoAno: number) => {
  const statusMensal = AnalisadorMEI.verificarConformidadeMensal(faturamentoMes)
  const statusAnual = AnalisadorMEI.verificarConformidadeAnual(faturamentoAno)
  const recomendacoes = AnalisadorMEI.obterRecomendacoes(faturamentoMes, faturamentoAno, 0)

  return {
    statusMensal,
    statusAnual,
    recomendacoes,
    relatorio: AnalisadorMEI.gerarRelatorioConformidade(faturamentoMes, faturamentoAno),
  }
}
