package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.StatusVeiculo;

public record VeiculoResposta(
        Long id,
        String placa,
        String marca,
        String modelo,
        Integer ano,
        StatusVeiculo status,
        boolean ativo
) {
}
