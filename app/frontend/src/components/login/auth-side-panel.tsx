export default function AuthSidePanel() {
  return (
    <div className="hidden lg:flex relative overflow-hidden bg-background lg:min-h-screen lg:items-end lg:px-12 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(130,222,127,0.18),transparent_58%),linear-gradient(90deg,rgba(255,255,255,0.02),transparent_5%)]" />
      <div className="relative max-w-lg space-y-4 pl-5 sm:pl-6 lg:space-y-5 lg:pl-0">
        <h1 className="max-w-md text-2xl font-reguglar leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
          Menos tempo organizando, mais tempo vivendo.
        </h1>
        <p className="max-w-md text-sm leading-7 text-white/70 sm:text-base lg:text-lg lg:leading-8">
          Substitua a burocracia das planilhas por relatórios automáticos que fazem o trabalho chato por você.
        </p>
      </div>
    </div>
  );
}