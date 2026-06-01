package br.com.osals.cadastro.dominio;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Specifications para filtrar Veiculo. Substitui a query JPQL
 * "(:param IS NULL OR ...)" que e fragil no Postgres quando o parametro
 * nao tem typecast SQL automatico. O Criteria API so cria o predicate
 * quando o valor existe, eliminando o problema na raiz.
 *
 * Veiculo nao tem relacionamentos para fetch — query simples.
 */
public final class EspecificacoesVeiculo {

    private EspecificacoesVeiculo() {}

    public static Specification<Veiculo> comFiltros(StatusVeiculo status,
                                                    String busca,
                                                    boolean apenasAtivos) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (apenasAtivos) {
                predicates.add(cb.isTrue(root.get("ativo")));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (busca != null && !busca.isBlank()) {
                String like = "%" + busca.trim().toLowerCase() + "%";
                Predicate porPlaca = cb.like(cb.lower(root.get("placa")), like);
                Predicate porModelo = cb.like(cb.lower(root.get("modelo")), like);
                Predicate porMarca = cb.like(cb.lower(root.get("marca")), like);
                predicates.add(cb.or(porPlaca, porModelo, porMarca));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
