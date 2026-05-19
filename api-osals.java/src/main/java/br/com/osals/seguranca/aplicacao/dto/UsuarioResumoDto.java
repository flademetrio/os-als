package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Usuario;

/**
 * Resumo do usuario logado retornado em respostas de login/eu.
 * Nao expoe senha, hash, versao_token, etc.
 */
public record UsuarioResumoDto(
        Long id,
        String nome,
        String email,
        Papel papel
) {

    public static UsuarioResumoDto de(Usuario u) {
        return new UsuarioResumoDto(u.getId(), u.getNome(), u.getEmail(), u.getPapel());
    }
}
