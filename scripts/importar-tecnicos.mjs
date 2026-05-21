/**
 * Cadastra os tecnicos iniciais da ALS via API.
 *
 * O cadastro de tecnico exige e-mail e senha (tecnico = usuario do sistema).
 * Como a planilha de origem nao traz esses dados, o e-mail e derivado do
 * nome (nome.sobrenome@alsindustria.com.br) e a senha e provisoria —
 * deve ser trocada no primeiro acesso.
 *
 * Uso: node scripts/importar-tecnicos.mjs
 */

const API = process.env.API ?? 'http://localhost:8080'
const EMAIL = process.env.EMAIL ?? 'flavio@alsindustria.com.br'
const SENHA = process.env.SENHA ?? '123'
const SENHA_PROVISORIA = 'Trocar@123'

// Dados da planilha. valorHora em reais; convertido para centavos abaixo.
const TECNICOS = [
  { nome: 'Ademir Ferreira', valorHora: '13,99168182', telefone: '15991865286', especialidade: 'Mecanico de refrigeracao' },
  { nome: 'Moises Vieria Matos', valorHora: '12,61727273', telefone: '15992564171', especialidade: 'Auxiliar tecnico' },
  { nome: 'Samuel Ramos Gualtieri', valorHora: '10,73181818', telefone: '11962291344', especialidade: 'Auxiliar tecnico' },
  { nome: 'William Fogaca de Almeida', valorHora: '14,63636364', telefone: '15998347325', especialidade: 'Mecanico de refrigeracao' },
]

/** Remove acentos e baixa caixa. */
const semAcento = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** nome.sobrenome@alsindustria.com.br */
function emailDe(nome) {
  const partes = semAcento(nome).trim().split(/\s+/)
  const primeiro = partes[0]
  const ultimo = partes[partes.length - 1]
  return `${primeiro}.${ultimo}@alsindustria.com.br`
}

/** "13,99168182" reais -> centavos inteiros. */
const reaisParaCentavos = (s) => Math.round(parseFloat(s.replace(',', '.')) * 100)

/** 11 digitos -> "(15) 99186-5286". */
function formatarTelefone(digitos) {
  const d = digitos.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d
}

async function main() {
  const resLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, senha: SENHA }),
  })
  if (!resLogin.ok) {
    console.error(`Falha no login (HTTP ${resLogin.status}). Backend no ar?`)
    process.exit(1)
  }
  const cookie = (resLogin.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(';')[0])
    .join('; ')

  let criados = 0
  let erros = 0

  for (const t of TECNICOS) {
    const corpo = {
      nome: t.nome,
      email: emailDe(t.nome),
      senha: SENHA_PROVISORIA,
      valorHoraCentavos: reaisParaCentavos(t.valorHora),
      especialidade: t.especialidade,
      telefone: formatarTelefone(t.telefone),
    }

    const res = await fetch(`${API}/tecnicos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(corpo),
    })

    if (res.ok) {
      criados++
      console.log(
        `+ ${corpo.nome} — ${corpo.email} — R$ ${(corpo.valorHoraCentavos / 100)
          .toFixed(2)
          .replace('.', ',')}/h`,
      )
    } else {
      erros++
      const e = await res.json().catch(() => null)
      console.log(`x ${corpo.nome}: ${e?.mensagem ?? `HTTP ${res.status}`}`)
    }
  }

  console.log('')
  console.log(`Concluido. Criados: ${criados} · Erros: ${erros}`)
  console.log(`Senha provisoria de todos: ${SENHA_PROVISORIA} (trocar no primeiro acesso)`)
}

main().catch((e) => {
  console.error('Falha inesperada:', e)
  process.exit(1)
})
