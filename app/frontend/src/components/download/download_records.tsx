import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ButtonSubmit from '../btn/button_submit';

interface DownloadRecordsProps {
  records: Array<{
    type: string;
    title: string;
    category: string;
    amount: string;
    date: string;
    time: string;
    note: string;
  }>;
  filename?: string;
  printedByName?: string;
  printedByEmail?: string;
}

export default function DownloadRecords({
  records,
  filename = 'registros.pdf',
  printedByName = 'Usuário',
  printedByEmail = 'sem-email@saldoverde.pro',
}: DownloadRecordsProps) {
  const handleDownload = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 5;
    const rowGap = 2;
    const headerGap = 8;
    const topMargin = 28;
    const columnGap = 3;
    const columns = [
      { label: 'Tipo', width: 12 },
      { label: 'Título', width: 32 },
      { label: 'Categoria', width: 24 },
      { label: 'Valor', width: 28 },
      { label: 'Data', width: 18 },
      { label: 'Horário', width: 14 },
      {
        label: 'Detalhes',
        width:
          pageWidth -
          margin * 2 -
          (12 + 32 + 24 + 28 + 18 + 14) -
          columnGap * 6,
      },
    ];
    const xPositions = columns.reduce<number[]>((positions, column, index) => {
      if (index === 0) return [margin];
      return [...positions, positions[index - 1] + columns[index - 1].width + columnGap];
    }, []);

    const formatCurrency = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const getPrintableName = (name?: string) => {
      if (!name) return 'Usuário';
      const firstWord = name.split(' ')[0].trim();
      if (firstWord.includes('@')) {
        return firstWord.split('@')[0].split(/[._-]/)[0] || 'Usuário';
      }
      return firstWord || 'Usuário';
    };

    const parseAmount = (value: string) => {
      const numeric = value.replace(/[^0-9-,]/g, '').replace(/\./g, '').replace(',', '.');
      return Number(numeric);
    };

    const totalIncome = records
      .map((record) => parseAmount(record.amount))
      .filter((amount) => amount > 0)
      .reduce((sum, amount) => sum + amount, 0);
    const totalExpense = records
      .map((record) => parseAmount(record.amount))
      .filter((amount) => amount < 0)
      .reduce((sum, amount) => sum + amount, 0);

    const printHeader = (y: number) => {
      doc.setFont('helvetica', 'bold');
      columns.forEach((column, index) => {
        doc.text(column.label, xPositions[index], y);
      });
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      return y + lineHeight + headerGap;
    };

    doc.setFontSize(14);
    doc.text('Registros completo detalhado', margin, 14);
    doc.setFontSize(8);
    doc.setTextColor('#6b7280');
    doc.text(`Total: ${records.length}`, pageWidth - margin, 14, { align: 'right' });
    doc.setTextColor('#000000');

    let y = topMargin;
    y = printHeader(y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    records.forEach((record, recordIndex) => {
      const titleLines = doc.splitTextToSize(record.title, columns[1].width);
      const categoryLines = doc.splitTextToSize(record.category, columns[2].width);
      const noteLines = doc.splitTextToSize(record.note || '—', columns[6].width);
      const maxLines = Math.max(titleLines.length, categoryLines.length, noteLines.length, 1);
      const neededHeight = maxLines * lineHeight;

      const footerHeight = 3 * lineHeight + 6;
      const isLastRecord = recordIndex === records.length - 1;
      const needsFooterSpace = y + neededHeight + footerHeight > pageHeight - margin;

      if (isLastRecord && needsFooterSpace) {
        doc.addPage();
        y = topMargin;
        y = printHeader(y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
      } else if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = topMargin;
        y = printHeader(y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
      }

      doc.text(record.type === 'income' ? 'Entrada' : 'Saída', xPositions[0], y);
      doc.text(titleLines, xPositions[1], y);
      doc.text(categoryLines, xPositions[2], y);
      doc.text(formatCurrency(parseAmount(record.amount)), xPositions[3], y);
      doc.text(record.date, xPositions[4], y);
      doc.text(record.time, xPositions[5], y);
      doc.text(noteLines, xPositions[6], y);
      y += neededHeight + rowGap;

      if (isLastRecord) {
        y += 6;
        if (y + footerHeight > pageHeight - margin) {
          doc.addPage();
          y = topMargin;
          y = printHeader(y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }

        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.text(`Total entradas: ${formatCurrency(totalIncome)}`, xPositions[0], y);
        y += lineHeight;
        doc.text(`Total saídas: ${formatCurrency(totalExpense)}`, xPositions[0], y);
        y += lineHeight + 2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const printableName = getPrintableName(printedByName);
        doc.text(`Impresso por: ${printableName}`, xPositions[0], y);
        y += lineHeight;
        doc.text(`Email: ${printedByEmail}`, xPositions[0], y);
      }
    });

    doc.save(filename);
  };

  return (
    <ButtonSubmit
      type="button"
      label="Baixar PDF"
      icon={<Download className="h-4 w-4" />}
      onClick={handleDownload}
      fullWidth={false}
    />
  );
}
