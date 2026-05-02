import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ButtonSubmit from '../btn/button_submit';
import type { MonthlySummary } from '../../lib/records-storage';

interface DownloadReportsProps {
  balance: number;
  selectedSummary?: MonthlySummary;
  month?: string;
  year?: string;
  monthlySummaries: MonthlySummary[];
  filename?: string;
  printedByName?: string;
  printedByEmail?: string;
}

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

const getReportPeriodLabel = (month?: string, year?: string) => {
  if (month && year) {
    return `Mês ${month.padStart(2, '0')}/${year}`;
  }
  if (month) {
    return `Mês ${month.padStart(2, '0')}`;
  }
  if (year) {
    return `Ano ${year}`;
  }
  return 'Período geral';
};

export default function DownloadReports({
  balance,
  selectedSummary,
  month,
  year,
  monthlySummaries,
  filename = 'relatorio.pdf',
  printedByName = 'Usuário',
  printedByEmail = 'sem-email@saldoverde.pro',
}: DownloadReportsProps) {
  const handleDownload = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const lineHeight = 7;
    const sectionGap = 10;
    const tableTop = 90;

    const periodLabel = getReportPeriodLabel(month, year);
    const summaryLabel = selectedSummary ? selectedSummary.label : periodLabel;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Relatório completo detalhado', margin, 22);

    const printableName = getPrintableName(printedByName);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${periodLabel}`, margin, 32);
    doc.text(`Saldo total: ${formatCurrency(balance)}`, margin, 39);
    doc.text(`Impresso por: ${printableName}`, margin, 46);
    doc.text(`E-mail: ${printedByEmail}`, margin, 53);
    doc.setLineWidth(0.3);
    doc.line(margin, 58, pageWidth - margin, 58);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Resumo selecionado', margin, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryTop = 78;
    const summaryLeft = margin;
    const summaryValueLeft = margin + 70;

    let summaryY = summaryTop;
    if (selectedSummary) {
      doc.text('Período:', summaryLeft, summaryY);
      doc.text(summaryLabel, summaryValueLeft, summaryY);
      summaryY += lineHeight;
      doc.text('Entradas:', summaryLeft, summaryY);
      doc.text(formatCurrency(selectedSummary.totalIncome), summaryValueLeft, summaryY);
      summaryY += lineHeight;
      doc.text('Saídas:', summaryLeft, summaryY);
      doc.text(formatCurrency(selectedSummary.totalExpense), summaryValueLeft, summaryY);
      summaryY += lineHeight;
      doc.text('Saldo líquido:', summaryLeft, summaryY);
      doc.text(formatCurrency(selectedSummary.netAmount), summaryValueLeft, summaryY);
      summaryY += lineHeight;
      doc.text('Registros:', summaryLeft, summaryY);
      doc.text(String(selectedSummary.recordCount), summaryValueLeft, summaryY);
      summaryY += lineHeight;
    } else {
      doc.text('Nenhum mês encontrado para o filtro selecionado.', summaryLeft, summaryY);
      summaryY += lineHeight;
    }

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
