package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.StatusVeiculo;

/** Versao compacta para listagens e selects (ex.: veiculos vinculados a uma OS). */
public record VeiculoResumoDto(
        Long id,
        String placa,
        String modelo,
        StatusVeiculo status
) {
}
