package br.com.osals.compartilhado.util;

import java.util.Locale;

/**
 * Conversao entre representacao monetaria humana (string em reais) e centavos (long).
 *
 * Padrao do projeto: <b>centavos sempre</b> no banco, no transit e em qualquer calculo.
 * Conversao acontece somente na borda — entrada de formulario (parse) ou exibicao (format).
 *
 * Ver documentacao/09 §8 e documentacao/15 §5.
 */
public final class MoedaUtil {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private MoedaUtil() {
        // utilitario, nao instanciavel
    }

    /**
     * Converte uma string em reais (com ou sem mascara R$ e separadores) para centavos.
     *
     * <pre>
     * "R$ 299,90"   -> 29990
     * "1.234,56"    -> 123456
     * "10"          -> 1000
     * </pre>
     *
     * @throws NumberFormatException se a string nao for parseavel
     */
    public static long reaisParaCentavos(String reaisFormatado) {
        if (reaisFormatado == null || reaisFormatado.isBlank()) {
            throw new NumberFormatException("Valor em reais nao pode ser vazio");
        }
        String limpo = reaisFormatado
                .replace("R$", "")
                .replace(" ", "")
                .replace(".", "")
                .replace(",", ".")
                .trim();
        double valor = Double.parseDouble(limpo);
        return Math.round(valor * 100);
    }

    /**
     * Formata centavos como string de reais com prefixo "R$" e separadores pt-BR.
     *
     * <pre>
     * 29990  -> "R$ 299,90"
     * 100    -> "R$ 1,00"
     * </pre>
     */
    public static String centavosParaReais(long centavos) {
        return String.format(PT_BR, "R$ %,.2f", centavos / 100.0);
    }
}
