package br.com.osals.cadastro.aplicacao.dto;

/** Versao compacta para selects (ex.: tecnicos vinculados a uma OS). */
public record TecnicoResumoDto(
        Long id,
        String nome,
        String especialidade,
        boolean ativo
) {
}
