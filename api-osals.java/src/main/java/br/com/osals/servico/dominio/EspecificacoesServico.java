package br.com.osals.servico.dominio;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Specifications para filtrar Servico. Substitui a antiga query JPQL
 * "(:param IS NULL OR ...)" que quebrava no Postgres quando o parametro
 * era LocalDate sem typecast (ERROR: could not determine data type of
 * parameter $N). O Criteria API so cria o predicate quando o valor
 * existe, eliminando o problema na raiz.
 *
 * O JOIN FETCH de cliente/tipoServico e feito apenas na query principal
 * (nao no count), evitando o warning de "join fetch in count query".
 */
public final class EspecificacoesServico {

    private EspecificacoesServico() {}

    public static Specification<Servico> comFiltros(List<StatusServico> status,
                                                    Long clienteId,
                                                    Integer tipoServicoId,
                                                    LocalDate inicio,
                                                    LocalDate fim,
                                                    String busca) {
        return (root, query, cb) -> {
            // Fetch so na query principal — cliente e tipoServico sao ManyToOne
            // (single-valued), entao paginacao + fetch funcionam normalmente.
            Class<?> resultType = query != null ? query.getResultType() : null;
            boolean ehCountQuery = resultType == Long.class || resultType == long.class;
            if (!ehCountQuery) {
                root.fetch("cliente", JoinType.INNER);
                root.fetch("tipoServico", JoinType.INNER);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty()) {
                predicates.add(root.get("status").in(status));
            }
            if (clienteId != null) {
                predicates.add(cb.equal(root.get("cliente").get("id"), clienteId));
            }
            if (tipoServicoId != null) {
                predicates.add(cb.equal(root.get("tipoServico").get("id"), tipoServicoId));
            }
            if (inicio != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("dataInicioPrevista"), inicio));
            }
            if (fim != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("dataInicioPrevista"), fim));
            }
            if (busca != null && !busca.isBlank()) {
                String termo = busca.trim();
                String like = "%" + termo.toLowerCase() + "%";

                List<Predicate> ors = new ArrayList<>();
                ors.add(cb.like(cb.lower(root.get("cliente").get("nome")), like));

                // Busca por numero exato apenas se termo for puramente numerico.
                // Evita CAST SQL (que quebra como "operator does not exist:
                // integer ~~ text") e e mais util na pratica — usuario procura
                // OS especifica, nao "todas que contenham 12 no numero".
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
