package br.com.osals.cadastro.dominio;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioEquipamento extends JpaRepository<Equipamento, Long> {

    List<Equipamento> findByUnidadeIdAndAtivoTrueOrderByLocalizacaoInterna(Long unidadeId);

    List<Equipamento> findByUnidadeIdOrderByLocalizacaoInterna(Long unidadeId);

    @Query(
            value = """
            SELECT e FROM Equipamento e
            JOIN FETCH e.unidade u
            JOIN FETCH u.cliente
            WHERE (:apenasAtivos = FALSE OR e.ativo = TRUE)
              AND (:clienteId IS NULL OR u.cliente.id = :clienteId)
              AND (:unidadeId IS NULL OR u.id = :unidadeId)
              AND (:tipo IS NULL OR e.tipo = :tipo)
              AND (:status IS NULL OR e.status = :status)
              AND (:busca = '' OR LOWER(e.marca) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(e.modelo) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(e.numeroSerie) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(e.localizacaoInterna) LIKE LOWER(CONCAT('%', :busca, '%')))
            """,
            countQuery = """
            SELECT COUNT(e) FROM Equipamento e
            WHERE (:apenasAtivos = FALSE OR e.ativo = TRUE)
              AND (:clienteId IS NULL OR e.unidade.cliente.id = :clienteId)
              AND (:unidadeId IS NULL OR e.unidade.id = :unidadeId)
              AND (:tipo IS NULL OR e.tipo = :tipo)
              AND (:status IS NULL OR e.status = :status)
              AND (:busca = '' OR LOWER(e.marca) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(e.modelo) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(e.numeroSerie) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(e.localizacaoInterna) LIKE LOWER(CONCAT('%', :busca, '%')))
            """)
    Page<Equipamento> buscarFiltrado(
            @Param("clienteId") Long clienteId,
            @Param("unidadeId") Long unidadeId,
            @Param("tipo") TipoEquipamento tipo,
            @Param("status") StatusEquipamento status,
            @Param("busca") String busca,
            @Param("apenasAtivos") boolean apenasAtivos,
            Pageable pageable
    );
}
