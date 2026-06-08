package br.com.osals.seguranca.aplicacao.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

/**
 * Conjunto de permissoes concedidas ao usuario (substitui o conjunto atual).
 * Pode vir vazio (remove todas), mas nao nulo. Cada item deve ser o nome de
 * uma constante valida do enum Permissao.
 */
public record AtualizacaoPermissoesRequisicao(
        @NotNull(message = "permissoes e obrigatorio (use lista vazia para remover todas)")
        Set<String> permissoes
) {
}
