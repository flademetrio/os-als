package br.com.osals.servico.aplicacao;

import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.CobrancaRequisicao;
import br.com.osals.servico.aplicacao.dto.CobrancaResposta;
import br.com.osals.servico.dominio.Cobranca;
import br.com.osals.servico.dominio.RepositorioCobranca;
import br.com.osals.servico.dominio.RepositorioServico;
import br.com.osals.servico.dominio.Servico;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra a cobranca (1:1) de um Servico. A linha e criada junto com o Servico
 * (e por backfill nos existentes); aqui buscamos e atualizamos. Apos o Servico
 * encerrado, somente gerente e admin podem alterar (igual aos custos).
 */
@Service
@Transactional(readOnly = true)
public class GestorCobranca {

    private static final Logger log = LoggerFactory.getLogger(GestorCobranca.class);

    private final RepositorioCobranca repositorio;
    private final RepositorioServico repositorioServico;
    private final MapperCobranca mapper;

    public GestorCobranca(RepositorioCobranca repositorio,
                          RepositorioServico repositorioServico,
                          MapperCobranca mapper) {
        this.repositorio = repositorio;
        this.repositorioServico = repositorioServico;
        this.mapper = mapper;
    }

    public CobrancaResposta buscar(Long servicoId) {
        Servico servico = servicoObrigatorio(servicoId);
        Cobranca cobranca = repositorio.findByServicoId(servicoId)
                .orElseGet(() -> new Cobranca(servico, servico.getCreatedBy()));
        return mapper.paraResposta(cobranca);
    }

    @Transactional
    public CobrancaResposta salvar(Long servicoId, CobrancaRequisicao req, Usuario autor) {
        Servico servico = servicoObrigatorio(servicoId);
        validarPermissaoAlteracao(servico, autor);

        Cobranca cobranca = repositorio.findByServicoId(servicoId)
                .orElseGet(() -> new Cobranca(servico, autor));
        cobranca.editar(req.tipo(), req.valorCentavos(), req.diasPrevistos(),
                req.qtdePessoas(), normalizar(req.obs()), autor);
        Cobranca salva = repositorio.save(cobranca);
        log.info("Cobranca do servico {} salva: tipo={} valor={}",
                servicoId, salva.getTipo(), salva.getValorCentavos());
        return mapper.paraResposta(salva);
    }

    private void validarPermissaoAlteracao(Servico servico, Usuario autor) {
        if (servico.estaEncerrado()
                && autor.getPapel() != Papel.GERENTE
                && autor.getPapel() != Papel.ADMIN) {
            throw new AccessDeniedException(
                    "Servico encerrado: apenas gerente ou admin podem alterar a cobranca.");
        }
    }

    private Servico servicoObrigatorio(Long servicoId) {
        return repositorioServico.findById(servicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado."));
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
