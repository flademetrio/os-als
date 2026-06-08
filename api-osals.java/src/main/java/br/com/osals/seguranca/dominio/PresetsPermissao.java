package br.com.osals.seguranca.dominio;

import java.util.EnumSet;
import java.util.Set;

/**
 * Presets de permissoes por papel. Servem como ponto de partida ("aplicar
 * preset") na administracao de usuarios e para o seed inicial — o admin pode
 * ajustar permissao a permissao depois.
 *
 * ADMIN recebe todas as permissoes; em runtime isso e' garantido tambem por
 * {@link Usuario#permissoesEfetivas()} (admin nunca fica trancado).
 */
public final class PresetsPermissao {

    private PresetsPermissao() {
    }

    public static Set<Permissao> doPapel(Papel papel) {
        return switch (papel) {
            case ADMIN -> EnumSet.allOf(Permissao.class);

            case GERENTE -> EnumSet.of(
                    Permissao.SERVICO_VER,
                    Permissao.SERVICO_GERENCIAR,
                    Permissao.SERVICO_EXCLUIR,
                    Permissao.CUSTO_VER,
                    Permissao.CUSTO_EDITAR,
                    Permissao.RELATORIO_VER,
                    Permissao.CADASTRO_VER,
                    Permissao.CADASTRO_GERENCIAR,
                    Permissao.CONFIG_GERENCIAR);

            case COMPRAS -> EnumSet.of(
                    Permissao.SERVICO_VER,
                    Permissao.CUSTO_VER,
                    Permissao.CUSTO_EDITAR,
                    Permissao.RELATORIO_VER,
                    Permissao.CADASTRO_VER,
                    Permissao.CADASTRO_GERENCIAR);

            case OPERADOR -> EnumSet.of(
                    Permissao.SERVICO_VER,
                    Permissao.SERVICO_GERENCIAR,
                    Permissao.CADASTRO_VER,
                    Permissao.CADASTRO_GERENCIAR);

            case TECNICO -> EnumSet.of(
                    Permissao.SERVICO_VER,
                    Permissao.CADASTRO_VER);
        };
    }
}
