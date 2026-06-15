package br.com.osals.seguranca.dominio;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioTokenRedefinicaoSenha extends JpaRepository<TokenRedefinicaoSenha, Long> {

    Optional<TokenRedefinicaoSenha> findByTokenHash(String tokenHash);

    /** Marca como usados os links ainda nao usados do usuario (1 link ativo por vez). */
    @Modifying
    @Query("UPDATE TokenRedefinicaoSenha t SET t.usadoEm = CURRENT_TIMESTAMP "
            + "WHERE t.usuario.id = :usuarioId AND t.usadoEm IS NULL")
    int invalidarNaoUsadosDoUsuario(@Param("usuarioId") Long usuarioId);
}
