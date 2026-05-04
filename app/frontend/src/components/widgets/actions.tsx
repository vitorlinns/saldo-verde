import { useNavigate } from 'react-router-dom';
import { FilePlus, ArrowUpCircle, ArrowDownCircle, Zap, ArrowUpDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import ButtonSubmit from '../btn/button_submit';

export default function ActionsWidget() {
  const navigate = useNavigate();

  return (
    <div className="rounded-[0.5rem] border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-white" />
        <h3 className="text-lg font-regular text-white">Ações rápidas:</h3>
      </div>
      <div className="mt-4 space-y-3">
        <ButtonSubmit
          type="button"
          label="Registrar entrada"
          icon={<ArrowUpRight className="h-4 w-4" />}
          onClick={() => navigate('/entrada')}
          className="justify-start text-left"
        />
        <ButtonSubmit
          type="button"
          label="Registrar saída"
          icon={<ArrowDownRight className="h-4 w-4" />}
          onClick={() => navigate('/saida')}
          className="justify-start text-left"
        />
        <ButtonSubmit
          type="button"
          label="Todos os registros"
          icon={<ArrowUpDown className="h-4 w-4" />}
          onClick={() => navigate('/registros')}
          className="justify-start text-left"
        />
      </div>
    </div>
  );
}
