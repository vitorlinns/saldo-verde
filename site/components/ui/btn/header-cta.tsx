import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon';

export default function HeaderCta() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-primary-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
    >
      Começar agora
      <ArrowRightSLineIcon className="h-4 w-4 text-black" />
    </button>
  );
}
