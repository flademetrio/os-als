package br.com.osals.ordemservico.aplicacao.dto;

/** Referencia compacta de um contato do cliente vinculado a OS. */
public record OsContatoDto(Long id, String nome, String funcao, String telefone, String email) {
}
