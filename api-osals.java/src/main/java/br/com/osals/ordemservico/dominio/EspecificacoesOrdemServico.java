package br.com.osals.ordemservico.dominio;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Specifications para filtrar OrdemServico. Substitui a query JPQL
 * "(:param IS NULL OR ...)" que e fragil no Postgres quando o parametro
 * nao tem typecast SQL automatico. O Criteria API so cria o predicate
 * quando o valor existe, eliminando o problema na raiz.
 *
 * Faz JOIN FETCH em servico e servico.cliente apenas na query principal
 * (nao no count), evitando o warning de "join fetch in count query".
 */
public final class EspecificacoesOrdemServico {

    private EspecificacoesOrdemServico() {}

    public static Specification<OrdemServico> comFiltros(StatusOrdemServico status,
                                                         Long servicoId,
                                                         Long clienteId,
                                                         String busca) {
        return (root, query, cb) -> {
            Class<?> resultType = query != null ? query.getResultType() : null;
            boolean ehCountQuery = resultType == Long.class || resultType == long.class;
            if (!ehCountQuery) {
                var servicoFetch = root.fetch("servico", JoinType.INNER);
                servicoFetch.fetch("cliente", JoinType.INNER);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (servicoId != null) {
                predicates.add(cb.equal(root.get("servico").get("id"), servicoId));
            }
            if (clienteId != null) {
                predicates.add(cb.equal(
                        root.get("servico").get("cliente").get("id"), clienteId));
            }
            if (busca != null && !busca.isBlank()) {
                String termo = busca.trim();
                String like = "%" + termo.toLowerCase() + "%";

                List<Predicate> ors = new ArrayList<>();
                ors.add(cb.like(cb.lower(root.get("descricaoAtividade")), like));

                // Busca por numero exato apenas se termo for puramente numerico.
                // Evita CAST SQL (que quebra como "operator does not exist:
                // integer ~~ text") e e mais util na pratica.
                if (termo.matches("\\d+")) {
                    try {
                        ors.add(cb.equal(root.get("numero"), Integer.parseInt(termo)));
                    } catch (NumberFormatException ignore) {
                        // termo > Integer.MAX_VALUE — ignora a parte de numero
                    }
                }

                predicates.add(cb.or(ors.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
