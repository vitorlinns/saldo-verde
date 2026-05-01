import { ArrowUpRight, Clock } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';
import CardRecords from '../cards/card_records';

interface TransactionItem {
  type: 'income' | 'expense';
  title: string;
  subtitle: string;
  description: string;
  amount: string;
  date: string;
  time: string;
}

interface HistoricalWidgetProps {
  showValues: boolean;
}

const historicalItems: TransactionItem[] = [
  {
    type: 'income',
    title: 'Venda de serviço',
    subtitle: 'Receita recorrente registrada',
    description: 'Cliente PagueJá em dia',
    amount: '+ R$ 2.450,00',
    date: '02/05/2026',
    time: '10:24',
  },
  {
    type: 'expense',
    title: 'Compra de material',
    subtitle: 'Despesa aprovada para operação',
    description: 'Fornecimento de escritório',
    amount: '- R$ 720,00',
    date: '01/05/2026',
    time: '14:12',
  },
  {
    type: 'income',
    title: 'Serviço de consultoria',
    subtitle: 'Receita de contrato fechado',
    description: 'Projeto entregue ao cliente XYZ',
    amount: '+ R$ 1.200,00',
    date: '28/04/2026',
    time: '09:40',
  },
];

export default function HistoricalWidget({ showValues }: HistoricalWidgetProps) {
  return (
    <div className="h-full rounded-xl border border-border bg-black/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-white" />
          <h2 className="text-xl font-semibold text-white">Últimas movimentações</h2>
        </div>
        <ButtonSubmit
          type="button"
          label="Ver todas"
          icon={<ArrowUpRight className="h-4 w-4" />}
          fullWidth={false}
          className="rounded-full px-4 text-sm"
        />
      </div>

      <div className="space-y-3">
        {historicalItems.map((item) => (
          <CardRecords
            key={`${item.title}-${item.date}-${item.time}`}
            type={item.type}
            title={item.title}
            subtitle={item.subtitle}
            amount={showValues ? item.amount : '•••••••'}
            date={item.date}
            time={item.time}
          />
        ))}
      </div>
    </div>
  );
}
