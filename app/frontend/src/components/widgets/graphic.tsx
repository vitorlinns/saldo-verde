import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface GraphicDataPoint {
  label: string;
  entradas: number;
  saidas: number;
}

interface GraphicProps {
  data: GraphicDataPoint[];
  showValues: boolean;
}

export default function Graphic({ data, showValues }: GraphicProps) {
  const chartData = data;

  return (
    <div className="rounded-[0.5rem] border border-border bg-surface p-6">
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-white" />
        <h2 className="text-xl font-regular text-white">Fluxo de entradas e saídas</h2>
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
          <ComposedChart data={chartData} margin={{ top: 20, right: 8, left: 4, bottom: 0 }} style={{ outline: 'none' }}>
            <CartesianGrid stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              tickFormatter={(value) => (showValues ? String(value) : '')}
              width={48}
              domain={[0, 'dataMax']}
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
            <Area
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke="#22c55e"
              strokeWidth={2}
              fill="#22c55e"
              fillOpacity={0.12}
              dot={{ fill: '#22c55e', stroke: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="saidas"
              name="Saídas"
              stroke="#f87171"
              strokeWidth={2}
              fill="#f87171"
              fillOpacity={0.12}
              dot={{ fill: '#f87171', stroke: '#f87171', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
