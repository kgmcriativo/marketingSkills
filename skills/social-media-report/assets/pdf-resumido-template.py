#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF resumido (condensed) template — KGM social-media-report skill.

Follows references/report-template.md's "PDF resumido — what to keep"
spec: hero (destaque do mês, MoM + YoY) + panorama (KPI tiles) + 3-period
comparison table + the single biggest insight. Same color tokens as
assets/dashboard-skeleton.html so the two deliverables read as one system.

Usage:
1. Copy this file.
2. Edit only the REPORT config block below with the client's real data —
   don't touch the rendering code beneath it unless the layout itself
   needs to change.
3. `pip install reportlab` if not already installed, then:
   python pdf-resumido-template.py <output.pdf>
4. Render + eyeball the result before sending (see the pymupdf snippet at
   the bottom of this docstring) — this is what caught a real bug during
   this skill's own build: a KPI tile with no MoM/YoY data was showing a
   false "▼" (down arrow) instead of "sem comparação histórica". Never
   ship a delta arrow when there's nothing to compare against.

    python3 -c "
    import fitz
    doc = fitz.open('output.pdf')
    for i, page in enumerate(doc):
        page.get_pixmap(dpi=150).save(f'preview-{i+1}.png')
    "
"""

import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

# ============================================================================
# REPORT CONFIG — edit this block per client/month. Leave mom/yoy as "" (not
# a fabricated "0%") for any metric with no real comparison, e.g. a
# snapshot-only metric like followers (see metrics-framework.md).
# ============================================================================

REPORT = {
    "file_title": "KGM_Relatorio_NomeCliente_AAAAMM",
    "eyebrow": "RELATÓRIO DE SOCIAL MEDIA · RESUMO EXECUTIVO",
    "client_line": "Instagram de <b><font color='white'>{Nome do Cliente}</font></b> (@{handle}) &middot; {Mês Ano}",

    "hero": {
        "label": "{MÉTRICA EM DESTAQUE} — O DESTAQUE DO MÊS",
        "value": "{valor}",
        "unit": "{unidade, por extenso}",
        "mom": "+0,0%",  # sign-prefixed string; "" if truly no comparison
        "mom_label": "vs. {mês anterior} ({valor anterior})",
        "yoy": "-0,0%",
        "yoy_label": "vs. {mesmo mês, ano anterior} ({valor})",
        "explain": "{Métrica} mede {o que ela mede, em uma frase}. "
                   "{2-3 frases de contexto amarrando MoM e YoY.}",
    },

    "panorama_title": "01&nbsp;&nbsp;PANORAMA DO MÊS — INSTAGRAM",
    # Each tuple: (label, value, unit, mom, yoy, explain). mom/yoy = ""
    # when there's genuinely no comparison (see kpi_cell()) — never fake one.
    "kpis": [
        ("{Métrica 1}", "{valor}", "{unidade}", "+0,0%", "+0,0%", "{explicação em 1 frase}"),
        ("{Métrica 2}", "{valor}", "{unidade}", "+0,0%", "-0,0%", "{explicação em 1 frase}"),
        ("{Métrica 3}", "{valor}", "{unidade}", "+0,0%", "-0,0%", "{explicação em 1 frase}"),
        ("Seguidores", "{valor}", "pessoas", "", "", "Valor atual — API não guarda histórico."),
    ],

    "compare_title": "02&nbsp;&nbsp;COMPARATIVO — 3 PERÍODOS",
    "compare_headers": ["Métrica", "{Ano-1}", "{Mês Ant.}", "{Mês Atual}", "MoM", "YoY"],
    # Each tuple: (metric, year_ago, prior_month, current, mom, yoy)
    "compare_rows": [
        ("{Métrica 1}", "{valor}", "{valor}", "{valor}", "+0,0%", "-0,0%"),
        ("{Métrica 2}", "{valor}", "{valor}", "{valor}", "+0,0%", "+0,0%"),
    ],

    "insight_title": "03&nbsp;&nbsp;INSIGHT DO MÊS",
    "insight": {
        "headline": "{Título do insight mais significativo do mês}",
        "what_happened": "{números e delta reais — MoM e/ou YoY}",
        "recommendation": "{ação específica e testável para o próximo mês}",
    },

    "footer_brand": "KGM Design e Comunicação — Relatório de Social Media",
    "footer_right": "{file_title} &middot; Dashboard completo: {link ou onde encontrar}",
}

# ============================================================================
# RENDERING — shouldn't need edits for a normal monthly run.
# ============================================================================

INK = colors.HexColor("#11201A")
INK_SECONDARY = colors.HexColor("#42504A")
INK_MUTED = colors.HexColor("#72837A")
BORDER = colors.HexColor("#D3DCD6")
GOOD = colors.HexColor("#2E7D4F")
CRITICAL = colors.HexColor("#B23A32")
HERO_BG = colors.HexColor("#0F2620")
WHITE = colors.white

styles = getSampleStyleSheet()

eyebrow_style = ParagraphStyle("eyebrow", parent=styles["Normal"], fontName="Helvetica-Bold",
                                fontSize=8, textColor=colors.HexColor("#7FE0BD"), spaceAfter=4, leading=10)
hero_client_style = ParagraphStyle("hero_client", parent=styles["Normal"], fontName="Helvetica",
                                    fontSize=10, textColor=colors.HexColor("#D9E3DE"), spaceAfter=10)
hero_label_style = ParagraphStyle("hero_label", parent=styles["Normal"], fontName="Helvetica-Bold",
                                   fontSize=8, textColor=colors.HexColor("#9FB0A9"), spaceAfter=2)
hero_number_style = ParagraphStyle("hero_number", parent=styles["Normal"], fontName="Helvetica-Bold",
                                    fontSize=40, textColor=WHITE, leading=42, spaceAfter=2)
hero_unit_style = ParagraphStyle("hero_unit", parent=styles["Normal"], fontName="Helvetica",
                                  fontSize=10, textColor=colors.HexColor("#B9C7C1"), spaceAfter=8)
hero_pills_style = ParagraphStyle("hero_pills", parent=styles["Normal"], fontSize=9.5,
                                   spaceAfter=8, spaceBefore=2)
hero_explain_style = ParagraphStyle("hero_explain", parent=styles["Normal"], fontName="Helvetica",
                                     fontSize=9.5, textColor=colors.HexColor("#D9E3DE"), leading=14)

section_title_style = ParagraphStyle("section_title", parent=styles["Normal"], fontName="Helvetica-Bold",
                                      fontSize=9, textColor=INK_MUTED, spaceBefore=14, spaceAfter=8)

kpi_label_style = ParagraphStyle("kpi_label", parent=styles["Normal"], fontName="Helvetica-Bold",
                                  fontSize=8.5, textColor=INK_SECONDARY, spaceAfter=3)
kpi_value_style = ParagraphStyle("kpi_value", parent=styles["Normal"], fontName="Helvetica-Bold",
                                  fontSize=16, textColor=INK, spaceAfter=2)
kpi_delta_up = ParagraphStyle("kpi_delta_up", parent=styles["Normal"], fontName="Helvetica-Bold",
                               fontSize=7.5, textColor=GOOD, spaceBefore=3)
kpi_delta_down = ParagraphStyle("kpi_delta_down", parent=styles["Normal"], fontName="Helvetica-Bold",
                                 fontSize=7.5, textColor=CRITICAL, spaceBefore=3)
kpi_flat_style = ParagraphStyle("kpi_flat", parent=styles["Normal"], fontName="Helvetica-Bold",
                                 fontSize=7.5, textColor=INK_MUTED, spaceBefore=3)
kpi_explain_style = ParagraphStyle("kpi_explain", parent=styles["Normal"], fontName="Helvetica",
                                    fontSize=7, textColor=INK_MUTED, leading=9, spaceBefore=3)

table_header_style = ParagraphStyle("table_header", parent=styles["Normal"], fontName="Helvetica-Bold",
                                     fontSize=7.5, textColor=INK_MUTED)
table_header_r = ParagraphStyle("table_header_r", parent=table_header_style, alignment=TA_RIGHT)
table_cell_style = ParagraphStyle("table_cell", parent=styles["Normal"], fontName="Helvetica-Bold",
                                   fontSize=8.5, textColor=INK, alignment=TA_RIGHT)
table_cell_muted = ParagraphStyle("table_cell_muted", parent=styles["Normal"], fontName="Helvetica",
                                   fontSize=8.5, textColor=INK_MUTED, alignment=TA_RIGHT)
table_cell_label = ParagraphStyle("table_cell_label", parent=styles["Normal"], fontName="Helvetica-Bold",
                                   fontSize=8.5, textColor=INK, alignment=TA_LEFT)
table_cell_up = ParagraphStyle("table_cell_up", parent=table_cell_style, textColor=GOOD)
table_cell_down = ParagraphStyle("table_cell_down", parent=table_cell_style, textColor=CRITICAL)

insight_h_style = ParagraphStyle("insight_h", parent=styles["Normal"], fontName="Helvetica-Bold",
                                  fontSize=10.5, textColor=INK, spaceAfter=5)
insight_body_style = ParagraphStyle("insight_body", parent=styles["Normal"], fontName="Helvetica",
                                     fontSize=9, textColor=INK_SECONDARY, leading=13, spaceAfter=3)

footer_style = ParagraphStyle("footer_style", parent=styles["Normal"], fontName="Helvetica",
                               fontSize=7.5, textColor=INK_MUTED, leading=11)
footer_style_r = ParagraphStyle("footer_style_r", parent=footer_style, alignment=TA_RIGHT)
footer_brand_style = ParagraphStyle("footer_brand", parent=styles["Normal"], fontName="Helvetica-Bold",
                                     fontSize=8, textColor=INK_SECONDARY)


def _up_down(sign_str, suffix):
    """'+X%' -> '▲ X% {suffix}' ; '-X%' -> '▼ X% {suffix}'."""
    arrow = "▲ " if sign_str.startswith("+") else "▼ "
    return arrow + sign_str[1:] + " " + suffix


def kpi_cell(label, value, unit, mom, yoy, explain):
    if not mom and not yoy:
        # No comparison available (e.g. a snapshot-only metric) — never
        # show a false up/down arrow just because the string is empty.
        delta_para = Paragraph("sem comparação histórica", kpi_flat_style)
    else:
        mom_style = kpi_delta_up if mom.startswith("+") else kpi_delta_down
        text = _up_down(mom, "mês")
        if yoy:
            text += "&nbsp;&nbsp;" + _up_down(yoy, "ano")
        delta_para = Paragraph(text, ParagraphStyle("combo", parent=mom_style))
    return [
        Paragraph(label, kpi_label_style),
        Paragraph(f"{value} <font size=7 color='#72837A'>{unit}</font>", kpi_value_style),
        delta_para,
        Paragraph(explain, kpi_explain_style),
    ]


def cmp_row(metric, y1, y2, y3, mom, yoy):
    mom_style = table_cell_up if mom.startswith("+") else table_cell_down
    yoy_style = table_cell_up if yoy.startswith("+") else table_cell_down
    arrow = lambda s: ("▲" if s.startswith("+") else "▼") + s[1:]
    return [
        Paragraph(metric, table_cell_label),
        Paragraph(y1, table_cell_muted),
        Paragraph(y2, table_cell_muted),
        Paragraph(y3, table_cell_style),
        Paragraph(arrow(mom), mom_style),
        Paragraph(arrow(yoy), yoy_style),
    ]


def build(out_path):
    doc = SimpleDocTemplate(
        out_path, pagesize=A4,
        topMargin=0, bottomMargin=14 * mm,
        leftMargin=16 * mm, rightMargin=16 * mm,
        title=REPORT["file_title"],
    )
    story = []
    r = REPORT

    # ---- Hero ----
    hero = r["hero"]
    mom_color = "#7FE0BD" if hero["mom"].startswith("+") else "#F0A89C"
    yoy_color = "#7FE0BD" if hero["yoy"].startswith("+") else "#F0A89C"
    pills = f"<b><font color='{mom_color}'>{_up_down(hero['mom'], '')}</font></b> {hero['mom_label']}"
    if hero.get("yoy"):
        pills += f" &nbsp;&nbsp;<b><font color='{yoy_color}'>{_up_down(hero['yoy'], '')}</font></b> {hero['yoy_label']}"

    hero_content = [
        Paragraph(r["eyebrow"], eyebrow_style),
        Paragraph(r["client_line"], hero_client_style),
        Paragraph(hero["label"], hero_label_style),
        Paragraph(hero["value"], hero_number_style),
        Paragraph(hero["unit"], hero_unit_style),
        Paragraph(pills, hero_pills_style),
        Paragraph(hero["explain"], hero_explain_style),
    ]
    hero_table = Table([[hero_content]], colWidths=[178 * mm])
    hero_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HERO_BG),
        ("LEFTPADDING", (0, 0), (-1, -1), 16 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 9 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7 * mm),
    ]))
    story.append(hero_table)
    story.append(Spacer(1, 4 * mm))

    # ---- Panorama (KPI tiles) ----
    story.append(Paragraph(r["panorama_title"], section_title_style))
    kpi_cells = [kpi_cell(*k) for k in r["kpis"]]
    col_w = 178 / max(len(kpi_cells), 1) * mm
    kpi_table = Table([kpi_cells], colWidths=[col_w] * len(kpi_cells))
    box_style = [("BOX", (i, 0), (i, 0), 0.6, BORDER) for i in range(len(kpi_cells))]
    kpi_table.setStyle(TableStyle(box_style + [
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 4 * mm))

    # ---- Comparison table ----
    story.append(Paragraph(r["compare_title"], section_title_style))
    header = [Paragraph(r["compare_headers"][0], table_header_style)] + \
             [Paragraph(h, table_header_r) for h in r["compare_headers"][1:]]
    rows = [header] + [cmp_row(*row) for row in r["compare_rows"]]
    n_metric_rows = len(r["compare_rows"])
    cmp_table = Table(rows, colWidths=[42 * mm, 24 * mm, 24 * mm, 24 * mm, 22 * mm, 22 * mm])
    cmp_table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, BORDER),
        ("LINEBELOW", (0, 1), (-1, max(1, n_metric_rows - 1)), 0.4, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(cmp_table)
    story.append(Spacer(1, 4 * mm))

    # ---- Biggest insight ----
    story.append(Paragraph(r["insight_title"], section_title_style))
    ins = r["insight"]
    insight_content = [
        Paragraph(ins["headline"], insight_h_style),
        Paragraph(f"<b>O que aconteceu:</b> {ins['what_happened']}", insight_body_style),
        Paragraph(f"<b>Recomendação:</b> {ins['recommendation']}", insight_body_style),
    ]
    insight_table = Table([[insight_content]], colWidths=[178 * mm])
    insight_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("LINEBEFORE", (0, 0), (0, 0), 3, colors.HexColor("#A3701A")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 6 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6 * mm),
    ]))
    story.append(insight_table)
    story.append(Spacer(1, 4 * mm))

    # ---- Footer ----
    story.append(HRFlowable(width="100%", thickness=0.6, color=BORDER, spaceAfter=6))
    footer_line = Table([[
        Paragraph(f"<b>{r['footer_brand']}</b>", footer_brand_style),
        Paragraph(r["footer_right"], footer_style_r),
    ]], colWidths=[89 * mm, 89 * mm])
    footer_line.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    story.append(footer_line)

    doc.build(story)
    print(f"Built {out_path}")


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "output.pdf"
    build(out)
