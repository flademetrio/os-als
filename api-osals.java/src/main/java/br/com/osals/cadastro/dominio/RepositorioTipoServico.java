package br.com.osals.cadastro.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioTipoServico extends JpaRepository<TipoServico, Integer> {
    List<TipoServico> findByAtivoTrueOrderByNome();
    List<TipoServico> findAllByOrderByNome();
    boolean existsByNomeIgnoreCase(String nome);
}
