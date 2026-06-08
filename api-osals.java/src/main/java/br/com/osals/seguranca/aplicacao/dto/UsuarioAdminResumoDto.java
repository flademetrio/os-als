package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Usuario;

/** Item da listagem de usuarios na administracao. */
public record UsuarioAdminResumoDto(Long id, String nome, String email, Papel papel, boolean ativo) {

    public static UsuarioAdminResumoDto de(Usuario u) {
        return new UsuarioAdminResumoDto(u.getId(), u.getNome(), u.getEmail(), u.getPapel(), u.isAtivo());
    }
}
