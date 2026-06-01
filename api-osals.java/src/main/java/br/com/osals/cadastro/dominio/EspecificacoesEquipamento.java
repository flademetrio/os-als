package br.com.osals.cadastro.dominio;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Specifications para filtrar Equipamento. Substitui a query JPQL
 * "(:param IS NULL OR ...)" que e fragil no Postgres quando o parametro
 * nao tem typecast SQL automatico. O Criteria API so cria o predicate
 * quando o valor existe, eliminando o problema na raiz.
 *
 * Faz JOIN FETCH em unidade e unidade.cliente apenas na query principal
 * (nao no count), evitando o warning de "join fetch in count query".
 */
public final class EspecificacoesEquipamento {

    private EspecificacoesEquipamento() {}

    public static Specification<Equipamento> comFiltros(Long clienteId,
                                                        Long unidadeId,
                                                        TipoEquipamento tipo,
                                                        StatusEquipamento status,
                                                        String busca,
                                                        boolean apenasAtivos) {
        return (root, query, cb) -> {
            Class<?> resultType = query != null ? query.getResultType() : null;
            boolean ehCountQuery = resultType == Long.class || resultType == long.class;
            if (!ehCountQuery) {
                var unidadeFetch = root.fetch("unidade", JoinType.INNER);
                unidadeFetch.fetch("cliente", JoinType.INNER);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (apenasAtivos) {
                predicates.add(cb.isTrue(root.get("ativo")));
            }
            if (clienteId != null) {
                predicates.add(cb.equal(
                        root.get("unidade").get("cliente").get("id"), clienteId));
            }
            if (unidadeId != null) {
                predicates.add(cb.equal(root.get("unidade").get("id"), unidadeId));
            }
            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (busca != null && !busca.isBlank()) {
                String like = "%" + busca.trim().toLowerCase() + "%";
                Predicate porMarca = cb.like(cb.lower(root.get("marca")), like);
                Predicate porModelo = cb.like(cb.lower(root.get("modelo")), like);
                Predicate porSerie = cb.like(cb.lower(root.get("numeroSerie")), like);
                Predicate porLocal = cb.like(cb.lower(root.get("localizacaoInterna")), like);
                predicates.add(cb.or(porMarca, porModelo, porSerie, porLocal));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
