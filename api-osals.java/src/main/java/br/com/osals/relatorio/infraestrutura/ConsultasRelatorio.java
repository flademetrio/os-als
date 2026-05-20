package br.com.osals.relatorio.infraestrutura;

import br.com.osals.ordemservico.dominio.OrdemServico;
import br.com.osals.servico.dominio.Servico;
import br.com.osals.servico.dominio.StatusServico;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

/**
 * Consultas agregadas dos relatorios. O WHERE e montado dinamicamente: cada
 * filtro so entra na query (e so e bindado) quando o valor nao e nulo.
 *
 * Isso evita o erro do PostgreSQL "could not determine data type of parameter"
 * que ocorre quando um bind nulo aparece isolado num predicado ":p IS NULL".
 */
@Repository
public class ConsultasRelatorio {

    @PersistenceContext
    private EntityManager em;

    // ===== OS por Status =====

    /** Object[]{StatusOrdemServico, Long quantidade}. */
    public List<Object[]> contarOsPorStatus(OffsetDateTime ini, OffsetDateTime fim,
                                            Long clienteId, Long tecnicoId, Integer tipoServicoId) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroOs(ini, fim, clienteId, tecnicoId, tipoServicoId, params);
        var query = em.createQuery(
                "SELECT os.status, COUNT(os) FROM OrdemServico os" + where
                        + " GROUP BY os.status", Object[].class);
        params.forEach(query::setParameter);
        return query.getResultList();
    }

    public long contarOs(OffsetDateTime ini, OffsetDateTime fim,
                         Long clienteId, Long tecnicoId, Integer tipoServicoId) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroOs(ini, fim, clienteId, tecnicoId, tipoServicoId, params);
        var query = em.createQuery("SELECT COUNT(os) FROM OrdemServico os" + where, Long.class);
        params.forEach(query::setParameter);
        return query.getSingleResult();
    }

    public List<OrdemServico> listarOs(OffsetDateTime ini, OffsetDateTime fim,
                                       Long clienteId, Long tecnicoId, Integer tipoServicoId,
                                       int pagina, int tamanho) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroOs(ini, fim, clienteId, tecnicoId, tipoServicoId, params);
        var query = em.createQuery(
                "SELECT os FROM OrdemServico os" + where
                        + " ORDER BY os.dataAbertura DESC", OrdemServico.class);
        params.forEach(query::setParameter);
        return query.setFirstResult(pagina * tamanho).setMaxResults(tamanho).getResultList();
    }

    private static String filtroOs(OffsetDateTime ini, OffsetDateTime fim, Long clienteId,
                                   Long tecnicoId, Integer tipoServicoId, Map<String, Object> params) {
        var clausulas = new ArrayList<String>();
        if (ini != null) {
            clausulas.add("os.dataAbertura >= :ini");
            params.put("ini", ini);
        }
        if (fim != null) {
            clausulas.add("os.dataAbertura < :fim");
            params.put("fim", fim);
        }
        if (clienteId != null) {
            clausulas.add("os.servico.cliente.id = :clienteId");
            params.put("clienteId", clienteId);
        }
        if (tipoServicoId != null) {
            clausulas.add("os.servico.tipoServico.id = :tipoServicoId");
            params.put("tipoServicoId", tipoServicoId);
        }
        if (tecnicoId != null) {
            clausulas.add("EXISTS (SELECT 1 FROM os.tecnicos t WHERE t.usuarioId = :tecnicoId)");
            params.put("tecnicoId", tecnicoId);
        }
        return clausulas.isEmpty() ? "" : " WHERE " + String.join(" AND ", clausulas);
    }

    // ===== Custos por Servico =====

    public long contarServicos(OffsetDateTime ini, OffsetDateTime fim,
                               Long clienteId, Integer tipoServicoId, StatusServico status) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroServico(ini, fim, clienteId, tipoServicoId, status, params);
        var query = em.createQuery("SELECT COUNT(s) FROM Servico s" + where, Long.class);
        params.forEach(query::setParameter);
        return query.getSingleResult();
    }

    public List<Servico> listarServicos(OffsetDateTime ini, OffsetDateTime fim,
                                        Long clienteId, Integer tipoServicoId, StatusServico status,
                                        int pagina, int tamanho) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroServico(ini, fim, clienteId, tipoServicoId, status, params);
        var query = em.createQuery(
                "SELECT s FROM Servico s" + where + " ORDER BY s.numero", Servico.class);
        params.forEach(query::setParameter);
        return query.setFirstResult(pagina * tamanho).setMaxResults(tamanho).getResultList();
    }

    private static String filtroServico(OffsetDateTime ini, OffsetDateTime fim, Long clienteId,
                                        Integer tipoServicoId, StatusServico status,
                                        Map<String, Object> params) {
        var clausulas = new ArrayList<String>();
        if (ini != null) {
            clausulas.add("s.createdAt >= :ini");
            params.put("ini", ini);
        }
        if (fim != null) {
            clausulas.add("s.createdAt < :fim");
            params.put("fim", fim);
        }
        if (clienteId != null) {
            clausulas.add("s.cliente.id = :clienteId");
            params.put("clienteId", clienteId);
        }
        if (tipoServicoId != null) {
            clausulas.add("s.tipoServico.id = :tipoServicoId");
            params.put("tipoServicoId", tipoServicoId);
        }
        if (status != null) {
            clausulas.add("s.status = :status");
            params.put("status", status);
        }
        return clausulas.isEmpty() ? "" : " WHERE " + String.join(" AND ", clausulas);
    }

    /** Soma de custos por servico e categoria. Object[]{servicoId, categoriaCodigo, soma}. */
    public List<Object[]> somarCustosPorServicoECategoria(List<Long> servicoIds) {
        if (servicoIds == null || servicoIds.isEmpty()) {
            return List.of();
        }
        return em.createQuery("""
                        SELECT l.servico.id, l.categoriaCusto.codigo, SUM(l.valorTotalCentavos)
                        FROM LancamentoCusto l
                        WHERE l.servico.id IN :ids
                        GROUP BY l.servico.id, l.categoriaCusto.codigo
                        """, Object[].class)
                .setParameter("ids", servicoIds)
                .getResultList();
    }

    // ===== Custos por Cliente =====

    /** Object[]{clienteId, clienteNome, quantidadeServicos}. */
    public List<Object[]> contarServicosPorCliente(OffsetDateTime ini, OffsetDateTime fim) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroPeriodo("s.createdAt", ini, fim, params);
        var query = em.createQuery(
                "SELECT s.cliente.id, s.cliente.nome, COUNT(s) FROM Servico s" + where
                        + " GROUP BY s.cliente.id, s.cliente.nome ORDER BY s.cliente.nome",
                Object[].class);
        params.forEach(query::setParameter);
        return query.getResultList();
    }

    /** Object[]{clienteId, quantidadeOs}. */
    public List<Object[]> contarOsPorCliente(OffsetDateTime ini, OffsetDateTime fim) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroPeriodo("os.servico.createdAt", ini, fim, params);
        var query = em.createQuery(
                "SELECT os.servico.cliente.id, COUNT(os) FROM OrdemServico os" + where
                        + " GROUP BY os.servico.cliente.id", Object[].class);
        params.forEach(query::setParameter);
        return query.getResultList();
    }

    /** Object[]{clienteId, somaCustoCentavos}. */
    public List<Object[]> somarCustosPorCliente(OffsetDateTime ini, OffsetDateTime fim) {
        var params = new LinkedHashMap<String, Object>();
        String where = filtroPeriodo("l.servico.createdAt", ini, fim, params);
        var query = em.createQuery(
                "SELECT l.servico.cliente.id, SUM(l.valorTotalCentavos) FROM LancamentoCusto l" + where
                        + " GROUP BY l.servico.cliente.id", Object[].class);
        params.forEach(query::setParameter);
        return query.getResultList();
    }

    private static String filtroPeriodo(String campo, OffsetDateTime ini, OffsetDateTime fim,
                                        Map<String, Object> params) {
        var clausulas = new ArrayList<String>();
        if (ini != null) {
            clausulas.add(campo + " >= :ini");
            params.put("ini", ini);
        }
        if (fim != null) {
            clausulas.add(campo + " < :fim");
            params.put("fim", fim);
        }
        return clausulas.isEmpty() ? "" : " WHERE " + String.join(" AND ", clausulas);
    }
}
