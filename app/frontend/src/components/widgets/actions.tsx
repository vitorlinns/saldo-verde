import { FilePlus, ArrowUpCircle, ArrowDownCircle, Zap } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';

export default function ActionsWidget() {
  return (
    <div className="rounded-xl border border-border bg-black/80 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Ações rápidas:</h3>
      </div>
      <div className="mt-4 space-y-3">
        <ButtonSubmit
          type="button"
          label="Registrar receita"
          icon={<ArrowUpCircle className="h-4 w-4" />}
          className="justify-start text-left"
        />
        <ButtonSubmit
          type="button"
          label="Registrar despesa"
          icon={<ArrowDownCircle className="h-4 w-4" />}
          className="justify-start text-left"
        />
        <ButtonSubmit
          type="button"
          label="Exportar relatório"
          icon={<FilePlus className="h-4 w-4" />}
          className="justify-start text-left"
        />
      </div>
    </div>
  );
}
