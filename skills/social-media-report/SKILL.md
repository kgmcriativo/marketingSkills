---
name: social-media-report
description: "Skill privada da KGM Design e Comunicação para montar o relatório mensal (ou periódico) de social media de um cliente — puxando dados de Instagram, Facebook e YouTube, combinando com dados manuais de TikTok/LinkedIn/Google Meu Negócio, calculando variação mês a mês, gerando insights automáticos e montando o dashboard + PDF entregável. Dispare esta skill quando o usuário mencionar 'relatório mensal,' 'relatório de social media,' 'monthly report,' 'social media report,' 'relatório de Instagram,' 'performance report,' 'relatório do cliente,' ou pedir para reportar seguidores, reach, engajamento, views ou inscritos. Also use when the user asks to build or update a client's monthly social dashboard or PDF report. For content creation and strategy, see social. For raw platform data, see the meta-insights and youtube-insights CLIs in tools/clis/."
metadata:
  version: 1.0.0
---

# Relatório Mensal de Social Media (KGM)

Você é o analista responsável por transformar dados brutos de redes sociais
em um relatório de performance pronto para o cliente: o que aconteceu, como
compara com o mês anterior, por que importa, e o que fazer a seguir.

Fluxo geral:

```
1. Briefing   →   2. Coleta de   →   3. Cálculo e   →   4. Montagem   →   5. QA e
   do relatório      Dados             Análise            do Entregável     Entrega
```

Não pule etapas — um relatório montado sobre números não verificados ou sem
uma comparação MoM real não serve ao cliente.

---

## Etapa 1 — Briefing do Relatório

Colete o que faltar (se já foi dito na conversa, confirme e siga):

1. **Cliente** — nome do cliente/marca (usado na nomenclatura do arquivo).
2. **Contas** — `META_IG_USER_ID`, `META_PAGE_ID` já configurados no
   ambiente? Canal do YouTube (`--channel-id` ou `--handle`)? Nunca chute um
   ID — confirme com o usuário se não estiver nas env vars.
3. **Período** — mês de referência (padrão: mês calendário anterior
   completo) e a base de comparação (padrão: mês anterior — MoM).
4. **Dados da Fase 1 (manual)** — o cliente tem planilha com TikTok,
   LinkedIn e/ou Google Meu Negócio deste mês? Peça o arquivo se ainda não
   foi enviado. Se não houver dado de uma dessas plataformas, omita a seção
   no relatório em vez de inventar números.
5. **Contexto de campanha** — algum lançamento, campanha paga (via
   `meta-ads.js`) ou evento que deva aparecer na narrativa?

Se `.agents/product-marketing.md` existir, leia antes de escrever qualquer
insight narrativo — para tom de voz e contexto de negócio do cliente.

---

## Etapa 2 — Coleta de Dados

### Fase 2 — Automatizado (Instagram, Facebook, YouTube)

```bash
# Instagram + Facebook Page — mês de referência e mês anterior (para MoM)
node tools/clis/meta-insights.js report monthly --month 2026-07 --limit 50
node tools/clis/meta-insights.js report monthly --month 2026-06 --limit 50

# YouTube — mesma lógica (requer YOUTUBE_API_KEY e o channel-id do cliente)
node tools/clis/youtube-insights.js channel resolve --handle "@canaldocliente"
node tools/clis/youtube-insights.js report monthly --channel-id UCxxxx --month 2026-07 --limit 50
node tools/clis/youtube-insights.js report monthly --channel-id UCxxxx --month 2026-06 --limit 50
```

`meta-insights.js report monthly` já inclui os dados de Facebook Page
(`facebook_page`) automaticamente quando `META_PAGE_ID` está configurado —
não é preciso chamar `page get`/`page insights` separadamente, a menos que
precise de detalhe extra. Ver
[tools/integrations/meta-insights.md](../../tools/integrations/meta-insights.md)
e [tools/integrations/youtube-insights.md](../../tools/integrations/youtube-insights.md).

Se o cliente não tiver canal de YouTube ativo, pule essa parte e não inclua
a seção no relatório — não deixe um placeholder vazio.

**Verifique antes de seguir**: confirme que `account.username` (Instagram),
`page.name` (Facebook) e `channel.title` (YouTube) batem com o cliente
esperado, e que os totais são plausíveis para a cadência normal da conta. Se
o token/ID estiver errado, a API retorna um objeto `error` — reporte isso,
nunca reporte zero silenciosamente.

### Fase 1 — Manual (TikTok, LinkedIn, Google Meu Negócio)

Essas plataformas não têm CLI de coleta automática ainda (TikTok e LinkedIn
exigem app review; a API de Business Profile do Google exige aprovação
separada — não vale bloquear o projeto nisso agora). Os dados vêm de
planilha preenchida manualmente pelo time ou pelo cliente.

Use a skill `xlsx` para ler a planilha. Formato esperado descrito em
[references/manual-data-template.md](references/manual-data-template.md) —
se a planilha recebida não seguir esse formato, mapeie as colunas
equivalentes em vez de rejeitar o arquivo.

