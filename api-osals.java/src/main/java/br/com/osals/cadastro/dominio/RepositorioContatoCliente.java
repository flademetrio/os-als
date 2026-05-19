package br.com.osals.cadastro.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioContatoCliente extends JpaRepository<ContatoCliente, Long> {

    List<ContatoCliente> findByClienteIdOrderByNome(Long clienteId);
}
