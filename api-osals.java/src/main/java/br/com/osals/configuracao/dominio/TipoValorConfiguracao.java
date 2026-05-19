package br.com.osals.configuracao.dominio;

/**
 * Tipo do valor da configuracao. Usado para validacao na atualizacao
 * (o valor e sempre armazenado como string; o app interpreta conforme o tipo).
 */
public enum TipoValorConfiguracao {
    NUMBER,
    STRING,
    BOOLEAN
}
