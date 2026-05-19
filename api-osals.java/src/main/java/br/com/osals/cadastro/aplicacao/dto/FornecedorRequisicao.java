package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.TipoPessoa;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FornecedorRequisicao(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 160) String nome,

        TipoPessoa tipoPessoa,

        @Pattern(regexp = "|\\d{11}|\\d{14}",
                 message = "Documento deve ter 11 (CPF) ou 14 (CNPJ) digitos, ou ser vazio")
        String documento,

        @Size(max = 20) String telefone,

        @Email(message = "email invalido") @Size(max = 160) String email
) {
}
