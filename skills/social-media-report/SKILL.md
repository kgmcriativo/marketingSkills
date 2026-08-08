---
name: social-media-report
description: "Skill privada da KGM Design e Comunicação para montar o relatório mensal (ou periódico) de social media de um cliente — puxando dados de Instagram, Facebook e YouTube, combinando com dados manuais de TikTok/LinkedIn/Google Meu Negócio, calculando variação mês a mês, gerando insights automáticos e montando o dashboard + PDF entregável. Dispare esta skill quando o usuário mencionar 'relatório mensal,' 'relatório de social media,' 'monthly report,' 'social media report,' 'relatório de Instagram,' 'performance report,' 'relatório do cliente,' ou pedir para reportar seguidores, reach, engajamento, views ou inscritos. Also use when the user asks to build or update a client's monthly social dashboard or PDF report. For content creation and strategy, see social. For raw platform data, see the meta-insights and youtube-insights CLIs in tools/clis/."
metadata:
  version: 1.1.0
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
   completo). Comparação padrão é **dupla**: mês anterior (MoM) **e** o
   mesmo mês do ano anterior (YoY) — não só MoM. Um mês pode melhorar
   contra o mês anterior e ainda estar abaixo de onde a conta estava há um
   ano; mostrar só MoM esconde isso.
4. **Dados da Fase 1 (manual)** — o cliente tem planilha com TikTok,
   LinkedIn e/ou Google Meu Negócio deste mês? Peça o arquivo se ainda não
   foi enviado. Se não houver dado de uma dessas plataformas, omita a seção
   no relatório em vez de inventar números.
5. **Contexto de campanha** — algum lançamento, campanha paga (via
   `meta-ads.js`) ou evento que deva aparecer na narrativa? Sempre verifique
   se há conta de anúncios acessível (Etapa 2) mesmo sem o cliente
   mencionar — a Fase 2 automatizada inclui Anúncios por padrão quando há
   dado.

Se `.agents/product-marketing.md` existir, leia antes de escrever qualquer
insight narrativo — para tom de voz e contexto de negócio do cliente.

---

## Etapa 2 — Coleta de Dados

### Fase 2 — Automatizado (Instagram, Facebook, YouTube, Anúncios)

Puxe **três períodos**: mês de referência, mês anterior (MoM) e o mesmo mês
do ano anterior (YoY). O `account.followers_count`/`media_count` da API do
Instagram é sempre o valor **atual** (não histórico) — os três pulls dão o
mesmo número aí; não trate isso como um bug, e não calcule variação de
seguidores a partir disso (ver Etapa 3).

```bash
# Instagram + Facebook Page — mês de referência, mês anterior, mesmo mês ano anterior
node tools/clis/meta-insights.js report monthly --month 2026-07 --limit 50
node tools/clis/meta-insights.js report monthly --month 2026-06 --limit 50
node tools/clis/meta-insights.js report monthly --month 2025-07 --limit 50

# YouTube — mesma lógica (requer YOUTUBE_API_KEY e o channel-id do cliente)
node tools/clis/youtube-insights.js channel resolve --handle "@canaldocliente"
node tools/clis/youtube-insights.js report monthly --channel-id UCxxxx --month 2026-07 --limit 50
node tools/clis/youtube-insights.js report monthly --channel-id UCxxxx --month 2026-06 --limit 50
node tools/clis/youtube-insights.js report monthly --channel-id UCxxxx --month 2025-07 --limit 50
```

`meta-insights.js report monthly` já inclui os dados de Facebook Page
(`facebook_page`) automaticamente quando `META_PAGE_ID` está configurado —
não é preciso chamar `page get`/`page insights` separadamente, a menos que
precise de detalhe extra. Ver
[tools/integrations/meta-insights.md](../../tools/integrations/meta-insights.md)
e [tools/integrations/youtube-insights.md](../../tools/integrations/youtube-insights.md).

Se o cliente não tiver canal de YouTube ativo, pule essa parte e não inclua
a seção no relatório — não deixe um placeholder vazio.

**Anúncios (Meta Ads)** — sempre verifique, mesmo que o cliente não tenha
mencionado campanha paga:

