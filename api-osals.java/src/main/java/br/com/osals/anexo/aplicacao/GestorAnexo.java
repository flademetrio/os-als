package br.com.osals.anexo.aplicacao;

import br.com.osals.anexo.aplicacao.dto.AnexoOsResposta;
import br.com.osals.anexo.aplicacao.dto.AnexoServicoResposta;
import br.com.osals.anexo.aplicacao.dto.ConteudoAnexo;
import br.com.osals.anexo.dominio.AnexoOs;
import br.com.osals.anexo.dominio.AnexoServico;
import br.com.osals.anexo.dominio.RepositorioAnexoOs;
import br.com.osals.anexo.dominio.RepositorioAnexoServico;
import br.com.osals.anexo.dominio.StorageGateway;
import br.com.osals.compartilhado.excecoes.ArquivoGrandeDemaisException;
import br.com.osals.compartilhado.excecoes.ArquivoInvalidoException;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.ordemservico.dominio.RepositorioOrdemServico;
import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.dominio.RepositorioServico;
import br.com.osals.servico.dominio.Servico;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Orquestra os anexos PDF de Servicos e OS: validacao do arquivo, gravacao no
 * storage e persistencia dos metadados.
 *
 * Validacao do PDF: content-type application/pdf, assinatura magica %PDF- e
 * tamanho dentro do limite (app.anexos.tamanho-max-mb).
 *
 * Regras de status: remover anexo (e substituir o da OS) apos o
 * Servico/OS encerrado exige gerente ou admin — operador recebe 403.
 */
@Service
@Transactional(readOnly = true)
public class GestorAnexo {

    private static final Logger log = LoggerFactory.getLogger(GestorAnexo.class);
    private static final byte[] ASSINATURA_PDF = "%PDF-".getBytes(StandardCharsets.US_ASCII);
    private static final String CONTENT_TYPE_PDF = "application/pdf";

    private final RepositorioAnexoServico repositorioAnexoServico;
    private final RepositorioAnexoOs repositorioAnexoOs;
    private final RepositorioServico repositorioServico;
    private final RepositorioOrdemServico repositorioOrdemServico;
    private final StorageGateway storage;
    private final long tamanhoMaximoBytes;

    public GestorAnexo(RepositorioAnexoServico repositorioAnexoServico,
                       RepositorioAnexoOs repositorioAnexoOs,
                       RepositorioServico repositorioServico,
                       RepositorioOrdemServico repositorioOrdemServico,
                       StorageGateway storage,
                       @Value("${app.anexos.tamanho-max-mb}") int tamanhoMaximoMb) {
        this.repositorioAnexoServico = repositorioAnexoServico;
        this.repositorioAnexoOs = repositorioAnexoOs;
        this.repositorioServico = repositorioServico;
        this.repositorioOrdemServico = repositorioOrdemServico;
        this.storage = storage;
        this.tamanhoMaximoBytes = (long) tamanhoMaximoMb * 1024 * 1024;
    }

    // ===== Anexos do Servico =====

    public List<AnexoServicoResposta> listarDoServico(Long servicoId) {
        servicoObrigatorio(servicoId);
        return repositorioAnexoServico.listarDoServico(servicoId).stream()
                .map(GestorAnexo::paraResposta).toList();
    }

    @Transactional
    public AnexoServicoResposta anexarAoServico(Long servicoId, MultipartFile arquivo,
                                                String descricao, Usuario autor) {
        Servico servico = servicoObrigatorio(servicoId);
        byte[] conteudo = validarPdf(arquivo);

        String chave = "servico/" + servicoId + "/" + UUID.randomUUID() + ".pdf";
        storage.armazenar(conteudo, chave);

        var anexo = new AnexoServico(servico, nomeLimpo(arquivo), normalizar(descricao),
                chave, CONTENT_TYPE_PDF, conteudo.length, autor);
        var salvo = repositorioAnexoServico.save(anexo);
        log.info("Anexo {} vinculado ao servico {}", salvo.getId(), servicoId);
        return paraResposta(salvo);
    }

