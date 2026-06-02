'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'

export type EstadoConfiguracao = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

/**
 * Atualiza o valor de uma chave de configuracao.
 */
export async function atualizarConfiguracao(
  chave: string,
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const valor = String(formData.get('valor') ?? '').trim()
  if (!valor) {
    return { errosCampos: { valor: 'Valor e obrigatorio' } }
  }

  try {
    await clienteApi(`/configuracoes/${chave}`, {
      method: 'PUT',
      body: { valor },
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar configuracao.' }
  }

  revalidatePath('/configuracoes')
  revalidatePath('/configuracoes/financeiro')
  return { sucesso: true }
}

/**
 * Atualiza valor/km informado em reais (converte para centavos antes de salvar).
 */
export async function atualizarValorKm(
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const valorReais = String(formData.get('valorReais') ?? '').trim()
  if (!valorReais) {
    return { errosCampos: { valorReais: 'Valor e obrigatorio' } }
  }

  let centavos: number
  try {
    const limpo = valorReais.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim()
    centavos = Math.round(parseFloat(limpo) * 100)
    if (!Number.isFinite(centavos) || centavos < 0) throw new Error('invalido')
  } catch {
    return { errosCampos: { valorReais: 'Valor invalido' } }
  }

  try {
    await clienteApi(`/configuracoes/valor_km_centavos`, {
      method: 'PUT',
      body: { valor: String(centavos) },
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar configuracao.' }
  }

  revalidatePath('/configuracoes')
  revalidatePath('/configuracoes/financeiro')
  return { sucesso: true }
}

// ===== Tipo de Serviço =====

export async function criarTipoServico(
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const nome = String(formData.get('nome') ?? '').trim()
  if (!nome) {
    return { errosCampos: { nome: 'Nome e obrigatorio' } }
  }

  try {
    await clienteApi('/tipos-servico', { method: 'POST', body: { nome } })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar tipo de servico.' }
  }

  revalidatePath('/configuracoes/tipos-servico')
  return { sucesso: true }
}

export async function atualizarTipoServico(
  id: number,
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const nome = String(formData.get('nome') ?? '').trim()
  const ativo = formData.get('ativo') === 'on' || formData.get('ativo') === 'true'

  if (!nome) {
    return { errosCampos: { nome: 'Nome e obrigatorio' } }
  }

  try {
    await clienteApi(`/tipos-servico/${id}`, {
      method: 'PUT',
      body: { nome, ativo },
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar tipo de servico.' }
  }

  revalidatePath('/configuracoes/tipos-servico')
  return { sucesso: true }
}

/** Exclui um tipo de servico. Retorna mensagem se houver servico vinculado. */
export async function excluirTipoServico(id: number): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/tipos-servico/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao excluir tipo de servico.' }
  }
  revalidatePath('/configuracoes/tipos-servico')
  return {}
}

// ===== Categoria de Custo =====

export async function criarCategoriaCusto(
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const nome = String(formData.get('nome') ?? '').trim()

  if (!nome) {
    return { errosCampos: { nome: 'Nome e obrigatorio' } }
  }

  try {
    await clienteApi('/categorias-custo', {
      method: 'POST',
      body: { nome },
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar categoria.' }
  }

  revalidatePath('/configuracoes/categorias-custo')
  return { sucesso: true }
}

export async function atualizarCategoriaCusto(
  id: number,
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const nome = String(formData.get('nome') ?? '').trim()
  const ativo = formData.get('ativo') === 'on' || formData.get('ativo') === 'true'

  if (!nome) {
    return { errosCampos: { nome: 'Nome e obrigatorio' } }
  }

  try {
    await clienteApi(`/categorias-custo/${id}`, {
      method: 'PUT',
      body: { nome, ativo },
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar categoria.' }
  }

  revalidatePath('/configuracoes/categorias-custo')
  return { sucesso: true }
}

/** Exclui uma categoria LIVRE sem lancamentos. Retorna mensagem se o backend recusar. */
export async function excluirCategoriaCusto(id: number): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/categorias-custo/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao excluir categoria.' }
  }
  revalidatePath('/configuracoes/categorias-custo')
  return {}
}

// ===== Unidade de Medida =====

export async function criarUnidadeMedida(
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const sigla = String(formData.get('sigla') ?? '').trim()
  const nome = String(formData.get('nome') ?? '').trim()

  const errosCampos: Record<string, string> = {}
  if (!sigla) errosCampos.sigla = 'Sigla e obrigatoria'
  else if (sigla.length > 8) errosCampos.sigla = 'Maximo 8 caracteres'
  if (!nome) errosCampos.nome = 'Nome e obrigatorio'
  if (Object.keys(errosCampos).length) return { errosCampos }

  try {
    await clienteApi('/unidades-medida', { method: 'POST', body: { sigla, nome } })
  } catch (err) {
    if (err instanceof ErroApi) {
      if (err.status === 409) return { erro: 'Ja existe unidade com esta sigla.' }
      return { erro: err.body.mensagem }
    }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar unidade de medida.' }
  }

  revalidatePath('/configuracoes/unidades-medida')
  return { sucesso: true }
}

export async function atualizarUnidadeMedida(
  id: number,
  _estado: EstadoConfiguracao,
  formData: FormData,
): Promise<EstadoConfiguracao> {
  const sigla = String(formData.get('sigla') ?? '').trim()
  const nome = String(formData.get('nome') ?? '').trim()

  const errosCampos: Record<string, string> = {}
  if (!sigla) errosCampos.sigla = 'Sigla e obrigatoria'
  if (!nome) errosCampos.nome = 'Nome e obrigatorio'
  if (Object.keys(errosCampos).length) return { errosCampos }

  try {
    await clienteApi(`/unidades-medida/${id}`, { method: 'PUT', body: { sigla, nome } })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar unidade.' }
  }

  revalidatePath('/configuracoes/unidades-medida')
  return { sucesso: true }
}

export async function removerUnidadeMedida(id: number): Promise<void> {
  try {
    await clienteApi(`/unidades-medida/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/configuracoes/unidades-medida')
}
