import Link from 'next/link'
import { validarLink } from '@/app/actions/redefinicao'
import { FormularioRedefinicao } from './formulario-redefinicao'

type Props = { searchParams: Promise<{ token?: string }> }

export default async function RedefinirSenhaPage({ searchParams }: Props) {
  const { token } = await searchParams
  const validacao = token ? await validarLink(token) : { valido: false, nome: null }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Redefinir senha</h1>
            {validacao.valido && validacao.nome && (
              <p className="text-sm text-slate-500 mt-1">
                Ola, {validacao.nome}. Defina sua nova senha.
              </p>
            )}
          </div>

          {validacao.valido && token ? (
            <FormularioRedefinicao token={token} />
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600">
                Este link e invalido ou expirou. Peca um novo ao administrador.
              </p>
              <Link href="/login" className="text-primary hover:underline text-sm">
                Ir para o login
              </Link>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          ALS Industria — Sistema de gestao de Ordens de Servico
        </p>
      </div>
    </main>
  )
}
