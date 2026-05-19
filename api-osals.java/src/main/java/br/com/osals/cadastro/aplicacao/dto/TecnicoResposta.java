package br.com.osals.cadastro.aplicacao.dto;

public record TecnicoResposta(
        Long id,
        String nome,
        String email,
        String especialidade,
        String telefone,
        long valorHoraCentavos,
        boolean ativo
) {
}
