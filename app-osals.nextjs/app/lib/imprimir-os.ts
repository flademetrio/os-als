/**
 * Imprime a OS direto, sem abrir a tela: gera o PDF (POST /imprimir), carrega
 * num iframe escondido e dispara a caixa de impressao. Se o navegador bloquear
 * o print do iframe, cai para abrir o PDF em aba nova.
 *
 * Usado pelas listas de OS (global e aba do servico). Lanca Error com a mensagem
 * da API quando falha — o chamador trata (estado de loading / alerta).
 */
export async function imprimirOs(id: number): Promise<void> {
  const resp = await fetch(`/api-proxy/ordens-servico/${id}/imprimir`, { method: 'POST' })
  if (!resp.ok) {
    const corpo = await resp.json().catch(() => null)
    throw new Error(corpo?.mensagem ?? 'Falha ao gerar o PDF para impressao.')
  }
  const blob = await resp.blob()
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.src = url
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
  document.body.appendChild(iframe)
  setTimeout(() => {
    URL.revokeObjectURL(url)
    iframe.remove()
  }, 120_000)
}
