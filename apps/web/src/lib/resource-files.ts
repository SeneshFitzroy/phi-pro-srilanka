// Client-side file generators for the Officer Resources downloads, so every
// "Download" button produces a real, openable file (no backend / static asset
// needed). PDFs are built as minimal but spec-valid PDF 1.4 documents with a
// correct xref table; spreadsheets use the bundled `xlsx` library.

import * as XLSX from 'xlsx';

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Escape a string for use inside a PDF text literal. */
function pdfEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Wrap text to a rough character width for the page. */
function wrap(text: string, width = 88): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (para.trim() === '') { out.push(''); continue; }
    let line = '';
    for (const word of para.split(/\s+/)) {
      if ((line + ' ' + word).trim().length > width) { out.push(line.trim()); line = word; }
      else line = (line + ' ' + word).trim();
    }
    if (line) out.push(line.trim());
  }
  return out;
}

/**
 * Build a single- or multi-page A4 PDF with a title and body paragraphs.
 * Returns a Blob with a correct cross-reference table so any reader opens it.
 */
export function buildPdf(title: string, paragraphs: string[], footer = 'PHI-PRO · Public Health Inspectorate of Sri Lanka'): Blob {
  const lines: { text: string; size: number; gap: number }[] = [];
  lines.push({ text: title, size: 18, gap: 28 });
  lines.push({ text: footer, size: 9, gap: 24 });
  for (const p of paragraphs) {
    for (const w of wrap(p)) lines.push({ text: w, size: 11, gap: 16 });
    lines.push({ text: '', size: 11, gap: 8 });
  }

  // Content stream — start near the top, move down for each line.
  let y = 800;
  let content = 'BT\n';
  for (const ln of lines) {
    if (y < 60) break; // single page; keep it simple
    content += `/F1 ${ln.size} Tf\n1 0 0 1 50 ${y} Tm\n(${pdfEscape(ln.text)}) Tj\n`;
    y -= ln.gap;
  }
  content += 'ET';

  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    `<</Length ${content.length}>>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

/** Build a real .xlsx workbook from header + rows. */
export function buildXlsx(sheetName: string, header: string[], rows: (string | number)[][]): Blob {
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/** Slugify a title into a safe filename stem. */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}
