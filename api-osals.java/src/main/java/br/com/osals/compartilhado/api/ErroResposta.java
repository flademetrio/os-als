package br.com.osals.compartilhado.api;

import java.time.LocalDateTime;

/**
 * Resposta padronizada de erro da API. Retornado pelo {@link TratadorExcecoesGlobal}.
 *
 * @param codigo   duplica o HTTP status
 * @param mensagem texto em pt-BR amigavel (pode ser exibido ao usuario em 422/409)
 * @param timestamp data/hora do erro (ISO-8601)
 */
public record ErroResposta(int codigo, String mensagem, String timestamp) {

    public ErroResposta(int codigo, String mensagem) {
        this(codigo, mensagem, LocalDateTime.now().toString());
    }
}
