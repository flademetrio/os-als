package br.com.osals.servico.aplicacao.dto;

import br.com.osals.servico.dominio.EmpresaServico;
import br.com.osals.servico.dominio.StatusServico;
import java.time.LocalDate;

/** Versao compacta de Servico para listagens paginadas. */
public record ServicoResumoDto(
        Long id,
        Integer numero,
        String numeroFormatado,
        Long clienteId,
        String clienteNome,
        String tipoServicoNome,
        String descricao,
        EmpresaServico empresa,
        LocalDate dataInicioPrevista,
        StatusServico status,
        String statusRotulo
) {
}
