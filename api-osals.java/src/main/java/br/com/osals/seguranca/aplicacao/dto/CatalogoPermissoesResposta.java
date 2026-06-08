package br.com.osals.seguranca.aplicacao.dto;

import java.util.List;
import java.util.Map;

/**
 * Catalogo completo de permissoes + os presets por papel. A UI usa o catalogo
 * para montar os grupos de checkboxes e os presets para o botao "aplicar preset".
 * As chaves de {@code presets} sao os nomes dos papeis (ex.: "COMPRAS").
 */
public record CatalogoPermissoesResposta(
        List<PermissaoDto> permissoes,
        Map<String, List<String>> presets
) {
}
