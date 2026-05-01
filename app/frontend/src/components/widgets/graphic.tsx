import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface GraphicProps {
  totalEntradas: number;
  totalSaidas: number;
  showValues: boolean;
}

const monthLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export default function Graphic({ totalEntradas, totalSaidas, showValues }: GraphicProps) {
  const entradaRatios = [0.18, 0.22, 0.28, 0.25, 0.31, 0.29, 0.33, 0.35, 0.32, 0.44, 0.29, 0.52];
  const saidaRatios = [0.12, 0.18, 0.10, 0.20, 0.14, 0.22, 0.11, 0.19, 0.16, 0.25, 0.13, 0.21];

  const data = monthLabels.map((month, index) => ({
    month,
    entradas: Math.round(totalEntradas * entradaRatios[index]),
    saidas: Math.round(totalSaidas * saidaRatios[index]),
  }));

  return (
    <div className="rounded-2xl border border-border bg-black/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-white" />
        <h2 className="text-xl font-semibold text-white">Fluxo de entradas e saídas</h2>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-white/70">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          Entradas
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
          Saídas
        </span>
      </div>
      <div className="h-[300px] w-full focus:outline-none" style={{ outline: 'none' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 8, left: 4, bottom: 0 }} style={{ outline: 'none' }}>
            <CartesianGrid stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              tickFormatter={(value) => (showValues ? String(value) : '')}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={((value: any, name: any) => [
                showValues ? `R$ ${Number(value ?? 0).toLocaleString('pt-BR')}` : '••••••',
                showValues ? `${name}:` : name,
              ]) as any}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
            <Line type="natural" dataKey="entradas" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={false} strokeLinejoin="round" strokeLinecap="round" />
            <Line type="natural" dataKey="saidas" stroke="#f87171" strokeWidth={3} dot={false} activeDot={false} strokeLinejoin="round" strokeLinecap="round" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
