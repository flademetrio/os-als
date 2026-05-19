package br.com.osals.cadastro.dominio;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioCategoriaCusto extends JpaRepository<CategoriaCusto, Integer> {
    List<CategoriaCusto> findByAtivoTrueOrderByNome();
    List<CategoriaCusto> findAllByOrderByNome();
    Optional<CategoriaCusto> findByCodigo(String codigo);
}
