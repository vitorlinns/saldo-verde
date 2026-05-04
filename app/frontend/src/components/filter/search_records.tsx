import { Search } from 'lucide-react';
import InputFilter from '../inputs/input_filter';

interface SearchRecordsProps {
  query: string;
  onChange: (value: string) => void;
}

export default function SearchRecords({ query, onChange }: SearchRecordsProps) {
  return (
    <div className="w-full max-w-[24rem] rounded-[0.5rem] border border-border bg-surface p-4 sm:p-6 lg:max-w-none">
      <div className="mb-4">
        <h2 className="text-base font-regular text-white sm:text-lg">Buscar registros</h2>
        <p className="mt-2 text-sm text-white/60">
          Digite 3 caracteres para pesquisar por título, categoria ou valor.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60 sm:left-4">
          <Search className="h-4 w-4" />
        </div>
        <InputFilter
          id="searchRecords"
          type="text"
          value={query}
          onChange={onChange}
          maxLength={25}
          placeholder="Buscar..."
          className="w-full sm:w-72 lg:w-full pl-10 sm:pl-12"
        />
      </div>
    </div>
  );
}