```bash
# Descobrir contas de anúncio acessíveis (pode haver mais de uma)
node tools/clis/meta-ads.js accounts list

# Campanhas com investimento no mês de referência (date_preset=last_month
# cobre exatamente o mês anterior completo — confirme que bate com o mês
# de referência antes de usar; para outros meses, adapte via API direta
# com since/until, já que meta-ads.js só expõe date_preset)
node tools/clis/meta-ads.js campaigns list --account-id <id>
node tools/clis/meta-ads.js campaigns insights --id <campaign_id> --date-preset last_month
```

Se `accounts list` não retornar nada, **não conclua "sem conta de
anúncios"** sem checar mais fundo — o token pode ter `business_management`
mas não `ads_read`/`ads_management` (permissões separadas). Confirme via
`GET /{business-id}/owned_ad_accounts`: se retornar o erro *"Ad account
owner has NOT grant ads_management or ads_read permission"*, a conta existe
mas falta permissão — reporte isso especificamente (é uma mensagem
diferente de "não há conta"), não generalize como "sem anúncios".

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

### Variação mês a mês (MoM) e ano a ano (YoY)

Mesma fórmula para as duas — só muda o período de comparação:

```
variacao_% = ((atual - anterior) / anterior) * 100
```

Trate `anterior == 0` explicitamente ("novo neste período", nunca divisão
por zero). Aplique a cada métrica de conta (reach, profile views, website
clicks, inscritos, views) e a métricas agregadas de posts (total de posts,
engajamento médio por post). **Seguidores é exceção**: a API só retorna o
valor atual, não histórico — reporte como snapshot, sem MoM/YoY (ver nota
na Etapa 2).

Mostre MoM e YoY juntos, nunca só o mais favorável. Se o MoM é positivo mas
o YoY é negativo (ou vice-versa), isso é o insight, não um detalhe pra
esconder — foi exatamente o que aconteceu no relatório de referência desta
skill (reach +167% MoM, mas -23% YoY porque a cadência de posts ainda não
voltou ao nível do ano anterior).

### Terminologia — sempre em português no relatório final

Os campos da API (`reach`, `profile_views`, etc.) ficam em inglês nos dados
brutos e no código do CLI — normal. Mas o **texto do relatório** (rótulos,
tabelas, insights, narrativa) é sempre em português: "Alcance" (não
"Reach"), "Visitas ao perfil", "Cliques no link", "Inscritos", etc.

### Antes de rotular um post como "teste" ou anômalo

Se um post tem engajamento orgânico muito abaixo do padrão (especialmente
se vários posts assim saem no mesmo dia), **cruze com os dados de Anúncios
antes de concluir que é lixo/teste**. Um post pode ter engajamento orgânico
quase nulo justamente porque o resultado dele veio do pago (impulsionado) —
nesse caso ele não é um outlier a descartar, é uma campanha com resultado
próprio que pertence à seção de Anúncios, não à análise de engajamento
orgânico.

### Geração automática de insights

Os insights são gerados aplicando o framework **Awareness / Engagement /
Conversion** da skill `social`, estendido com thresholds e sinais
cross-métrica específicos para múltiplas plataformas — e agora também com
Anúncios, tratado como parte do bucket Conversion. Framework completo,
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

### Sistema visual (não reconstruir do zero)

O dashboard já tem um sistema visual validado — cores testadas no
validador do `dataviz`, tipografia embutida, todos os componentes
(hero, KPI tiles, tabela comparativa, barras de formato, cards de post,
cards de insight, nota tracejada de "sem dado") prontos.

1. Copie [assets/dashboard-skeleton.html](assets/dashboard-skeleton.html)
   e preencha os `{{placeholders}}` com os dados reais do cliente —
   siga [references/report-template.md](references/report-template.md)
   seção por seção.
2. Rode `node assets/build-dashboard.js <sua-cópia.html> <saida.html>`
   para injetar as fontes embutidas (o skeleton ainda tem os placeholders
   `__FRAUNCES_600__` etc. — o script troca pelos arquivos em
   `assets/fonts/*.b64`).
3. Publique `<saida.html>` como o Artifact.

Detalhes de cada token de cor, a receita pra buscar/embutir fontes, o
tratamento de thumbnails (e por que nunca dá pra usar a URL direta da
Meta), e as regras que só apareceram depois de screenshot real (mobile
quebrando, hero sumindo no dark mode) estão em
[references/visual-system.md](references/visual-system.md) — leia antes de
alterar o skeleton.

**Sempre tire screenshot antes de publicar** — claro, escuro, e mobile (ver
o script em visual-system.md). Bugs de layout não aparecem lendo o HTML,
só aparecem na imagem renderizada.

