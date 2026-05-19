package br.com.osals.cadastro.aplicacao.dto;

import br.com.osals.cadastro.dominio.StatusEquipamento;
import br.com.osals.cadastro.dominio.TipoEquipamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EquipamentoRequisicao(
        @Size(max = 60)
        String marca,

        @Size(max = 60)
        String modelo,

        @Size(max = 60)
        String numeroSerie,

        @NotNull(message = "tipo e obrigatorio")
        TipoEquipamento tipo,

        @Min(value = 0, message = "BTUs nao pode ser negativo")
        Integer capacidadeBtus,

        @DecimalMin(value = "0.00", message = "TR nao pode ser negativo")
        BigDecimal capacidadeTr,

        @Size(max = 120)
        String localizacaoInterna,

        LocalDate dataInstalacao,
        LocalDate dataUltimaManutencao,

        StatusEquipamento status
) {
}
