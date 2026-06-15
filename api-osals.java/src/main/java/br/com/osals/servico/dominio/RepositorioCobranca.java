package br.com.osals.servico.dominio;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioCobranca extends JpaRepository<Cobranca, Long> {

    Optional<Cobranca> findByServicoId(Long servicoId);

    void deleteByServicoId(Long servicoId);
}
