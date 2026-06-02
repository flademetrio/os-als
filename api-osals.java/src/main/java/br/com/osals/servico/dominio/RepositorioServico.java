package br.com.osals.servico.dominio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface RepositorioServico
        extends JpaRepository<Servico, Long>, JpaSpecificationExecutor<Servico> {

    /** Proximo valor da sequencia global de numeracao de Servico. */
    @Query(value = "SELECT nextval('servico_numero_seq')", nativeQuery = true)
    Long proximoNumero();

    /** Quantos Servicos usam um determinado tipo - usado ao validar exclusao. */
    long countByTipoServicoId(Integer tipoServicoId);

    // A busca filtrada vive em EspecificacoesServico + GestorServico.listar(),
    // usando JpaSpecificationExecutor para evitar o problema do Postgres com
    // "(:param IS NULL OR ...)" quando :param e LocalDate sem typecast.
}
