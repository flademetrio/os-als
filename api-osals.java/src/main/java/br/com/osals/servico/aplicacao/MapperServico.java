package br.com.osals.servico.aplicacao;

import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.aplicacao.dto.ServicoResposta;
import br.com.osals.servico.aplicacao.dto.ServicoResumoDto;
import br.com.osals.servico.dominio.Servico;
import org.springframework.stereotype.Component;

/** Converte a entidade Servico para os DTOs de saida. */
@Component
public class MapperServico {

    public ServicoResposta paraResposta(Servico s) {
        return new ServicoResposta(
                s.getId(),
                s.getNumero(),
                formatarNumero(s.getNumero()),
                s.getCliente().getId(),
                s.getCliente().getNome(),
                s.getTipoServico().getId(),
                s.getTipoServico().getNome(),
                s.getDescricao(),
                s.getDataInicioPrevista(),
                s.getDataFimPrevista(),
                s.getStatus(),
                s.getStatus().getRotulo(),
                s.getFinalizadoEm(),
                nomeDe(s.getFinalizadoPor()),
                s.getCreatedAt(),
                nomeDe(s.getCreatedBy()),
                s.getUpdatedAt()
        );
    }

    public ServicoResumoDto paraResumo(Servico s) {
        return new ServicoResumoDto(
                s.getId(),
                s.getNumero(),
                formatarNumero(s.getNumero()),
                s.getCliente().getId(),
                s.getCliente().getNome(),
                s.getTipoServico().getNome(),
                s.getDescricao(),
                s.getDataInicioPrevista(),
                s.getStatus(),
                s.getStatus().getRotulo()
        );
    }

    /** Numero exibido com 4 digitos e zero a esquerda (ex.: 0001). */
    static String formatarNumero(Integer numero) {
        return numero == null ? null : String.format("%04d", numero);
    }

    private static String nomeDe(Usuario u) {
        return u == null ? null : u.getNome();
    }
}
