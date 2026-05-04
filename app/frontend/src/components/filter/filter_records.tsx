import { ReactNode } from 'react';
import { X } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';
import InputFilter from '../inputs/input_filter';
import DownloadRecords from '../download/download_records';

const monthLabels = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const getDownloadFilename = (prefix: string, month: string, year: string) => {
  const now = new Date();
  const normalizedMonth = month ? month.padStart(2, '0') : '';
  const normalizedYear = year || '';

  const useCurrentDate = !normalizedMonth && !normalizedYear;
  const monthForLabel = useCurrentDate
    ? String(now.getMonth() + 1).padStart(2, '0')
    : normalizedMonth;
  const yearForLabel = useCurrentDate ? String(now.getFullYear()) : normalizedYear;
  const monthLabel = monthForLabel
    ? monthLabels[Number(monthForLabel) - 1] ?? monthForLabel
    : '';

  if (monthLabel && yearForLabel) {
    return `${prefix}-${monthLabel}-${yearForLabel}.pdf`;
  }
  if (monthLabel) {
    return `${prefix}-${monthLabel}.pdf`;
  }
  if (yearForLabel) {
    return `${prefix}-${yearForLabel}.pdf`;
  }
  return `${prefix}.pdf`;
};

interface DownloadRecord {
  type: string;
  title: string;
  category: string;
  amount: string;
  date: string;
  time: string;
  note: string;
}

interface FilterRecordsProps {
  day?: string;
  month: string;
  year: string;
  records: DownloadRecord[];
  printedByName?: string;
  printedByEmail?: string;
  onDayChange?: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onReset: () => void;
  title?: string;
  description?: string;
  showDayFilter?: boolean;
  showDownload?: boolean;
  downloadComponent?: ReactNode;
}

export default function FilterRecords({
  day = '',
  month,
  year,
  records,
  printedByName,
  printedByEmail,
  onDayChange = () => {},
  onMonthChange,
  onYearChange,
  onReset,
  title = 'Filtrar registros',
  description = 'Use dia, mês e ano para encontrar a transação certa.',
  showDayFilter = true,
  showDownload = true,
  downloadComponent,
}: FilterRecordsProps) {
  return (
    <div className="rounded-[0.5rem] border border-border bg-surface p-4 shadow-xl shadow-black/20 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-regular text-white sm:text-lg">{title}</h2>
        <p className="mt-2 text-sm text-white/60">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {showDayFilter ? (
          <InputFilter
            id="filterDay"
            type="text"
            value={day}
            onChange={onDayChange}
            placeholder="Dia"
            maxLength={2}
            className="w-16"
          />
        ) : null}
        <InputFilter
          id="filterMonth"
          type="text"
          value={month}
          onChange={onMonthChange}
          placeholder="Mês"
          maxLength={2}
          className="w-16"
        />
        <InputFilter
          id="filterYear"
          type="text"
          value={year}
          onChange={onYearChange}
          placeholder="Ano"
          maxLength={4}
          className="w-20"
        />

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <ButtonSubmit
            type="button"
            label="Limpar"
            icon={<X className="h-4 w-4" />}
            onClick={onReset}
            fullWidth={false}
            className="!h-10 !px-4 text-xs sm:!h-11 sm:!px-6 sm:text-sm"
          />
          {downloadComponent ? (
            <>{downloadComponent}</>
          ) : showDownload ? (
            <DownloadRecords
              records={records}
              filename={getDownloadFilename('registros', month, year)}
              printedByName={printedByName}
              printedByEmail={printedByEmail}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
