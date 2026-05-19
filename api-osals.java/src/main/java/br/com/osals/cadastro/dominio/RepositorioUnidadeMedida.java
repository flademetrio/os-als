package br.com.osals.cadastro.dominio;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioUnidadeMedida extends JpaRepository<UnidadeMedida, Integer> {
    Optional<UnidadeMedida> findBySigla(String sigla);
    boolean existsBySigla(String sigla);
}