---

## Etapa 3 — Cálculo e Análise

### Variação mês a mês

```
variacao_% = ((atual - anterior) / anterior) * 100
```

Trate `anterior == 0` explicitamente ("novo neste período", nunca divisão
por zero). Aplique a cada métrica de conta (seguidores, reach, profile
views, website clicks, inscritos, views) e a métricas agregadas de posts
(total de posts, engajamento médio por post).

### Geração automática de insights

Os insights são gerados aplicando o framework **Awareness / Engagement /
Conversion** da skill `social`, estendido com thresholds e sinais
cross-métrica específicos para múltiplas plataformas. Framework completo,
fórmulas e limites em
[references/metrics-framework.md](references/metrics-framework.md) — leia
antes de escrever a seção de análise.

Todo insight no relatório precisa ser rastreável a um número específico nos
dados coletados — nunca um "o engajamento foi bom esse mês" genérico sem a
métrica e o delta por trás.

---

## Etapa 4 — Montagem do Entregável

### Formato (decisão já fechada do projeto)

- **Dashboard** — Artifact HTML, **link fixo**: publique com o mesmo
  `file_path` todo mês (ex.: `dashboard-{cliente}.html`) para o link não
  mudar — é um redeploy mensal, não um novo artifact. Carregue a skill
  `dataviz` antes de montar qualquer gráfico, e `artifact-design` antes de
  escrever a página.
- **PDF resumido** — versão condensada (1-2 páginas) com o resumo executivo
  e os KPIs principais, para envio direto ao cliente. Use a skill `pdf`.
- **Sem PPTX** — não gere apresentação PPTX para este fluxo.

### Branding KGM (fixo, nos moldes da skill `kgm-kv`)

- Rodapé discreto em todas as páginas/telas: "KGM Design e Comunicação".
- Nome do cliente e período em destaque no topo/capa.
- Paleta e tipografia: siga a identidade do cliente se fornecida; senão,
  use uma paleta neutra e profissional (ver `dataviz`/`artifact-design`
  para a metodologia de cores).

### Padrão de nomenclatura (obrigatório)

```
KGM_Relatorio_NomeCliente_202607.pdf
KGM_Relatorio_NomeCliente_202607   (título do dashboard/Artifact)
```

Use o mês de referência do relatório (não a data de geração) no `AAAAMM`.

### Estrutura

Siga [references/report-template.md](references/report-template.md) seção
por seção: capa → resumo executivo (KPIs com delta MoM) → Instagram →
Facebook → YouTube → plataformas Fase 1 (se houver dado) → top/bottom posts
→ comparação de formato de conteúdo → insights automáticos e recomendações
→ apêndice (números brutos, metodologia, limitações).

### Limitações a divulgar sempre

- Insights do Instagram/Facebook podem atrasar até 48h; os últimos 1-2 dias
  do período podem estar subcontados.
- `reach`/`profile_views`/page insights são estimativas da própria Meta, não
  contagens exatas.
- `reach`/`saved` por post só são puxados para uma amostra (top/bottom
  performers), não para todos os posts do período.
- Dados da Fase 1 (TikTok, LinkedIn, GMB) são preenchidos manualmente — sem
  a mesma verificação automática dos dados de API.

---

## Etapa 5 — QA e Entrega

Checklist antes de entregar:

- [ ] Todas as contas/plataformas confirmadas batem com o cliente esperado
- [ ] MoM calculado corretamente (incluindo casos de `anterior == 0`)
- [ ] Todo insight cita o número/delta real, nada genérico
- [ ] Seções de plataformas sem dado foram omitidas, não deixadas em branco
- [ ] Rodapé "KGM Design e Comunicação" presente no dashboard e no PDF
- [ ] Nome do arquivo segue `KGM_Relatorio_NomeCliente_AAAAMM`
- [ ] Dashboard publicado no mesmo `file_path`/URL do mês anterior (link
      fixo), quando já existir um relatório anterior desse cliente
- [ ] Limitações de dados listadas no apêndice

---

## Perguntas Específicas da Tarefa

1. Qual cliente e quais contas confirmar (Instagram, Facebook, YouTube)?
2. Qual o mês de referência e a base de comparação?
3. Há planilha da Fase 1 (TikTok/LinkedIn/GMB) para este mês?
4. Existe um dashboard anterior desse cliente para manter o mesmo link?
5. Algum contexto de campanha/lançamento que deva entrar na narrativa?

---

## Skills Relacionadas

- **social**: framework de métricas Awareness/Engagement/Conversion usado
  como base, e estratégia de conteúdo
- **kgm-kv**: padrão de branding e nomenclatura KGM que esta skill segue
- **analytics**: tracking e atribuição cross-plataforma além de social
- **ads**: para cruzar performance orgânica com resultados de Meta Ads
- **xlsx**: para ler a planilha manual da Fase 1
- **pdf**: para o PDF resumido
- **dataviz**: para os gráficos/KPIs do dashboard
- **artifact-design**: para a página do dashboard
