# Fase 1 — Template de Dados Manuais (TikTok, LinkedIn, Google Meu Negócio)

Essas três plataformas ainda não têm coleta automatizada:

- **TikTok**: a API oficial (TikTok for Developers) exige app review para
  acesso a dados de conta/vídeo além do básico — não vale bloquear o
  projeto nisso agora.
- **LinkedIn**: a API de Company Pages também exige aprovação de parceiro
  para analytics.
- **Google Meu Negócio**: a Business Profile API exige aprovação separada,
  não é self-service.

Enquanto isso, os dados dessas plataformas entram por planilha preenchida
manualmente (pelo time KGM ou pelo cliente) e são lidos com a skill `xlsx`.

## Formato Esperado

Uma aba por plataforma (`TikTok`, `LinkedIn`, `Google Meu Negócio`), cada
uma com estas colunas:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `metrica` | Nome da métrica | `seguidores`, `visualizacoes`, `curtidas` |
| `valor_mes_atual` | Valor no mês do relatório | `12500` |
| `valor_mes_anterior` | Valor no mês de comparação | `11800` |
| `observacoes` | Contexto opcional (campanha, evento, etc.) | `Campanha de agosto dourado` |

### Métricas mínimas recomendadas por plataforma

**TikTok**
- Seguidores
- Visualizações totais (soma dos vídeos do período)
- Curtidas, comentários, compartilhamentos (agregado do período)
- Vídeos publicados no período

**LinkedIn (Company Page)**
- Seguidores
- Impressões (se disponível no LinkedIn Analytics nativo)
- Engajamento (reações + comentários + compartilhamentos)
- Posts publicados no período
- Cliques em posts (se disponível)

**Google Meu Negócio**
- Visualizações do perfil (busca + mapas)
- Ações no perfil (ligações, rotas, cliques no site)
- Novas avaliações no período
- Nota média

## Tratamento de Dados Ausentes

- Se uma aba/plataforma não vier preenchida, **omita a seção no relatório**
  — nunca reporte zero ou "N/A" como se fosse um dado coletado.
- Se apenas `valor_mes_atual` estiver preenchido (sem comparação), reporte o
  valor absoluto e marque a variação MoM como "sem base de comparação".
- Aplique a mesma fórmula de variação MoM das plataformas automatizadas:
  `variacao_% = ((atual - anterior) / anterior) * 100`, com o mesmo
  tratamento de `anterior == 0` (ver
  [metrics-framework.md](metrics-framework.md)).

## Onde Isso Entra no Relatório

Os dados da Fase 1 aparecem em uma seção própria ("Outras Plataformas") no
[report-template.md](report-template.md), separados dos dados automatizados
(Instagram/Facebook/YouTube) e sinalizados como coletados manualmente — não
misture os dois tipos de fonte na mesma tabela sem indicar a origem.
