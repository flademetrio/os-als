package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.EquipamentoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoResposta;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoResumoDto;
import br.com.osals.cadastro.dominio.Equipamento;
import br.com.osals.cadastro.dominio.RepositorioEquipamento;
import br.com.osals.cadastro.dominio.RepositorioUnidade;
import br.com.osals.cadastro.dominio.StatusEquipamento;
import br.com.osals.cadastro.dominio.TipoEquipamento;
import br.com.osals.cadastro.dominio.Unidade;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoEquipamento {

    private static final Logger log = LoggerFactory.getLogger(ServicoEquipamento.class);

    private final RepositorioEquipamento repositorio;
    private final RepositorioUnidade repositorioUnidade;
    private final MapperCadastro mapper;

    public ServicoEquipamento(RepositorioEquipamento repositorio,
                              RepositorioUnidade repositorioUnidade,
                              MapperCadastro mapper) {
        this.repositorio = repositorio;
        this.repositorioUnidade = repositorioUnidade;
        this.mapper = mapper;
    }

    public List<EquipamentoResposta> listarDaUnidade(Long unidadeId, boolean apenasAtivos) {
        var lista = apenasAtivos
                ? repositorio.findByUnidadeIdAndAtivoTrueOrderByLocalizacaoInterna(unidadeId)
                : repositorio.findByUnidadeIdOrderByLocalizacaoInterna(unidadeId);
        return lista.stream().map(mapper::paraEquipamentoResposta).toList();
    }

    public PaginaResposta<EquipamentoResumoDto> listarFiltrado(
            Long clienteId, Long unidadeId, TipoEquipamento tipo, StatusEquipamento status,
            String busca, boolean apenasAtivos, Pageable pageable
    ) {
        String b = (busca == null || busca.isBlank()) ? null : busca.trim();
        var page = repositorio.buscarFiltrado(clienteId, unidadeId, tipo, status, b, apenasAtivos, pageable);
        return PaginaResposta.de(page.map(mapper::paraEquipamentoResumo));
    }

    public EquipamentoResposta buscarPorId(Long id) {
        return mapper.paraEquipamentoResposta(obrigatorio(id));
    }

    @Transactional
    public EquipamentoResposta criar(Long unidadeId, EquipamentoRequisicao req) {
        Unidade u = repositorioUnidade.findById(unidadeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Unidade nao encontrada."));

        var equipamento = new Equipamento(u, req.tipo());
        equipamento.atualizarDados(
                normalizar(req.marca()), normalizar(req.modelo()), normalizar(req.numeroSerie()),
                req.tipo(),
                req.capacidadeBtus(), req.capacidadeTr(),
                normalizar(req.localizacaoInterna()),
                req.dataInstalacao(), req.dataUltimaManutencao(),
                req.status() != null ? req.status() : StatusEquipamento.ATIVO
        );
        repositorio.save(equipamento);
        log.info("Equipamento criado: id={} unidade={}", equipamento.getId(), unidadeId);
        return mapper.paraEquipamentoResposta(equipamento);
    }

    @Transactional
    public EquipamentoResposta atualizar(Long id, EquipamentoRequisicao req) {
        var e = obrigatorio(id);
        e.atualizarDados(
                normalizar(req.marca()), normalizar(req.modelo()), normalizar(req.numeroSerie()),
                req.tipo(),
                req.capacidadeBtus(), req.capacidadeTr(),
                normalizar(req.localizacaoInterna()),
                req.dataInstalacao(), req.dataUltimaManutencao(),
                req.status()
        );
        return mapper.paraEquipamentoResposta(e);
    }

    @Transactional
    public void inativar(Long id) {
        var e = obrigatorio(id);
        if (e.isAtivo()) e.inativar();
    }

    @Transactional
    public void reativar(Long id) {
        var e = obrigatorio(id);
        if (!e.isAtivo()) e.reativar();
    }

    Equipamento obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Equipamento nao encontrado."));
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
