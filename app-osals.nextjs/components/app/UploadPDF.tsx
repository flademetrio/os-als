'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { EstadoAnexo } from '@/app/actions/anexo'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const TAMANHO_MAX_MB = 10
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024
const ESTADO_INICIAL: EstadoAnexo = {}

type Props = {
  /** Server action ja vinculada ao id do recurso (servico ou OS). */
  acao: (estado: EstadoAnexo, formData: FormData) => Promise<EstadoAnexo>
  /** Exibe o campo de descricao (anexos de Servico). */
  comDescricao?: boolean
  rotuloBotao?: string
  /** Chamado apos um upload bem-sucedido. */
  onSucesso?: () => void
}

/**
 * Upload de PDF reutilizavel: drag-and-drop ou clique, com validacao no
 * cliente (extensao .pdf e tamanho <= 10 MB). O backend revalida por
 * assinatura magica — erros dele aparecem como Alert.
 */
export function UploadPDF({ acao, comDescricao = false, rotuloBotao = 'Enviar', onSucesso }: Props) {
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const [arrastando, setArrastando] = useState(false)

  useEffect(() => {
    if (estado.sucesso) {
      formRef.current?.reset()
      setNomeArquivo(null)
      setErroLocal(null)
      onSucesso?.()
    }
  }, [estado.sucesso, onSucesso])

  function validar(arquivo: File | undefined): boolean {
    if (!arquivo) {
      setNomeArquivo(null)
      return false
    }
    if (!arquivo.name.toLowerCase().endsWith('.pdf')) {
      setErroLocal('Apenas arquivos .pdf sao aceitos.')
      setNomeArquivo(null)
      return false
    }
    if (arquivo.size > TAMANHO_MAX_BYTES) {
      setErroLocal(`O arquivo excede ${TAMANHO_MAX_MB} MB.`)
      setNomeArquivo(null)
      return false
    }
    setErroLocal(null)
    setNomeArquivo(arquivo.name)
    return true
  }

  function aoSelecionar() {
    validar(inputRef.current?.files?.[0])
  }

  function aoSoltar(e: React.DragEvent) {
    e.preventDefault()
    setArrastando(false)
    const arquivo = e.dataTransfer.files?.[0]
    if (!arquivo || !inputRef.current) return
    const dt = new DataTransfer()
    dt.items.add(arquivo)
    inputRef.current.files = dt.files
    validar(arquivo)
  }

  return (
    <form action={dispatch} ref={formRef} className="space-y-3">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}
      {erroLocal && (
        <Alert variant="warning" dismissible>
          {erroLocal}
        </Alert>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
        onClick={() => inputRef.current?.click()}
        className={[
          'cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          arrastando ? 'border-primary bg-primary-light' : 'border-slate-300 hover:border-primary',
        ].join(' ')}
      >
        <p className="text-sm text-slate-600">
          {nomeArquivo ? (
            <span className="font-medium text-slate-900">{nomeArquivo}</span>
          ) : (
            <>
              Arraste um PDF aqui ou <span className="text-primary font-medium">clique para escolher</span>
            </>
          )}
        </p>
        <p className="text-xs text-slate-400 mt-1">Apenas .pdf, ate {TAMANHO_MAX_MB} MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="arquivo"
        accept="application/pdf,.pdf"
        onChange={aoSelecionar}
        className="hidden"
      />

      {comDescricao && (
        <Input label="Descricao (opcional)" name="descricao" fullWidth />
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" loading={pendente} disabled={!nomeArquivo}>
          {pendente ? 'Enviando...' : rotuloBotao}
        </Button>
      </div>
    </form>
  )
}
