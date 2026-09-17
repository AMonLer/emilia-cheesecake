// Genera un CV de ejemplo en PDF (una página) para el demo For You de la home.
// Sin dependencias: PDF 1.4 escrito a mano, fuentes estándar (Helvetica).
// Ojo: el contenido usa solo caracteres latin1 (WinAnsi), nada de emojis ni
// guiones largos tipográficos.
import { writeFileSync } from 'fs'

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

const lines = [
  { text: 'LUKAS SCHNEIDER', font: 'F1', size: 24, y: 780 },
  { text: 'Finanzanalyst', font: 'F2', size: 13, y: 758 },
  { text: 'Profil', font: 'F1', size: 11, y: 718 },
  { text: 'Analytischer Finanzprofi mit Erfahrung in Unternehmensfinanzen,', font: 'F2', size: 10, y: 702 },
  { text: 'Controlling und Investmentanalysen.', font: 'F2', size: 10, y: 688 },
  { text: 'Berufserfahrung', font: 'F1', size: 11, y: 658 },
  { text: 'Finanzanalyst - Nexora Capital Partners, München (03/2022 - heute)', font: 'F2', size: 10, y: 642 },
  { text: 'Corporate Finance Analyst - Helios Advisory GmbH, Frankfurt (07/2020 - 02/2022)', font: 'F2', size: 10, y: 626 },
  { text: 'Werkstudent Controlling - Siemens Healthineers AG, Erlangen (10/2018 - 06/2020)', font: 'F2', size: 10, y: 610 },
  { text: 'Ausbildung', font: 'F1', size: 11, y: 580 },
  { text: 'M.Sc. Finance & Accounting - Ludwig-Maximilians-Universität München', font: 'F2', size: 10, y: 564 },
  { text: 'B.Sc. Betriebswirtschaftslehre - WHU, Vallendar', font: 'F2', size: 10, y: 548 },
  { text: 'Sprachen', font: 'F1', size: 11, y: 518 },
  { text: 'Deutsch (Muttersprache), Englisch (fliessend), Französisch (B2)', font: 'F2', size: 10, y: 502 },
  { text: 'Kontakt', font: 'F1', size: 11, y: 472 },
  { text: 'lukas.schneider@mail.de - +49 176 987 654 32 - München, Deutschland', font: 'F2', size: 10, y: 456 },
  { text: 'Hobbys: Trailrunning, Kochen - und ein überdurchschnittliches Interesse an Cheesecake.', font: 'F2', size: 9, y: 420 },
]

const content = lines
  .map((l) => `BT /${l.font} ${l.size} Tf 56 ${l.y} Td (${esc(l.text)}) Tj ET`)
  .join('\n')

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
]

let pdf = '%PDF-1.4\n'
const offsets = []
for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, 'latin1'))
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
}
const xrefStart = Buffer.byteLength(pdf, 'latin1')
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
for (let i = 0; i < objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

writeFileSync('public/lebenslauf-lukas-schneider.pdf', Buffer.from(pdf, 'latin1'))
console.log('PDF escrito:', Buffer.byteLength(pdf, 'latin1'), 'bytes')
