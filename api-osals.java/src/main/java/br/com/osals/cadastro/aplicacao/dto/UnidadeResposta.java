package br.com.osals.cadastro.aplicacao.dto;

public record UnidadeResposta(
        Long id,
        Long clienteId,
        String identificacaoInterna,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        boolean ativo
) {
}
