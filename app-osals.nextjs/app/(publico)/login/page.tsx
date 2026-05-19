import { FormularioLogin } from './formulario-login'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">OS-ALS</h1>
            <p className="text-sm text-slate-500 mt-1">Entre com seu e-mail e senha</p>
          </div>
          <FormularioLogin />
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          ALS Industria — Sistema de gestao de Ordens de Servico
        </p>
      </div>
    </main>
  )
}
