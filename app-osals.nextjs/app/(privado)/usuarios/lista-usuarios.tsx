'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  ativarUsuario,
  atualizarUsuario,
  buscarUsuario,
  criarUsuario,
  definirPermissoes,
  inativarUsuario,
  redefinirSenhaUsuario,
} from '@/app/actions/usuario'
import type {
  CatalogoPermissoesResposta,
  Papel,
  Permissao,
  PermissaoDto,
  UsuarioAdminResumoDto,
} from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

/** Papeis editaveis pela administracao (TECNICO e gerenciado em /tecnicos). */
const PAPEIS_EDITAVEIS: Papel[] = ['OPERADOR', 'COMPRAS', 'GERENTE', 'ADMIN']

const LABEL_PAPEL: Record<Papel, string> = {
  OPERADOR: 'Operador',
  COMPRAS: 'Compras',
  GERENTE: 'Gerente',
  ADMIN: 'Admin',
  TECNICO: 'Tecnico',
}

function agruparPermissoes(perms: PermissaoDto[]): [string, PermissaoDto[]][] {
  const grupos = new Map<string, PermissaoDto[]>()
  for (const p of perms) {
    const atual = grupos.get(p.grupo) ?? []
    atual.push(p)
    grupos.set(p.grupo, atual)
  }
  return Array.from(grupos.entries())
}

