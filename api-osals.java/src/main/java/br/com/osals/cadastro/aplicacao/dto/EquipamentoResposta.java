package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.StatusEquipamento;
import br.com.osals.cadastro.dominio.TipoEquipamento;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EquipamentoResposta(
        Long id,
        Long unidadeId,
        Long clienteId,
        String marca,
        String modelo,
        String numeroSerie,
        TipoEquipamento tipo,
        Integer capacidadeBtus,
        BigDecimal capacidadeTr,
        String localizacaoInterna,
        LocalDate dataInstalacao,
        LocalDate dataUltimaManutencao,
        StatusEquipamento status,
        boolean ativo
) {
}
