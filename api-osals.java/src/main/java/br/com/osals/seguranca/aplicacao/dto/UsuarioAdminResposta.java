package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Permissao;
import br.com.osals.seguranca.dominio.Usuario;
import java.util.List;

/**
 * Detalhe de um usuario na administracao, com as permissoes CONCEDIDAS
 * (o que esta gravado em usuario_permissao). Para ADMIN o conjunto gravado
 * pode estar vazio, mas as permissoes efetivas em runtime sao todas.
 */
public record UsuarioAdminResposta(
        Long id,
        String nome,
        String email,
        Papel papel,
        boolean ativo,
        List<String> permissoes
) {

    public static UsuarioAdminResposta de(Usuario u) {
        List<String> permissoes = u.getPermissoes().stream()
                .map(Permissao::name)
                .sorted()
                .toList();
        return new UsuarioAdminResposta(u.getId(), u.getNome(), u.getEmail(), u.getPapel(), u.isAtivo(), permissoes);
    }
}
