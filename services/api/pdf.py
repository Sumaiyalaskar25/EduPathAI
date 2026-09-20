# services/api/pdf.py
"""Minimal, dependency-light PDF rendering shared by a couple of
"export as PDF" buttons (audit proof, gov policy brief). Not a
templating engine — just enough structured layout to produce a real,
readable document instead of a stub."""
from __future__ import annotations

import io
from typing import Iterable

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def render_document_pdf(title: str, subtitle: str, sections: Iterable[tuple[str, list[tuple[str, str]]]]) -> bytes:
    """
    sections: list of (heading, [(label, value), ...])
    Returns raw PDF bytes.
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    x_margin = 20 * mm
    y = height - 25 * mm

    c.setFont("Helvetica-Bold", 16)
    c.drawString(x_margin, y, title)
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    c.setFillGray(0.35)
    c.drawString(x_margin, y, subtitle)
    c.setFillGray(0)
    y -= 10 * mm

    for heading, rows in sections:
        if y < 30 * mm:
            c.showPage()
            y = height - 25 * mm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x_margin, y, heading)
        y -= 7 * mm
        c.setFont("Courier", 9)
        for label, value in rows:
            if y < 20 * mm:
                c.showPage()
                y = height - 25 * mm
                c.setFont("Courier", 9)
            text = f"{label}: {value}"
            # Wrap long values (hashes, URLs) across lines.
            max_chars = 95
            for i in range(0, len(text), max_chars):
                c.drawString(x_margin, y, text[i:i + max_chars])
                y -= 5 * mm
        y -= 5 * mm

    c.showPage()
    c.save()
    return buf.getvalue()
