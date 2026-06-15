package br.com.osals.servico.aplicacao;

import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.FaturamentoResposta;
import br.com.osals.servico.aplicacao.dto.NotaFiscalRequisicao;
import br.com.osals.servico.aplicacao.dto.NotaFiscalResposta;
import br.com.osals.servico.dominio.Cobranca;
import br.com.osals.servico.dominio.NotaFiscal;
import br.com.osals.servico.dominio.RepositorioCobranca;
import br.com.osals.servico.dominio.RepositorioNotaFiscal;
import br.com.osals.servico.dominio.RepositorioServico;
import br.com.osals.servico.dominio.Servico;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra o faturamento de um Servico: as notas fiscais (1:N) e o ciclo
 * AGUARDANDO -> FECHADO. So pode fechar quando a soma das NFs bate exatamente
 * com o valor da cobranca (tipo COBRADO). Independente de concluir o Servico.
 */
@Service
@Transactional(readOnly = true)
public class GestorFaturamento {

    private static final Logger log = LoggerFactory.getLogger(GestorFaturamento.class);

    private final RepositorioNotaFiscal repositorio;
    private final RepositorioCobranca repositorioCobranca;
    private final RepositorioServico repositorioServico;
    private final MapperFaturamento mapper;

    public GestorFaturamento(RepositorioNotaFiscal repositorio,
                             RepositorioCobranca repositorioCobranca,
                             RepositorioServico repositorioServico,
                             MapperFaturamento mapper) {
        this.repositorio = repositorio;
        this.repositorioCobranca = repositorioCobranca;
        this.repositorioServico = repositorioServico;
        this.mapper = mapper;
    }

    public FaturamentoResposta buscar(Long servicoId) {
        Servico servico = servicoObrigatorio(servicoId);
        Cobranca cobranca = repositorioCobranca.findByServicoId(servicoId)
                .orElseGet(() -> new Cobranca(servico, servico.getCreatedBy()));
        var notas = repositorio.findByServicoIdOrderById(servicoId);
        return mapper.paraFaturamentoResposta(cobranca, notas);
    }

    @Transactional
    public NotaFiscalResposta adicionar(Long servicoId, NotaFiscalRequisicao req, Usuario autor) {
        Servico servico = servicoObrigatorio(servicoId);
        validarPodeAlterarNotas(servico, servicoId, autor);

        var nf = new NotaFiscal(servico, autor);
        nf.aplicar(req.numero().trim(), req.dataEmissao(), req.valorCentavos());
        var salva = repositorio.save(nf);
        log.info("NF {} adicionada ao servico {} (valor={})", salva.getId(), servicoId, salva.getValorCentavos());
        return mapper.paraNotaResposta(salva);
    }

    @Transactional
    public NotaFiscalResposta editar(Long servicoId, Long nfId, NotaFiscalRequisicao req, Usuario autor) {
        var nf = notaObrigatoria(servicoId, nfId);
        validarPodeAlterarNotas(nf.getServico(), servicoId, autor);
        nf.aplicar(req.numero().trim(), req.dataEmissao(), req.valorCentavos());
        nf.marcarAtualizadoPor(autor);
        log.info("NF {} editada no servico {}", nfId, servicoId);
        return mapper.paraNotaResposta(nf);
    }

    @Transactional
    public void excluir(Long servicoId, Long nfId, Usuario autor) {
        var nf = notaObrigatoria(servicoId, nfId);
        validarPodeAlterarNotas(nf.getServico(), servicoId, autor);
        repositorio.delete(nf);
        log.info("NF {} excluida do servico {}", nfId, servicoId);
    }

    @Transactional
    public FaturamentoResposta fechar(Long servicoId, Usuario autor) {
        Servico servico = servicoObrigatorio(servicoId);
        validarPermissaoAlteracao(servico, autor);
        Cobranca cobranca = cobrancaObrigatoria(servicoId);

        if (!cobranca.ehCobrado()) {
            throw new NegocioException("So e possivel fechar o faturamento de uma cobranca do tipo Cobrado.");
        }
        var notas = repositorio.findByServicoIdOrderById(servicoId);
        long total = notas.stream().mapToLong(NotaFiscal::getValorCentavos).sum();
        long valor = cobranca.getValorCentavos() == null ? 0 : cobranca.getValorCentavos();
        if (total != valor) {
            throw new NegocioException(
                    "A soma das notas fiscais precisa bater com o valor da cobranca para fechar o faturamento.");
        }
        cobranca.fechar(autor);
        log.info("Faturamento do servico {} fechado por usuario {}", servicoId, autor.getId());
        return mapper.paraFaturamentoResposta(cobranca, notas);
    }

    @Transactional
    public FaturamentoResposta reabrir(Long servicoId, Usuario autor) {
        servicoObrigatorio(servicoId);
        Cobranca cobranca = cobrancaObrigatoria(servicoId);
        cobranca.reabrir(autor);
        log.info("Faturamento do servico {} reaberto por usuario {} (admin)", servicoId, autor.getId());
        var notas = repositorio.findByServicoIdOrderById(servicoId);
        return mapper.paraFaturamentoResposta(cobranca, notas);
    }

    private void validarPodeAlterarNotas(Servico servico, Long servicoId, Usuario autor) {
        validarPermissaoAlteracao(servico, autor);
        Cobranca cobranca = repositorioCobranca.findByServicoId(servicoId).orElse(null);
        if (cobranca != null && cobranca.faturamentoFechado()) {
            throw new NegocioException("Faturamento fechado: reabra para alterar as notas fiscais.");
        }
    }

    private void validarPermissaoAlteracao(Servico servico, Usuario autor) {
        if (servico.estaEncerrado()
                && autor.getPapel() != Papel.GERENTE
                && autor.getPapel() != Papel.ADMIN) {
            throw new AccessDeniedException(
                    "Servico encerrado: apenas gerente ou admin podem alterar o faturamento.");
        }
    }

    private Servico servicoObrigatorio(Long servicoId) {
        return repositorioServico.findById(servicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado."));
    }

    private Cobranca cobrancaObrigatoria(Long servicoId) {
        return repositorioCobranca.findByServicoId(servicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Configure a cobranca do servico antes de fechar o faturamento."));
    }

    private NotaFiscal notaObrigatoria(Long servicoId, Long nfId) {
        var nf = repositorio.findById(nfId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Nota fiscal nao encontrada."));
        if (!nf.getServico().getId().equals(servicoId)) {
            throw new RecursoNaoEncontradoException("Nota fiscal nao pertence a este Servico.");
        }
        return nf;
    }
}
