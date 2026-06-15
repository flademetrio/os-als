package br.com.osals.servico.aplicacao;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.CobrancaResposta;
import br.com.osals.servico.dominio.Cobranca;
import org.springframework.stereotype.Component;

/** Converte a entidade Cobranca para o DTO de saida. */
@Component
public class MapperCobranca {

    public CobrancaResposta paraResposta(Cobranca c) {
        return new CobrancaResposta(
                c.getServico().getId(),
                c.getTipo(),
                c.getTipo().getRotulo(),
                c.getValorCentavos(),
                c.getDiasPrevistos(),
                c.getQtdePessoas(),
                c.getObs(),
                c.getFaturamentoStatus(),
                c.getFaturamentoStatus().getRotulo(),
                c.getFechadoEm(),
                nomeDe(c.getFechadoPor()),
                c.getUpdatedAt()
        );
    }

    private static String nomeDe(Usuario u) {
        return u == null ? null : u.getNome();
    }
}
