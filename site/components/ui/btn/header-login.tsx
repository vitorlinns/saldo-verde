import UserLineIcon from 'remixicon-react/UserLineIcon';

export default function HeaderLogin() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
    >
      <UserLineIcon className="h-4 w-4 text-primary-700" />
      Entrar
    </button>
  );
}
