package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.ClienteResposta;
import br.com.osals.cadastro.aplicacao.dto.ClienteResumoDto;
import br.com.osals.cadastro.aplicacao.dto.ContatoClienteResposta;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoResposta;
import br.com.osals.cadastro.aplicacao.dto.EquipamentoResumoDto;
import br.com.osals.cadastro.aplicacao.dto.UnidadeResposta;
import br.com.osals.cadastro.aplicacao.dto.VeiculoResposta;
import br.com.osals.cadastro.aplicacao.dto.VeiculoResumoDto;
import br.com.osals.cadastro.dominio.Cliente;
import br.com.osals.cadastro.dominio.ContatoCliente;
import br.com.osals.cadastro.dominio.Equipamento;
import br.com.osals.cadastro.dominio.Unidade;
import br.com.osals.cadastro.dominio.Veiculo;
import org.springframework.stereotype.Component;

@Component
public class MapperCadastro {

    public ClienteResposta paraClienteResposta(Cliente c) {
        return new ClienteResposta(
                c.getId(),
                c.getTipoPessoa(),
                c.getDocumento(),
                c.getNome(),
                c.getNomeFantasia(),
                c.isAtivo(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    public ClienteResumoDto paraClienteResumo(Cliente c) {
        return new ClienteResumoDto(c.getId(), c.getTipoPessoa(), c.getDocumento(),
                c.getNome(), c.getNomeFantasia(), c.isAtivo());
    }

    public UnidadeResposta paraUnidadeResposta(Unidade u) {
        return new UnidadeResposta(
                u.getId(),
                u.getCliente().getId(),
                u.getIdentificacaoInterna(),
                u.getCep(),
                u.getLogradouro(),
                u.getNumero(),
                u.getComplemento(),
                u.getBairro(),
                u.getCidade(),
                u.getEstado(),
                u.isAtivo()
        );
    }

    public ContatoClienteResposta paraContatoResposta(ContatoCliente c) {
        return new ContatoClienteResposta(
                c.getId(),
                c.getCliente().getId(),
                c.getNome(),
                c.getFuncao(),
                c.getTelefone(),
                c.getEmail()
        );
    }

    public EquipamentoResposta paraEquipamentoResposta(Equipamento e) {
        return new EquipamentoResposta(
                e.getId(),
                e.getUnidade().getId(),
                e.getUnidade().getCliente().getId(),
                e.getMarca(),
                e.getModelo(),
                e.getNumeroSerie(),
                e.getTipo(),
                e.getCapacidadeBtus(),
                e.getCapacidadeTr(),
                e.getLocalizacaoInterna(),
                e.getDataInstalacao(),
                e.getDataUltimaManutencao(),
                e.getStatus(),
                e.isAtivo()
        );
    }

    public EquipamentoResumoDto paraEquipamentoResumo(Equipamento e) {
        var unidade = e.getUnidade();
        var cliente = unidade.getCliente();
        return new EquipamentoResumoDto(
                e.getId(),
                unidade.getId(),
                unidade.getIdentificacaoInterna(),
                cliente.getId(),
                cliente.getNome(),
                e.getTipo(),
                e.getMarca(),
                e.getModelo(),
                e.getLocalizacaoInterna(),
                e.getStatus(),
                e.isAtivo()
        );
    }

    public VeiculoResposta paraVeiculoResposta(Veiculo v) {
        return new VeiculoResposta(
                v.getId(),
                v.getPlaca(),
                v.getMarca(),
                v.getModelo(),
                v.getAno(),
                v.getStatus(),
                v.isAtivo()
        );
    }

    public VeiculoResumoDto paraVeiculoResumo(Veiculo v) {
        return new VeiculoResumoDto(v.getId(), v.getPlaca(), v.getModelo(), v.getStatus());
    }
}
