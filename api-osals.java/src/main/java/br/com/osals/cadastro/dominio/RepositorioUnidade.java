package br.com.osals.cadastro.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioUnidade extends JpaRepository<Unidade, Long> {

    List<Unidade> findByClienteIdAndAtivoTrueOrderByIdentificacaoInterna(Long clienteId);

    List<Unidade> findByClienteIdOrderByIdentificacaoInterna(Long clienteId);
}
