import CheckLineIcon from 'remixicon-react/CheckLineIcon';

export default function HeaderCta() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
    >
      <CheckLineIcon className="h-4 w-4" />
      Começar agora
    </button>
  );
}
