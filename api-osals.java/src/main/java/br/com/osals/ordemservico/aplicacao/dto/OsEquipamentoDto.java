package br.com.osals.ordemservico.aplicacao.dto;

/** Referencia compacta de um equipamento atendido pela OS. */
public record OsEquipamentoDto(
        Long id,
        String marca,
        String modelo,
        String numeroSerie,
        String localizacaoInterna
) {
}
