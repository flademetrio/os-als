package br.com.osals.cadastro.dominio;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RepositorioVeiculo
        extends JpaRepository<Veiculo, Long>, JpaSpecificationExecutor<Veiculo> {

    Optional<Veiculo> findByPlaca(String placa);

    boolean existsByPlaca(String placa);

    // A busca filtrada vive em EspecificacoesVeiculo + ServicoVeiculo.listar(),
    // usando JpaSpecificationExecutor para evitar o problema do Postgres com
    // "(:param IS NULL OR ...)" quando o parametro nao tem typecast SQL.
}
