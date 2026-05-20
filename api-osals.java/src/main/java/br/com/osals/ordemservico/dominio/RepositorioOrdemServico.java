package br.com.osals.ordemservico.dominio;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioOrdemServico extends JpaRepository<OrdemServico, Long> {

    /** Proximo valor da sequencia global de numeracao de OS. */
    @Query(value = "SELECT nextval('os_numero_seq')", nativeQuery = true)
    Long proximoNumero();

    /** Carrega a OS com todas as colecoes — usado na geracao do PDF e no detalhe. */
    @EntityGraph(attributePaths = {"tecnicos", "veiculos", "equipamentos",
            "servico", "servico.cliente", "servico.tipoServico"})
    Optional<OrdemServico> findWithRelacionamentosById(Long id);

    List<OrdemServico> findByServicoIdOrderByNumero(Long servicoId);

    @Query(
            value = """
            SELECT os FROM OrdemServico os
            JOIN FETCH os.servico s
            JOIN FETCH s.cliente c
            WHERE (:status IS NULL OR os.status = :status)
              AND (:servicoId IS NULL OR s.id = :servicoId)
              AND (:clienteId IS NULL OR c.id = :clienteId)
              AND (:busca = '' OR LOWER(os.descricaoAtividade) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR CAST(os.numero AS string) LIKE CONCAT('%', :busca, '%'))
            """,
            countQuery = """
            SELECT COUNT(os) FROM OrdemServico os
            WHERE (:status IS NULL OR os.status = :status)
              AND (:servicoId IS NULL OR os.servico.id = :servicoId)
              AND (:clienteId IS NULL OR os.servico.cliente.id = :clienteId)
              AND (:busca = '' OR LOWER(os.descricaoAtividade) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR CAST(os.numero AS string) LIKE CONCAT('%', :busca, '%'))
            """)
    Page<OrdemServico> buscarFiltrado(
            @Param("status") StatusOrdemServico status,
            @Param("servicoId") Long servicoId,
            @Param("clienteId") Long clienteId,
            @Param("busca") String busca,
            Pageable pageable
    );
}
