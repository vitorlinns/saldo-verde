import { Search } from 'lucide-react';
import InputFilter from '../inputs/input_filter';

interface SearchRecordsProps {
  query: string;
  onChange: (value: string) => void;
}

export default function SearchRecords({ query, onChange }: SearchRecordsProps) {
  return (
    <div className="rounded-[0.5rem] border border-border bg-surface p-6">
      <div className="mb-4">
        <h2 className="text-lg font-regular text-white">Buscar registros</h2>
        <p className="mt-2 text-sm text-white/60">
          Digite 3 caracteres para pesquisar por título, categoria ou valor.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/60">
          <Search className="h-4 w-4" />
        </div>
        <InputFilter
          id="searchRecords"
          type="text"
          value={query}
          onChange={onChange}
          placeholder="Buscar..."
          className="w-full pl-12"
        />
      </div>
    </div>
  );
}
