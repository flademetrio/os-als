import { clienteApi } from '@/app/lib/cliente-api'
import type {
  CatalogoPermissoesResposta,
  UsuarioAdminResumoDto,
} from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { ListaUsuarios } from './lista-usuarios'

export default async function UsuariosPage() {
  const [usuarios, catalogo] = await Promise.all([
    clienteApi<UsuarioAdminResumoDto[]>('/usuarios'),
    clienteApi<CatalogoPermissoesResposta>('/permissoes'),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Usuarios</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie os usuarios e as permissoes de acesso de cada um.
        </p>
      </div>

      <Card padding="md">
        <ListaUsuarios usuarios={usuarios} catalogo={catalogo} />
      </Card>
    </div>
  )
}
