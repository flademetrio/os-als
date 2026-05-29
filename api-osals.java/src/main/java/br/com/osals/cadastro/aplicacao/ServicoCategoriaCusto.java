package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.AtualizacaoCategoriaCustoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.CategoriaCustoResposta;
import br.com.osals.cadastro.aplicacao.dto.CriacaoCategoriaCustoRequisicao;
import br.com.osals.cadastro.dominio.CategoriaCusto;
import br.com.osals.cadastro.dominio.RepositorioCategoriaCusto;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.servico.dominio.RepositorioLancamentoCusto;
import java.text.Normalizer;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin pode criar (tipo LIVRE), renomear/ativar/desativar e excluir
 * categorias. As 2 categorias estruturadas (MAO_OBRA, DESLOCAMENTO) ficam
 * protegidas contra exclusao — seus tipos estao acoplados a logica do app.
 * Categorias com lancamentos historicos nao podem ser excluidas (use o
 * desativar para tira-las dos formularios sem perder o historico).
 */
@Service
@Transactional(readOnly = true)
public class ServicoCategoriaCusto {

    private final RepositorioCategoriaCusto repositorio;
    private final RepositorioLancamentoCusto repositorioLancamento;

    public ServicoCategoriaCusto(RepositorioCategoriaCusto repositorio,
                                 RepositorioLancamentoCusto repositorioLancamento) {
        this.repositorio = repositorio;
        this.repositorioLancamento = repositorioLancamento;
    }

    public List<CategoriaCustoResposta> listar(boolean apenasAtivos) {
        var lista = apenasAtivos ? repositorio.findByAtivoTrueOrderByNome() : repositorio.findAllByOrderByNome();
        return lista.stream().map(this::paraResposta).toList();
    }

    @Transactional
    public CategoriaCustoResposta criar(CriacaoCategoriaCustoRequisicao req) {
        String nome = req.nome().trim();
        String codigo = gerarCodigoUnico(nome);
        var nova = new CategoriaCusto(codigo, nome);
        repositorio.save(nova);
        return paraResposta(nova);
    }

    @Transactional
    public CategoriaCustoResposta atualizar(Integer id, AtualizacaoCategoriaCustoRequisicao req) {
        var c = repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria de custo nao encontrada."));
        c.atualizar(req.nome().trim(), req.ativo());
        return paraResposta(c);
    }

    @Transactional
    public void excluir(Integer id) {
        var c = repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria de custo nao encontrada."));

        if (c.ehEstruturada()) {
            throw new NegocioException(
                    "Categoria '" + c.getNome() + "' nao pode ser excluida — o calculo dela "
                            + "esta integrado ao sistema. Voce pode desativa-la.");
        }

        long usos = repositorioLancamento.countByCategoriaCustoId(id);
        if (usos > 0) {
            throw new NegocioException(
                    "Existem " + usos + " lancamento(s) usando esta categoria. "
                            + "Desative-a para escondela dos formularios, mas o historico precisa "
                            + "ser preservado.");
        }

        repositorio.delete(c);
    }

    /**
     * Gera um codigo estavel a partir do nome (uppercase, sem acentos, com "_").
     * Se ja existir alguem usando, sufixa com _2, _3, ... ate achar livre.
     */
    private String gerarCodigoUnico(String nome) {
        String base = slug(nome);
        if (base.isEmpty()) base = "CATEGORIA";

        String candidato = base;
        int sufixo = 2;
        while (repositorio.findByCodigo(candidato).isPresent()) {
            String s = "_" + sufixo++;
            int maxLen = 20 - s.length();
            candidato = base.substring(0, Math.min(base.length(), maxLen)) + s;
            if (sufixo > 1000) {
                throw new DuplicidadeException("Nao foi possivel gerar um codigo unico para a categoria.");
            }
        }
        return candidato;
    }

    /** "Frete urgente" -> "FRETE_URGENTE" (max 20, sem acentos). */
    private static String slug(String s) {
        String norm = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
        return norm.length() > 20 ? norm.substring(0, 20).replaceAll("_+$", "") : norm;
    }

    private CategoriaCustoResposta paraResposta(CategoriaCusto c) {
        return new CategoriaCustoResposta(c.getId(), c.getCodigo(), c.getNome(), c.getTipoLancamento(), c.isAtivo());
    }
}
