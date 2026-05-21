'use client'

import { useState } from 'react'
import { Input } from './Input'

/** "12345678901" -> "123.456.789-01" (formata parcialmente conforme digita). */
function formatarCpf(d: string): string {
  d = d.slice(0, 11)
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`
  return d
}

/** "12345678000199" -> "12.345.678/0001-99" (formata parcialmente conforme digita). */
function formatarCnpj(d: string): string {
  d = d.slice(0, 14)
  if (d.length > 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
  }
  if (d.length > 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  if (d.length > 5) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`
  return d
}

type Props = {
  tipoPessoa: 'PF' | 'PJ'
  error?: string
}

/**
 * Campo de documento (CPF/CNPJ) com mascara conforme o tipo de pessoa.
 * O valor enviado no formulario e o texto mascarado; o esquema Zod do
 * cliente remove a pontuacao antes de chegar ao backend.
 */
export function InputDocumento({ tipoPessoa, error }: Props) {
  const [digitos, setDigitos] = useState('')

  const ehPj = tipoPessoa === 'PJ'
  const valor = ehPj ? formatarCnpj(digitos) : formatarCpf(digitos)

  return (
    <Input
      label={ehPj ? 'CNPJ' : 'CPF'}
      name="documento"
      required
      inputMode="numeric"
      placeholder={ehPj ? '00.000.000/0000-00' : '000.000.000-00'}
      value={valor}
      onChange={(e) => {
        const limite = ehPj ? 14 : 11
        setDigitos(e.target.value.replace(/\D/g, '').slice(0, limite))
      }}
      error={error}
      fullWidth
    />
  )
}
