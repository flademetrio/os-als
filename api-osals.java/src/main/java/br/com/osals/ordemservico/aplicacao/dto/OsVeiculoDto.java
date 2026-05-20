package br.com.osals.ordemservico.aplicacao.dto;

/** Referencia compacta de um veiculo vinculado a OS. */
public record OsVeiculoDto(Long id, String placa, String marca, String modelo) {
}
