package br.com.osals.anexo.dominio;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioAnexoOs extends JpaRepository<AnexoOs, Long> {

    /** os_ids (dentre os informados) que possuem anexo — para marcar a lista sem N+1. */
    @Query("select a.osId from AnexoOs a where a.osId in :ids")
    List<Long> idsComAnexo(@Param("ids") Collection<Long> ids);
}
