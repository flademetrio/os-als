package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.TipoCobranca;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Dados da cobranca de um Servico. O valor so e exigido quando tipo = COBRADO
 * (validado no dominio/gestor).
 */
public record CobrancaRequisicao(

        @NotNull(message = "informe o tipo de cobranca")
        TipoCobranca tipo,

        @Min(value = 0, message = "valorCentavos nao pode ser negativo")
        Long valorCentavos,

        @Min(value = 0, message = "diasPrevistos nao pode ser negativo")
        Integer diasPrevistos,

        @Min(value = 0, message = "qtdePessoas nao pode ser negativo")
        Integer qtdePessoas,

        @Size(max = 2000, message = "obs deve ter no maximo 2000 caracteres")
        String obs
) {
}
