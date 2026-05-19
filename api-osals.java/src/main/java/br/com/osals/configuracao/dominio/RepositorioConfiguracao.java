package br.com.osals.configuracao.dominio;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioConfiguracao extends JpaRepository<Configuracao, String> {
}
