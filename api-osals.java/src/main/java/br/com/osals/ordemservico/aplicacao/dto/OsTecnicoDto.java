package br.com.osals.ordemservico.aplicacao.dto;

/** Referencia compacta de um tecnico vinculado a OS. */
public record OsTecnicoDto(Long id, String nome, String especialidade) {
}