export function ListaUsuarios({
  usuarios,
  catalogo,
}: {
  usuarios: UsuarioAdminResumoDto[]
  catalogo: CatalogoPermissoesResposta
}) {
  const router = useRouter()
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<UsuarioAdminResumoDto | null>(null)
  const [permissoesDe, setPermissoesDe] = useState<UsuarioAdminResumoDto | null>(null)
  const [senhaDe, setSenhaDe] = useState<UsuarioAdminResumoDto | null>(null)
  const [erroLista, setErroLista] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  function alternarAtivo(u: UsuarioAdminResumoDto) {
    setErroLista(null)
    iniciar(async () => {
      const r = u.ativo ? await inativarUsuario(u.id) : await ativarUsuario(u.id)
      if (r.erro) setErroLista(r.erro)
      else router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{usuarios.length} usuario(s)</p>
        <Button size="sm" onClick={() => setCriando(true)}>
          + Novo usuario
        </Button>
      </div>

      {erroLista && (
        <Alert variant="danger" dismissible>
          {erroLista}
        </Alert>
      )}

      <ul className="divide-y divide-slate-100">
        {usuarios.map((u) => {
          const ehTecnico = u.papel === 'TECNICO'
          return (
            <li key={u.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-900 truncate">{u.nome}</span>
                  <Badge variant="info" size="sm">
                    {LABEL_PAPEL[u.papel]}
                  </Badge>
                  <Badge variant={u.ativo ? 'success' : 'default'} size="sm" dot>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setPermissoesDe(u)}>
                  Permissoes
                </Button>
                {!ehTecnico && (
                  <Button variant="ghost" size="sm" onClick={() => setEditando(u)}>
                    Editar
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSenhaDe(u)}>
                  Senha
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={pendente}
                  onClick={() => alternarAtivo(u)}
                >
                  {u.ativo ? 'Inativar' : 'Ativar'}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      {criando && (
        <ModalCriar aoFechar={() => setCriando(false)} aoSalvar={() => router.refresh()} />
      )}
      {editando && (
        <ModalEditar
          usuario={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => router.refresh()}
        />
      )}
      {permissoesDe && (
        <ModalPermissoes
          usuario={permissoesDe}
          catalogo={catalogo}
          aoFechar={() => setPermissoesDe(null)}
          aoSalvar={() => router.refresh()}
        />
      )}
      {senhaDe && (
        <ModalSenha
          usuario={senhaDe}
          aoFechar={() => setSenhaDe(null)}
          aoSalvar={() => router.refresh()}
        />
      )}
    </>
  )
}

// ---------- Modal: criar usuario ----------

function ModalCriar({ aoFechar, aoSalvar }: { aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [papel, setPapel] = useState<Papel>('OPERADOR')
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  function salvar() {
    setErro(null)
    iniciar(async () => {
      const r = await criarUsuario({ nome, email, senha, papel })
      if (r.erro) setErro(r.erro)
      else {
        aoSalvar()
        aoFechar()
      }
    })
  }

  return (
    <Modal
      open
      onClose={pendente ? () => {} : aoFechar}
      title="Novo usuario"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={aoFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button loading={pendente} onClick={salvar}>
            Criar
          </Button>
        </>
      }
    >
      {erro && <Alert variant="danger" dismissible>{erro}</Alert>}
      <div className="space-y-4 mt-2">
        <Input label="Nome" fullWidth required value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Senha provisoria"
          type="password"
          fullWidth
          required
          hint="Minimo 8 caracteres. O usuario pode trocar depois."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Select label="Papel" fullWidth required value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
          {PAPEIS_EDITAVEIS.map((p) => (
            <option key={p} value={p}>
              {LABEL_PAPEL[p]}
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500">
          As permissoes do preset do papel sao aplicadas automaticamente. Voce pode ajusta-las depois na aba Permissoes.
        </p>
      </div>
    </Modal>
  )
}

// ---------- Modal: editar nome/papel ----------

function ModalEditar({
  usuario,
  aoFechar,
  aoSalvar,
}: {
  usuario: UsuarioAdminResumoDto
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const [nome, setNome] = useState(usuario.nome)
  const [papel, setPapel] = useState<Papel>(usuario.papel)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  function salvar() {
    setErro(null)
    iniciar(async () => {
      const r = await atualizarUsuario(usuario.id, { nome, papel })
      if (r.erro) setErro(r.erro)
      else {
        aoSalvar()
        aoFechar()
      }
    })
  }

  return (
    <Modal
      open
      onClose={pendente ? () => {} : aoFechar}
      title="Editar usuario"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={aoFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button loading={pendente} onClick={salvar}>
            Salvar
          </Button>
        </>
      }
    >
      {erro && <Alert variant="danger" dismissible>{erro}</Alert>}
      <div className="space-y-4 mt-2">
        <Input label="Nome" fullWidth required value={nome} onChange={(e) => setNome(e.target.value)} />
        <p className="text-xs text-slate-500">Email: {usuario.email}</p>
        <Select label="Papel" fullWidth required value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
          {PAPEIS_EDITAVEIS.map((p) => (
            <option key={p} value={p}>
              {LABEL_PAPEL[p]}
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500">
          Mudar o papel nao reaplica o preset — ajuste as permissoes na aba Permissoes se necessario.
        </p>
      </div>
    </Modal>
  )
}

// ---------- Modal: redefinir senha ----------

function ModalSenha({
  usuario,
  aoFechar,
  aoSalvar,
}: {
  usuario: UsuarioAdminResumoDto
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  function salvar() {
    setErro(null)
    iniciar(async () => {
      const r = await redefinirSenhaUsuario(usuario.id, senha)
      if (r.erro) setErro(r.erro)
      else {
        aoSalvar()
        aoFechar()
      }
    })
  }

  return (
    <Modal
      open
      onClose={pendente ? () => {} : aoFechar}
      title={`Redefinir senha — ${usuario.nome}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={aoFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button loading={pendente} onClick={salvar}>
            Salvar
          </Button>
        </>
      }
    >
      {erro && <Alert variant="danger" dismissible>{erro}</Alert>}
      <div className="space-y-2 mt-2">
        <Input
          label="Nova senha"
          type="password"
          fullWidth
          required
          hint="Minimo 8 caracteres. Invalida as sessoes atuais do usuario."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>
    </Modal>
  )
}

// ---------- Modal: permissoes ----------

function ModalPermissoes({
  usuario,
  catalogo,
  aoFechar,
  aoSalvar,
}: {
  usuario: UsuarioAdminResumoDto
  catalogo: CatalogoPermissoesResposta
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const [selecionadas, setSelecionadas] = useState<Set<Permissao>>(new Set())
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()
  const ehAdmin = usuario.papel === 'ADMIN'

  useEffect(() => {
    let ativo = true
    buscarUsuario(usuario.id).then((r) => {
      if (!ativo) return
      if (r.erro) setErro(r.erro)
      else if (r.usuario) setSelecionadas(new Set(r.usuario.permissoes))
      setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [usuario.id])

  function alternar(p: Permissao) {
    setSelecionadas((atual) => {
      const novo = new Set(atual)
      if (novo.has(p)) novo.delete(p)
      else novo.add(p)
      return novo
    })
  }

  function aplicarPreset(papel: string) {
    if (!papel) return
    setSelecionadas(new Set(catalogo.presets[papel] ?? []))
  }

  function salvar() {
    setErro(null)
    iniciar(async () => {
      const r = await definirPermissoes(usuario.id, Array.from(selecionadas))
      if (r.erro) setErro(r.erro)
      else {
        aoSalvar()
        aoFechar()
      }
    })
  }

  return (
    <Modal
      open
      onClose={pendente ? () => {} : aoFechar}
      title={`Permissoes — ${usuario.nome}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={aoFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button loading={pendente} onClick={salvar} disabled={carregando || ehAdmin}>
            Salvar
          </Button>
        </>
      }
    >
      {erro && <Alert variant="danger" dismissible>{erro}</Alert>}

      {ehAdmin && (
        <Alert variant="info">
          Administradores tem todas as permissoes automaticamente — nao da para restringi-las.
        </Alert>
      )}

      {carregando ? (
        <p className="text-sm text-slate-500 mt-2">Carregando permissoes...</p>
      ) : (
        <div className={ehAdmin ? 'opacity-50 pointer-events-none mt-2' : 'mt-2'}>
          <div className="flex items-center gap-2 mb-4">
            <Select
              placeholder="Aplicar preset..."
              onChange={(e) => aplicarPreset(e.target.value)}
              defaultValue=""
            >
              {PAPEIS_EDITAVEIS.map((p) => (
                <option key={p} value={p}>
                  Preset: {LABEL_PAPEL[p]}
                </option>
              ))}
            </Select>
            <span className="text-xs text-slate-400">{selecionadas.size} selecionada(s)</span>
          </div>

          <div className="space-y-4">
            {agruparPermissoes(catalogo.permissoes).map(([grupo, perms]) => (
              <div key={grupo}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {grupo}
                </p>
                <div className="space-y-1.5">
                  {perms.map((p) => (
                    <div key={p.nome}>
                      <Checkbox
                        label={p.descricao}
                        checked={selecionadas.has(p.nome)}
                        onChange={() => alternar(p.nome)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
