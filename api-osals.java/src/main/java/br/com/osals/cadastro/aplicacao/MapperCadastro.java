package br.com.osals.cadastro.aplicacao;

import br.com.osals.cadastro.aplicacao.dto.ClienteResposta;
import br.com.osals.cadastro.aplicacao.dto.ClienteResumoDto;
import br.com.osals.cadastro.aplicacao.dto.ContatoClienteResposta;
import br.com.osals.cadastro.aplicacao.dto.UnidadeResposta;
import br.com.osals.cadastro.dominio.Cliente;
import br.com.osals.cadastro.dominio.ContatoCliente;
import br.com.osals.cadastro.dominio.Unidade;
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
        return new ClienteResumoDto(c.getId(), c.getTipoPessoa(), c.getDocumento(), c.getNome(), c.isAtivo());
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
}
