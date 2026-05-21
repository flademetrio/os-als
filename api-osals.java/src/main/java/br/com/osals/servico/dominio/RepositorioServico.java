package br.com.osals.servico.dominio;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioServico extends JpaRepository<Servico, Long> {

    /** Proximo valor da sequencia global de numeracao de Servico. */
    @Query(value = "SELECT nextval('servico_numero_seq')", nativeQuery = true)
    Long proximoNumero();

    /**
     * Lista paginada de Servicos. O parametro status e sempre uma lista
     * nao vazia (o GestorServico usa todos os status quando nao ha filtro).
     * A busca textual cobre o numero do Servico e o nome do cliente.
     */
    @Query(
            value = """
            SELECT s FROM Servico s
            JOIN FETCH s.cliente c
            JOIN FETCH s.tipoServico t
            WHERE s.status IN :status
              AND (:clienteId IS NULL OR c.id = :clienteId)
              AND (:tipoServicoId IS NULL OR t.id = :tipoServicoId)
              AND (:inicio IS NULL OR s.dataInicioPrevista >= :inicio)
              AND (:fim IS NULL OR s.dataInicioPrevista <= :fim)
              AND (:busca = '' OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR CAST(s.numero AS string) LIKE CONCAT('%', :busca, '%'))
            """,
            countQuery = """
            SELECT COUNT(s) FROM Servico s
            WHERE s.status IN :status
              AND (:clienteId IS NULL OR s.cliente.id = :clienteId)
              AND (:tipoServicoId IS NULL OR s.tipoServico.id = :tipoServicoId)
              AND (:inicio IS NULL OR s.dataInicioPrevista >= :inicio)
              AND (:fim IS NULL OR s.dataInicioPrevista <= :fim)
              AND (:busca = '' OR LOWER(s.cliente.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR CAST(s.numero AS string) LIKE CONCAT('%', :busca, '%'))
            """)
    Page<Servico> buscarFiltrado(
            @Param("status") List<StatusServico> status,
            @Param("clienteId") Long clienteId,
            @Param("tipoServicoId") Integer tipoServicoId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("busca") String busca,
            Pageable pageable
    );
}
