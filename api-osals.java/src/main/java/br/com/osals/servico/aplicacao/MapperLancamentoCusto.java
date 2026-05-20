package br.com.osals.servico.aplicacao;

import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.LancamentoCustoResposta;
import br.com.osals.servico.dominio.LancamentoCusto;
import org.springframework.stereotype.Component;

/** Converte LancamentoCusto para o DTO de saida. */
@Component
public class MapperLancamentoCusto {

    public LancamentoCustoResposta paraResposta(LancamentoCusto l) {
        Tecnico t = l.getTecnico();
        return new LancamentoCustoResposta(
                l.getId(),
                l.getServico().getId(),
                l.getCategoriaCusto().getId(),
                l.getCategoriaCusto().getCodigo(),
                l.getCategoriaCusto().getNome(),
                l.getCategoriaCusto().getTipoLancamento(),
                l.getDescricao(),
                l.getValorTotalCentavos(),
                t == null ? null : t.getUsuarioId(),
                t == null ? null : t.getUsuario().getNome(),
                l.getHoras(),
                l.getValorHoraSnapshotCentavos(),
                l.getKm(),
                l.getValorKmSnapshotCentavos(),
                l.getCreatedAt(),
                nomeDe(l.getCreatedBy()),
                l.getUpdatedAt()
        );
    }

    private static String nomeDe(Usuario u) {
        return u == null ? null : u.getNome();
    }
}
