package br.com.osals.configuracao.aplicacao;

import br.com.osals.configuracao.aplicacao.dto.AtualizacaoConfiguracaoRequisicao;
import br.com.osals.configuracao.aplicacao.dto.ConfiguracaoResposta;
import br.com.osals.configuracao.dominio.Configuracao;
import br.com.osals.configuracao.dominio.RepositorioConfiguracao;
import br.com.osals.configuracao.dominio.TipoValorConfiguracao;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.seguranca.dominio.Usuario;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servico de configuracoes globais. Oferece:
 *  - Listagem e busca por chave (admin)
 *  - Atualizacao do valor com validacao por tipo (NUMBER aceita decimal; BOOLEAN true/false)
 *  - Getters tipados para uso interno (buscarLong, buscarBigDecimal, buscarString, buscarBoolean)
 *    com cache em memoria invalidado a cada atualizacao.
 */
@Service
@Transactional(readOnly = true)
public class ServicoConfiguracao {

    private static final Logger log = LoggerFactory.getLogger(ServicoConfiguracao.class);

    private final RepositorioConfiguracao repositorio;
    private final ConcurrentMap<String, String> cache = new ConcurrentHashMap<>();

    public ServicoConfiguracao(RepositorioConfiguracao repositorio) {
        this.repositorio = repositorio;
    }

    public List<ConfiguracaoResposta> listar() {
        return repositorio.findAll().stream().map(this::paraResposta).toList();
    }

    public ConfiguracaoResposta buscar(String chave) {
        return paraResposta(obrigatorio(chave));
    }

    @Transactional
    public ConfiguracaoResposta atualizar(String chave, AtualizacaoConfiguracaoRequisicao req, Usuario autor) {
        var c = obrigatorio(chave);
        validarValorConformeTipo(req.valor(), c.getTipo());
        c.atualizarValor(req.valor(), autor);
        cache.remove(chave);
        log.info("Configuracao atualizada: chave={} novo_valor={}", chave, req.valor());
        return paraResposta(c);
    }

    // --- Getters tipados para uso interno ---

    public String buscarString(String chave) {
        return cache.computeIfAbsent(chave, k -> obrigatorio(k).getValor());
    }

    public Long buscarLong(String chave) {
        return Long.parseLong(buscarString(chave));
    }

    public BigDecimal buscarBigDecimal(String chave) {
        return new BigDecimal(buscarString(chave));
    }

    public boolean buscarBoolean(String chave) {
        return Boolean.parseBoolean(buscarString(chave));
    }

    // --- Helpers ---

    private Configuracao obrigatorio(String chave) {
        return repositorio.findById(chave)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Configuracao '" + chave + "' nao encontrada."));
    }

    private void validarValorConformeTipo(String valor, TipoValorConfiguracao tipo) {
        switch (tipo) {
            case NUMBER -> {
                try {
                    new BigDecimal(valor);
                } catch (NumberFormatException e) {
                    throw new NegocioException("Valor invalido — esperado numero (NUMBER).");
                }
            }
            case BOOLEAN -> {
                if (!"true".equalsIgnoreCase(valor) && !"false".equalsIgnoreCase(valor)) {
                    throw new NegocioException("Valor invalido — esperado 'true' ou 'false' (BOOLEAN).");
                }
            }
            case STRING -> {
                // qualquer string e aceita (NotBlank ja garantiu nao-vazia)
            }
        }
    }

    private ConfiguracaoResposta paraResposta(Configuracao c) {
        return new ConfiguracaoResposta(
                c.getChave(),
                c.getValor(),
                c.getTipo(),
                c.getDescricao(),
                c.getUpdatedAt(),
                c.getUpdatedBy() != null ? c.getUpdatedBy().getNome() : null
        );
    }
}
