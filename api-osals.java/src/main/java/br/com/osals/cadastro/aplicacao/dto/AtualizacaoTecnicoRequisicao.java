package br.com.osals.cadastro.aplicacao.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Atualizacao dos dados do tecnico. Email e senha tem endpoints proprios
 * (senha via PUT /tecnicos/{id}/senha; email nao e alteravel via API V1).
 */
public record AtualizacaoTecnicoRequisicao(
        @NotBlank(message = "nome e obrigatorio")
        @Size(max = 120)
        String nome,

        @NotNull(message = "valorHoraCentavos e obrigatorio")
        @Min(value = 0, message = "valorHoraCentavos nao pode ser negativo")
        Long valorHoraCentavos,

        @Size(max = 80)
        String especialidade,

        @Size(max = 20)
        String telefone
) {
}
