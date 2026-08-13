import StarFillIcon from 'remixicon-react/StarFillIcon';

type StepsProps = {
  labels?: string[];
  className?: string;
};

const defaultLabels = ['Aprovado por mais de 15k Brasileiros'];

export default function Steps({ labels = defaultLabels, className = '' }: StepsProps) {
  return (
    <div className={className || 'mt-8 grid gap-4 sm:grid-cols-1'}>
      {labels.map((label) => (
        <div key={label} className="flex items-center gap-3">
          <StarFillIcon className="h-6 w-6 text-primary-300" />
          <p className="text-sm font-semibold text-slate-900">{label}</p>
        </div>
      ))}
    </div>
  );
}
