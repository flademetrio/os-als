package br.com.osals.ordemservico.dominio;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface RepositorioOrdemServico
        extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    /** Proximo valor da sequencia global de numeracao de OS. */
    @Query(value = "SELECT nextval('os_numero_seq')", nativeQuery = true)
    Long proximoNumero();

    /** Carrega a OS com todas as colecoes — usado na geracao do PDF e no detalhe. */
    @EntityGraph(attributePaths = {"tecnicos", "veiculos", "equipamentos", "contatos",
            "servico", "servico.cliente", "servico.tipoServico"})
    Optional<OrdemServico> findWithRelacionamentosById(Long id);

    List<OrdemServico> findByServicoIdOrderByNumero(Long servicoId);

    // A busca filtrada vive em EspecificacoesOrdemServico + GestorOrdemServico.listar(),
    // usando JpaSpecificationExecutor para evitar o problema do Postgres com
    // "(:param IS NULL OR ...)" quando o parametro nao tem typecast SQL.
}
