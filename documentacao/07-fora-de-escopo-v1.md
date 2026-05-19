# 07 — Fora de Escopo (V1)

Itens explicitamente **fora do escopo desta primeira versão**, conforme decisões do PO. Registrados aqui para não se perderem como possíveis evoluções futuras, e para evitar discussões repetidas.

## Cobrança e financeiro
- Cobrança do cliente (valor de venda, faturamento, recebimentos)
- Emissão de nota fiscal
- Emissão de boleto / PIX / qualquer meio de pagamento
- Parcelamento
- Contas a receber
- Perfil de usuário financeiro separado

## Operação digital do técnico
- App / interface mobile para o técnico preencher a OS digitalmente
- Geolocalização da execução (check-in/check-out de campo)
- Assinatura digital do cliente na OS
- Fotos antes/depois capturadas em campo (anexos de PDF estão **dentro** do escopo — ver [13](13-anexos.md); o que fica fora é a captura de imagem direta pelo técnico em campo)

## Cliente final
- Portal/área do cliente para consultar histórico, status de serviço, agenda
- Notificações automáticas para o cliente (e-mail, WhatsApp)

## Estoque
- Controle de entrada/saída/saldo de peças e materiais
- Inventário, requisição de compra, recebimento

## Contratos recorrentes
- Cadastro dedicado de contratos PMOC ou manutenção recorrente — **decidido**: sem entidade própria na V1; cada visita recorrente é cadastrada como um Serviço comum
- Geração automática de Serviços a partir de cronograma de contrato — fora da V1
- Relatório consolidado "contratos vigentes" — fora da V1

## Custos — extensões
- Anexar comprovante (NF, recibo) **a cada lançamento de custo** individualmente — anexos só existem no Serviço e na OS, não por custo. Comprovantes podem ser anexados ao Serviço como PDF avulso, mas não há vínculo formal `custo ↔ anexo`
- Markup por categoria de custo
- Markup específico por Serviço (override do markup geral)
- **Log de auditoria de alterações de custo** após Concluído (snapshot do valor anterior + motivo) — alterações na V1 simplesmente sobrescrevem
- **Criação de novas categorias de custo pelo admin** — apenas as 5 seeds estão disponíveis na V1

## Anexos — extensões
- Formatos diferentes de PDF (imagens, planilhas, documentos)
- Versionamento de anexos (manter histórico de versões substituídas)
- Pré-visualização inline (a definir; pode entrar como melhoria técnica sem mudar o escopo)

## Outros
- Integração com WhatsApp Business
- Integração com sistema contábil/ERP externo
- Pesquisa de satisfação pós-serviço

## Observações
Esta lista representa uma **escolha de escopo deliberada**, não significa que esses itens nunca farão parte do sistema. São candidatos naturais a versões futuras.
