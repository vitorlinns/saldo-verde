import { Heart } from 'lucide-react';
import Badge from '../badge/badge';

interface HealthWidgetProps {
  totalEntradas: number;
  totalSaidas: number;
  showValues: boolean;
}

function computeHealthScore(totalEntradas: number, totalSaidas: number) {
  if (totalEntradas <= 0) return 0;

  const saldoTotal = totalEntradas - totalSaidas;
  const ratio = saldoTotal / totalEntradas;
  const score = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return score;
}

export default function HealthWidget({ totalEntradas, totalSaidas, showValues }: HealthWidgetProps) {
  const healthScore = computeHealthScore(totalEntradas, totalSaidas);
  const healthStatus = healthScore >= 70 ? 'Estável' : healthScore >= 40 ? 'Cuidado' : 'Atenção máxima';
  const healthColor = healthScore >= 70 ? 'bg-success' : healthScore >= 40 ? 'bg-warning' : 'bg-danger';
  const healthVariant = healthScore >= 70 ? 'success' : healthScore >= 40 ? 'warning' : 'danger';

  return (
    <div className="rounded-xl border border-border bg-black/80 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-white" />
          <h3 className="text-xl font-regular text-white">Saúde financeira</h3>
        </div>
        <Badge label={healthStatus} variant={healthVariant} />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-white">
            <span>Índice de saúde</span>
            <span className="font-semibold text-white">
              {showValues ? `${healthScore}%` : '•••%'}
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10">
            <div
              className={`h-3 rounded-full ${healthColor}`}
              style={{ width: showValues ? `${healthScore}%` : '4%' }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[14px] text-white">
            <span className="text-left">Atenção</span>
            <span className="text-center">Cuidado</span>
            <span className="text-right">Estável</span>
          </div>
        </div>
      </div>
    </div>
  );
}
