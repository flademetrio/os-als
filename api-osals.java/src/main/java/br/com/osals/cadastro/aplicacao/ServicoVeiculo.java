package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.VeiculoRequisicao;
import br.com.osals.cadastro.aplicacao.dto.VeiculoResposta;
import br.com.osals.cadastro.aplicacao.dto.VeiculoResumoDto;
import br.com.osals.cadastro.dominio.RepositorioVeiculo;
import br.com.osals.cadastro.dominio.StatusVeiculo;
import br.com.osals.cadastro.dominio.Veiculo;
import br.com.osals.compartilhado.api.PaginaResposta;
import br.com.osals.compartilhado.excecoes.DuplicidadeException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ServicoVeiculo {

    private static final Logger log = LoggerFactory.getLogger(ServicoVeiculo.class);

    private final RepositorioVeiculo repositorio;
    private final MapperCadastro mapper;

    public ServicoVeiculo(RepositorioVeiculo repositorio, MapperCadastro mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public PaginaResposta<VeiculoResumoDto> listar(StatusVeiculo status, String busca,
                                                   boolean apenasAtivos, Pageable pageable) {
        String b = (busca == null || busca.isBlank()) ? null : busca.trim().toUpperCase();
        var page = repositorio.buscarFiltrado(status, b, apenasAtivos, pageable);
        return PaginaResposta.de(page.map(mapper::paraVeiculoResumo));
    }

    public VeiculoResposta buscarPorId(Long id) {
        return mapper.paraVeiculoResposta(obrigatorio(id));
    }

    @Transactional
    public VeiculoResposta criar(VeiculoRequisicao req) {
        String placa = normalizarPlaca(req.placa());
        if (repositorio.existsByPlaca(placa)) {
            throw new DuplicidadeException("Ja existe veiculo com esta placa.");
        }
        var v = new Veiculo(placa);
        v.atualizarDados(normalizar(req.marca()), normalizar(req.modelo()), req.ano(),
                req.status() != null ? req.status() : StatusVeiculo.ATIVO);
        repositorio.save(v);
        log.info("Veiculo criado: id={} placa={}", v.getId(), v.getPlaca());
        return mapper.paraVeiculoResposta(v);
    }

    @Transactional
    public VeiculoResposta atualizar(Long id, VeiculoRequisicao req) {
        var v = obrigatorio(id);
        // Placa nao alteravel via update (criar novo veiculo se placa muda — alinhamento legal)
        v.atualizarDados(normalizar(req.marca()), normalizar(req.modelo()), req.ano(), req.status());
        return mapper.paraVeiculoResposta(v);
    }

    @Transactional
    public void inativar(Long id) {
        var v = obrigatorio(id);
        if (v.isAtivo()) v.inativar();
    }

    @Transactional
    public void reativar(Long id) {
        var v = obrigatorio(id);
        if (!v.isAtivo()) v.reativar();
    }

    Veiculo obrigatorio(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Veiculo nao encontrado."));
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizarPlaca(String s) {
        return s == null ? null : s.replaceAll("[\\s-]", "").toUpperCase();
    }
}
