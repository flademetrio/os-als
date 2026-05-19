package br.com.osals.seguranca.dominio;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioTokenRefresh extends JpaRepository<TokenRefresh, Long> {

    Optional<TokenRefresh> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE TokenRefresh t SET t.revogadoEm = CURRENT_TIMESTAMP WHERE t.usuario.id = :usuarioId AND t.revogadoEm IS NULL")
    int revogarTodosDoUsuario(@Param("usuarioId") Long usuarioId);
}
