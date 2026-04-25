import MedalLineIcon from 'remixicon-react/MedalLineIcon';

export default function Badge() {
  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-primary-900">
      <MedalLineIcon className="h-4 w-4" />
      N° 1 em organização financeira no Brasil
    </div>
  );
}
