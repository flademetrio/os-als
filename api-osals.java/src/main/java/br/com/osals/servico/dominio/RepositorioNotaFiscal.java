package br.com.osals.servico.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioNotaFiscal extends JpaRepository<NotaFiscal, Long> {

    List<NotaFiscal> findByServicoIdOrderById(Long servicoId);

    void deleteByServicoId(Long servicoId);
}
