package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Permissao;

/** Item do catalogo de permissoes, para a tela de administracao. */
public record PermissaoDto(String nome, String grupo, String descricao) {

    public static PermissaoDto de(Permissao p) {
        return new PermissaoDto(p.name(), p.getGrupo(), p.getDescricao());
    }
}
