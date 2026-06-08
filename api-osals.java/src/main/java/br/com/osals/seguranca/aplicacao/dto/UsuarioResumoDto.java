package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Permissao;
import br.com.osals.seguranca.dominio.Usuario;
import java.util.List;

/**
 * Resumo do usuario logado retornado em respostas de login/refresh/eu.
 * Inclui as permissoes efetivas (nomes) para o frontend decidir o que mostrar.
 * Nao expoe senha, hash, versao_token, etc.
 */
public record UsuarioResumoDto(
        Long id,
        String nome,
        String email,
        Papel papel,
        List<String> permissoes
) {

    public static UsuarioResumoDto de(Usuario u) {
        List<String> permissoes = u.permissoesEfetivas().stream()
                .map(Permissao::name)
                .sorted()
                .toList();
        return new UsuarioResumoDto(u.getId(), u.getNome(), u.getEmail(), u.getPapel(), permissoes);
    }
}
