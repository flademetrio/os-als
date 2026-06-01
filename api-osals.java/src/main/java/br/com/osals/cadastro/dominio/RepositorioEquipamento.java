package br.com.osals.cadastro.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RepositorioEquipamento
        extends JpaRepository<Equipamento, Long>, JpaSpecificationExecutor<Equipamento> {

    List<Equipamento> findByUnidadeIdAndAtivoTrueOrderByLocalizacaoInterna(Long unidadeId);

    List<Equipamento> findByUnidadeIdOrderByLocalizacaoInterna(Long unidadeId);

    // A busca filtrada vive em EspecificacoesEquipamento + ServicoEquipamento.listarFiltrado(),
    // usando JpaSpecificationExecutor para evitar o problema do Postgres com
    // "(:param IS NULL OR ...)" quando o parametro nao tem typecast SQL.
}
