/**
 * Importa clientes a partir de um CSV exportado de ERP (separador ";").
 *
 * Para cada linha cria, via API: Cliente + Unidade ("Matriz") + Contato.
 * Respeita as validacoes do backend e a checagem de duplicidade (clientes
 * ja existentes sao pulados — o script pode ser re-executado com seguranca).
 *
 * Uso:
 *   node scripts/importar-clientes.mjs <caminho-do-csv>
 *
 * Variaveis de ambiente opcionais:
 *   API     (default http://localhost:8080)
 *   EMAIL   (default flavio@alsindustria.com.br)
 *   SENHA   (default 123)
 *
 * Mapeamento das colunas (0-based) do CSV:
 *   0 documento  1 razaoSocial  2 nomeFantasia  3 nomeContato
 *   4 logradouro 5 numero  6 bairro  7 complemento  8 UF  9 cidade
 *   10 pais  11 cep  12 telefone  15 email
 */

import { readFileSync } from 'node:fs'

const API = process.env.API ?? 'http://localhost:8080'
const EMAIL = process.env.EMAIL ?? 'flavio@alsindustria.com.br'
const SENHA = process.env.SENHA ?? '123'

const caminhoCsv = process.argv[2]
if (!caminhoCsv) {
  console.error('Uso: node scripts/importar-clientes.mjs <caminho-do-csv>')
  process.exit(1)
}

const digitos = (s) => (s ?? '').replace(/\D/g, '')
const texto = (s, max) => {
  const t = (s ?? '').trim()
  if (!t) return undefined
  return max ? t.slice(0, max) : t
}
const emailValido = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

function lerCsv(caminho) {
  const buf = readFileSync(caminho)
  let conteudo = buf.toString('utf8')
  // CSV de ERP costuma vir em Latin-1; se o utf-8 produzir caractere
  // de substituicao, relê como latin1.
  if (conteudo.includes('�')) conteudo = buf.toString('latin1')
  return conteudo
    .split(/\r?\n/)
    .map((l) => l.split(';'))
    .filter((c) => digitos(c[0]).length >= 11)
}

async function jsonOuTexto(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

async function main() {
  const linhas = lerCsv(caminhoCsv)
  console.log(`CSV: ${linhas.length} linha(s) com documento.`)

  // --- Login ---
  const resLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, senha: SENHA }),
  })
  if (!resLogin.ok) {
    console.error(`Falha no login (HTTP ${resLogin.status}). Backend no ar?`)
    process.exit(1)
  }
  const setCookies = resLogin.headers.getSetCookie?.() ?? []
  const cookie = setCookies.map((c) => c.split(';')[0]).join('; ')
  if (!cookie) {
    console.error('Login nao retornou cookies de sessao.')
    process.exit(1)
  }
  const headers = { 'Content-Type': 'application/json', Cookie: cookie }

  const post = (caminho, corpo) =>
    fetch(`${API}${caminho}`, { method: 'POST', headers, body: JSON.stringify(corpo) })

  let criados = 0
  let duplicados = 0
  let erros = 0

  for (const c of linhas) {
    const doc = digitos(c[0])
    const nome = texto(c[1], 160)

    // Ignora o registro generico "Cliente Consumidor" e linhas sem nome.
    if (!nome || /^0+$/.test(doc) || (doc.length !== 11 && doc.length !== 14)) {
      continue
    }

    const fantasia = texto(c[2], 160)
    const cliente = {
      tipoPessoa: doc.length === 14 ? 'PJ' : 'PF',
      documento: doc,
      nome,
      nomeFantasia: fantasia && fantasia !== nome ? fantasia : undefined,
    }

    const resCli = await post('/clientes', cliente)
    if (resCli.status === 409) {
      duplicados++
      console.log(`- ${nome}: ja cadastrado (pulado)`)
      continue
    }
    if (!resCli.ok) {
      erros++
      const e = await jsonOuTexto(resCli)
      console.log(`x ${nome}: erro ao criar cliente — ${e?.mensagem ?? resCli.status}`)
      continue
    }
    const { id } = await resCli.json()
    criados++

    // --- Unidade (endereco) ---
    const cep = digitos(c[11])
    const uf = (c[8] ?? '').trim().toUpperCase()
    const unidade = {
      identificacaoInterna: 'Matriz',
      cep: cep.length === 8 ? cep : '',
      logradouro: texto(c[4], 160),
      numero: texto(c[5], 20),
      complemento: texto(c[7], 80),
      bairro: texto(c[6], 80),
      cidade: texto(c[9], 80),
      estado: /^[A-Z]{2}$/.test(uf) ? uf : '',
    }
    const resUni = await post(`/clientes/${id}/unidades`, unidade)
    if (!resUni.ok) {
      const e = await jsonOuTexto(resUni)
      console.log(`  ! ${nome}: unidade nao criada — ${e?.mensagem ?? resUni.status}`)
    }

    // --- Contato ---
    const nomeContato = texto(c[3], 120)
    const telefone = texto(c[12], 20)
    const primeiroEmail = (c[15] ?? '').split(',')[0].trim()
    const email = emailValido(primeiroEmail) ? primeiroEmail.slice(0, 160) : undefined

    if (nomeContato || telefone || email) {
      const contato = {
        nome: nomeContato ?? 'Contato principal',
        telefone,
        email,
      }
      const resCon = await post(`/clientes/${id}/contatos`, contato)
      if (!resCon.ok) {
        const e = await jsonOuTexto(resCon)
        console.log(`  ! ${nome}: contato nao criado — ${e?.mensagem ?? resCon.status}`)
      }
    }

    console.log(`+ ${nome}`)
  }

  console.log('')
  console.log(`Concluido. Criados: ${criados} · Duplicados: ${duplicados} · Erros: ${erros}`)
}

main().catch((e) => {
  console.error('Falha inesperada:', e)
  process.exit(1)
})
