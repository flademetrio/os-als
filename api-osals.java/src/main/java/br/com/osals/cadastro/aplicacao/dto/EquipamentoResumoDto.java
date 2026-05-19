package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.StatusEquipamento;
import br.com.osals.cadastro.dominio.TipoEquipamento;

/** Versao compacta para listagens e selects (ex.: equipamentos atendidos numa OS). */
public record EquipamentoResumoDto(
        Long id,
        Long unidadeId,
        TipoEquipamento tipo,
        String marca,
        String modelo,
        String localizacaoInterna,
        StatusEquipamento status,
        boolean ativo
) {
}
