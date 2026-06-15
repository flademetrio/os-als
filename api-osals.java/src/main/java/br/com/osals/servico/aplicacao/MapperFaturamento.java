package br.com.osals.servico.aplicacao;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.FaturamentoResposta;
import br.com.osals.servico.aplicacao.dto.NotaFiscalResposta;
import br.com.osals.servico.dominio.Cobranca;
import br.com.osals.servico.dominio.NotaFiscal;
import br.com.osals.servico.dominio.StatusFaturamento;
import java.util.List;
import org.springframework.stereotype.Component;

/** Converte notas fiscais e o estado do faturamento para os DTOs de saida. */
@Component
public class MapperFaturamento {

    public NotaFiscalResposta paraNotaResposta(NotaFiscal nf) {
        return new NotaFiscalResposta(
                nf.getId(),
                nf.getServico().getId(),
                nf.getNumero(),
                nf.getDataEmissao(),
                nf.getValorCentavos(),
                nf.getCreatedAt(),
                nomeDe(nf.getCreatedBy()),
                nf.getUpdatedAt()
        );
    }

    public FaturamentoResposta paraFaturamentoResposta(Cobranca cobranca, List<NotaFiscal> notas) {
        long total = notas.stream().mapToLong(NotaFiscal::getValorCentavos).sum();
        boolean aplicavel = cobranca.ehCobrado();
        Long valorCobranca = aplicavel ? cobranca.getValorCentavos() : null;
        Long diferenca = (aplicavel && valorCobranca != null) ? valorCobranca - total : null;
        boolean podeFechar = aplicavel
                && cobranca.getFaturamentoStatus() == StatusFaturamento.AGUARDANDO
                && valorCobranca != null
                && total == valorCobranca;

        return new FaturamentoResposta(
                cobranca.getServico().getId(),
                cobranca.getTipo(),
                aplicavel,
                cobranca.getFaturamentoStatus(),
                cobranca.getFaturamentoStatus().getRotulo(),
                valorCobranca,
                total,
                diferenca,
                podeFechar,
                cobranca.getFechadoEm(),
                nomeDe(cobranca.getFechadoPor()),
                notas.stream().map(this::paraNotaResposta).toList()
        );
    }

    private static String nomeDe(Usuario u) {
        return u == null ? null : u.getNome();
    }
}
