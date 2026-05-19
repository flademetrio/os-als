package br.com.osals.cadastro.aplicacao.dto;

public record ContatoClienteResposta(
        Long id,
        Long clienteId,
        String nome,
        String funcao,
        String telefone,
        String email
) {
}