### Branding KGM (fixo, nos moldes da skill `kgm-kv`)

- Rodapé discreto em todas as páginas/telas: "KGM Design e Comunicação".
- Nome do cliente e período em destaque no topo/capa.
- Paleta e tipografia: a do sistema visual acima por padrão; se o cliente
  tiver identidade própria, adapte os tokens de cor mas valide de novo no
  `dataviz` antes de usar (ver visual-system.md).
- **Todo número no relatório leva unidade + uma frase de explicação
  grudada nele** (não só no rodapé) — "434,5" sozinho não diz se é gente,
  reais, ou porcentagem. Essa regra existe porque já causou confusão real
  numa revisão.

### Padrão de nomenclatura (obrigatório)

```
KGM_Relatorio_NomeCliente_202607.pdf
KGM_Relatorio_NomeCliente_202607   (título do dashboard/Artifact)
```

Use o mês de referência do relatório (não a data de geração) no `AAAAMM`.

### Estrutura

Siga [references/report-template.md](references/report-template.md) seção
por seção: hero (destaque do mês, com MoM e YoY) → panorama/KPIs → tabela
comparativa de 3 períodos → engajamento → formato de conteúdo → top/bottom
posts → Facebook → Anúncios (Meta Ads) → YouTube (se houver) → plataformas
Fase 1 (se houver dado) → insights automáticos e recomendações → rodapé
(metodologia, limitações). Numere as seções sequencialmente e omita as sem
dado — nunca deixe uma seção vazia ou pule um número.

### Limitações a divulgar sempre

- Insights do Instagram/Facebook podem atrasar até 48h; os últimos 1-2 dias
  do período podem estar subcontados.
- `reach`/`profile_views`/page insights são estimativas da própria Meta, não
  contagens exatas.
- `reach`/`saved` por post só são puxados para uma amostra (top/bottom
  performers), não para todos os posts do período.
- Seguidores é sempre o valor atual da API, não histórico — sem MoM/YoY
  nessa métrica (ver Etapa 2/3).
- Comparação YoY usa o calendário exato do mesmo mês no ano anterior — não
  ajusta por dia da semana nem por mudanças no algoritmo da plataforma ao
  longo do ano.
- Se as miniaturas dos posts forem um placeholder (formato + ícone) em vez
  da imagem real, diga isso explicitamente e por quê (ver
  visual-system.md) — nunca deixe parecer que o card está quebrado.
- Dados de Anúncios: se a conta existir mas faltar permissão
  (`ads_read`/`ads_management`), diga isso especificamente — é uma
  situação diferente de "sem conta de anúncios".
- Dados da Fase 1 (TikTok, LinkedIn, GMB) são preenchidos manualmente — sem
  a mesma verificação automática dos dados de API.

---

## Etapa 5 — QA e Entrega

Checklist antes de entregar:

- [ ] Todas as contas/plataformas confirmadas batem com o cliente esperado
- [ ] MoM **e** YoY calculados corretamente (incluindo casos de
      `anterior == 0`), e nenhum dos dois foi omitido por ser desfavorável
- [ ] Verificou conta de Anúncios (mesmo sem o cliente ter pedido) e
      distinguiu "sem conta" de "conta existe, falta permissão"
- [ ] Todo insight cita o número/delta real, nada genérico
- [ ] Todo número no relatório tem unidade + explicação grudada nele
- [ ] Rótulos em português (Alcance, não Reach)
- [ ] Posts com engajamento orgânico atípico foram cruzados com Anúncios
      antes de virar insight sobre conteúdo
- [ ] Seções de plataformas sem dado foram omitidas, não deixadas em branco
- [ ] Rodapé "KGM Design e Comunicação" presente no dashboard e no PDF
- [ ] Nome do arquivo segue `KGM_Relatorio_NomeCliente_AAAAMM`
- [ ] Dashboard publicado no mesmo `file_path`/URL do mês anterior (link
      fixo), quando já existir um relatório anterior desse cliente
- [ ] Screenshot tirado em claro, escuro e mobile antes de publicar (ver
      script em visual-system.md) — nenhum bug de layout visível
- [ ] Limitações de dados listadas no rodapé

---

## Perguntas Específicas da Tarefa

1. Qual cliente e quais contas confirmar (Instagram, Facebook, YouTube,
   Anúncios)?
2. Qual o mês de referência? (Comparação MoM + YoY é o padrão.)
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