    public ConteudoAnexo baixarAnexoServico(Long anexoId) {
        var anexo = repositorioAnexoServico.findById(anexoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anexo nao encontrado."));
        return new ConteudoAnexo(storage.recuperar(anexo.getStorageKey()),
                anexo.getNomeArquivo(), anexo.getContentType(), anexo.getTamanhoBytes());
    }

    @Transactional
    public void removerAnexoServico(Long servicoId, Long anexoId, Usuario autor) {
        var anexo = repositorioAnexoServico.findById(anexoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anexo nao encontrado."));
        if (!anexo.getServico().getId().equals(servicoId)) {
            throw new RecursoNaoEncontradoException("Anexo nao pertence a este Servico.");
        }
        if (anexo.getServico().estaEncerrado() && autor.getPapel() == Papel.OPERADOR) {
            throw new AccessDeniedException(
                    "Servico encerrado: apenas gerente ou admin podem remover anexos.");
        }
        repositorioAnexoServico.delete(anexo);
        storage.remover(anexo.getStorageKey());
        log.info("Anexo {} removido do servico {}", anexoId, servicoId);
    }

    // ===== Anexo da OS =====

    public AnexoOsResposta metadadosAnexoOs(Long osId) {
        var anexo = repositorioAnexoOs.findById(osId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("OS nao possui anexo."));
        return paraResposta(anexo);
    }

    @Transactional
    public AnexoOsResposta anexarNaOs(Long osId, MultipartFile arquivo, Usuario autor) {
        OrdemServico os = repositorioOrdemServico.findById(osId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ordem de servico nao encontrada."));
        var existente = repositorioAnexoOs.findById(osId).orElse(null);
        if (os.estaEncerrada() && existente != null && autor.getPapel() == Papel.OPERADOR) {
            throw new AccessDeniedException(
                    "OS encerrada: apenas gerente ou admin podem substituir o anexo.");
        }

        byte[] conteudo = validarPdf(arquivo);
        String chave = "os/" + osId + "/" + UUID.randomUUID() + ".pdf";
        storage.armazenar(conteudo, chave);

        AnexoOs anexo;
        if (existente == null) {
            anexo = new AnexoOs(os, nomeLimpo(arquivo), chave,
                    CONTENT_TYPE_PDF, conteudo.length, autor);
        } else {
            String chaveAntiga = existente.getStorageKey();
            existente.substituir(nomeLimpo(arquivo), chave, CONTENT_TYPE_PDF, conteudo.length, autor);
            anexo = existente;
            storage.remover(chaveAntiga);
        }
        var salvo = repositorioAnexoOs.save(anexo);
        log.info("Anexo da OS {} {}", osId, existente == null ? "criado" : "substituido");
        return paraResposta(salvo);
    }

    public ConteudoAnexo baixarAnexoOs(Long osId) {
        var anexo = repositorioAnexoOs.findById(osId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("OS nao possui anexo."));
        return new ConteudoAnexo(storage.recuperar(anexo.getStorageKey()),
                anexo.getNomeArquivo(), anexo.getContentType(), anexo.getTamanhoBytes());
    }

    @Transactional
    public void removerAnexoOs(Long osId, Usuario autor) {
        var anexo = repositorioAnexoOs.findById(osId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("OS nao possui anexo."));
        if (anexo.getOrdemServico().estaEncerrada() && autor.getPapel() == Papel.OPERADOR) {
            throw new AccessDeniedException(
                    "OS encerrada: apenas gerente ou admin podem remover o anexo.");
        }
        repositorioAnexoOs.delete(anexo);
        storage.remover(anexo.getStorageKey());
        log.info("Anexo da OS {} removido", osId);
    }

    // ===== Validacao =====

    /** Valida que o arquivo e um PDF dentro do limite e devolve seus bytes. */
    private byte[] validarPdf(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ArquivoInvalidoException("Nenhum arquivo enviado.");
        }
        if (arquivo.getSize() > tamanhoMaximoBytes) {
            throw new ArquivoGrandeDemaisException(
                    "Arquivo excede o tamanho maximo de " + (tamanhoMaximoBytes / 1024 / 1024) + " MB.");
        }
        if (!CONTENT_TYPE_PDF.equalsIgnoreCase(arquivo.getContentType())) {
            throw new ArquivoInvalidoException("Apenas arquivos PDF sao aceitos.");
        }
        byte[] conteudo;
        try {
            conteudo = arquivo.getBytes();
        } catch (IOException e) {
            throw new NegocioException("Falha ao ler o arquivo enviado.");
        }
        if (conteudo.length > tamanhoMaximoBytes) {
            throw new ArquivoGrandeDemaisException(
                    "Arquivo excede o tamanho maximo de " + (tamanhoMaximoBytes / 1024 / 1024) + " MB.");
        }
        if (!assinaturaPdfValida(conteudo)) {
            throw new ArquivoInvalidoException(
                    "O arquivo nao e um PDF valido (assinatura ausente).");
        }
        return conteudo;
    }

    private static boolean assinaturaPdfValida(byte[] conteudo) {
        if (conteudo.length < ASSINATURA_PDF.length) {
            return false;
        }
        for (int i = 0; i < ASSINATURA_PDF.length; i++) {
            if (conteudo[i] != ASSINATURA_PDF[i]) {
                return false;
            }
        }
        return true;
    }

    // ===== Helpers =====

    private Servico servicoObrigatorio(Long servicoId) {
        return repositorioServico.findById(servicoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado."));
    }

    private static AnexoServicoResposta paraResposta(AnexoServico a) {
        return new AnexoServicoResposta(
                a.getId(), a.getServico().getId(), a.getNomeArquivo(), a.getDescricao(),
                a.getContentType(), a.getTamanhoBytes(), a.getCreatedAt(),
                a.getCreatedBy() != null ? a.getCreatedBy().getNome() : null);
    }

    private static AnexoOsResposta paraResposta(AnexoOs a) {
        return new AnexoOsResposta(
                a.getOsId(), a.getNomeArquivo(), a.getContentType(), a.getTamanhoBytes(),
                a.getCreatedAt(), a.getCreatedBy() != null ? a.getCreatedBy().getNome() : null);
    }

    /** Nome base do arquivo, sem caminho, limitado a 255 caracteres. */
    private static String nomeLimpo(MultipartFile arquivo) {
        String nome = arquivo.getOriginalFilename();
        if (nome == null || nome.isBlank()) {
            return "anexo.pdf";
        }
        nome = nome.replace('\\', '/');
        int barra = nome.lastIndexOf('/');
        if (barra >= 0) {
            nome = nome.substring(barra + 1);
        }
        nome = nome.trim();
        return nome.length() > 255 ? nome.substring(nome.length() - 255) : nome;
    }

    private static String normalizar(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
