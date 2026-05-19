package br.com.osals.seguranca.dominio;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioTecnico extends JpaRepository<Tecnico, Long> {
}
