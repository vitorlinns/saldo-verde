import { ArrowUpRight, Clock, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ButtonSubmit from '../btn/button_submit';
import HistoricalCard from '../cards/historical_card';

interface HistoricalWidgetProps {
  showValues: boolean;
  records: Array<{
    type: 'income' | 'expense';
    title: string;
    category: string;
    amount: string;
  }>;
}

export default function HistoricalWidget({ showValues, records }: HistoricalWidgetProps) {
  const navigate = useNavigate();

  return (
    <div className="h-full rounded-[0.5rem] border border-border bg-surface p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-white" />
          <h2 className="text-xl font-regular text-white">Registros recentes</h2>
        </div>
        <ButtonSubmit
          type="button"
          label="Ver todas"
          icon={<WalletCards className="h-4 w-4" />}
          fullWidth={false}
         
          onClick={() => navigate('/registros')}
        />
      </div>

      <div className="space-y-3">
        {records.length > 0 ? (
          records.map((item) => (
            <HistoricalCard
              key={`${item.title}-${item.category}-${item.amount}`}
              type={item.type}
              title={item.title}
              category={item.category}
              amount={showValues ? item.amount : '•••••••'}
            />
          ))
        ) : (
          <p className="text-sm text-white/70">Nenhum registro recente disponível.</p>
        )}
      </div>
    </div>
  );
}
