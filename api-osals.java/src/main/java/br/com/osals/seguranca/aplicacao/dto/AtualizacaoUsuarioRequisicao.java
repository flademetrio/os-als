package br.com.osals.seguranca.aplicacao.dto;

import br.com.osals.seguranca.dominio.Papel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizacaoUsuarioRequisicao(
        @NotBlank(message = "nome e obrigatorio")
        @Size(max = 120)
        String nome,

        @NotNull(message = "papel e obrigatorio")
        Papel papel
) {
}
