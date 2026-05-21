package br.com.osals.ordemservico.aplicacao;

import br.com.osals.cadastro.dominio.Equipamento;
import br.com.osals.cadastro.dominio.Veiculo;
import br.com.osals.ordemservico.aplicacao.dto.OrdemServicoResposta;
import br.com.osals.ordemservico.aplicacao.dto.OrdemServicoResumoDto;
import br.com.osals.ordemservico.aplicacao.dto.OsEquipamentoDto;
import br.com.osals.ordemservico.aplicacao.dto.OsTecnicoDto;
import br.com.osals.ordemservico.aplicacao.dto.OsVeiculoDto;
import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.seguranca.dominio.Tecnico;
import br.com.osals.seguranca.dominio.Usuario;
import br.com.osals.servico.dominio.Servico;
import java.util.List;
import org.springframework.stereotype.Component;

/** Converte a entidade OrdemServico para os DTOs de saida. */
@Component
public class MapperOrdemServico {

    public OrdemServicoResposta paraResposta(OrdemServico os) {
        Servico s = os.getServico();
        return new OrdemServicoResposta(
                os.getId(),
                os.getNumero(),
                codigoExibicao(s.getNumero(), os.getNumero()),
                s.getId(),
                s.getNumero(),
                String.format("%04d", s.getNumero()),
                s.getCliente().getId(),
                s.getCliente().getNome(),
                s.getTipoServico().getNome(),
                os.getDescricaoAtividade(),
                os.getStatus(),
                os.getStatus().getRotulo(),
                os.getDataAgendada(),
                os.getDataAbertura(),
                os.getDataImpressao(),
                os.getHoraInicioExecucao(),
                os.getHoraFimExecucao(),
                os.getOQueFoiFeito(),
                os.getObservacoes(),
                os.getImpedimentos(),
                os.getDigitadoEm(),
                nomeDe(os.getDigitadoPor()),
                os.getCreatedAt(),
                nomeDe(os.getCreatedBy()),
                os.getTecnicos().stream().map(MapperOrdemServico::paraTecnicoDto).toList(),
                os.getVeiculos().stream().map(MapperOrdemServico::paraVeiculoDto).toList(),
                os.getEquipamentos().stream().map(MapperOrdemServico::paraEquipamentoDto).toList()
        );
    }

    public OrdemServicoResumoDto paraResumo(OrdemServico os) {
        Servico s = os.getServico();
        return new OrdemServicoResumoDto(
                os.getId(),
                os.getNumero(),
                codigoExibicao(s.getNumero(), os.getNumero()),
                s.getId(),
                s.getCliente().getId(),
                s.getCliente().getNome(),
                os.getDescricaoAtividade(),
                os.getStatus(),
                os.getStatus().getRotulo(),
                os.getDataAgendada(),
                os.getDataAbertura()
        );
    }

    /** Codigo de exibicao SSSS-NNNNN (servico pai com 4 digitos, OS com 5). */
    static String codigoExibicao(Integer numeroServico, Integer numeroOs) {
        return String.format("%04d-%05d", numeroServico, numeroOs);
    }

    static OsTecnicoDto paraTecnicoDto(Tecnico t) {
        return new OsTecnicoDto(t.getUsuarioId(), t.getUsuario().getNome(), t.getEspecialidade());
    }

    static OsVeiculoDto paraVeiculoDto(Veiculo v) {
        return new OsVeiculoDto(v.getId(), v.getPlaca(), v.getMarca(), v.getModelo());
    }

    static OsEquipamentoDto paraEquipamentoDto(Equipamento e) {
        return new OsEquipamentoDto(e.getId(), e.getMarca(), e.getModelo(),
                e.getNumeroSerie(), e.getLocalizacaoInterna());
    }

    public List<OsEquipamentoDto> equipamentosDto(OrdemServico os) {
        return os.getEquipamentos().stream().map(MapperOrdemServico::paraEquipamentoDto).toList();
    }

    private static String nomeDe(Usuario u) {
        return u == null ? null : u.getNome();
    }
}
