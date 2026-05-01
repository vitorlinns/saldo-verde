export default function Footer() {
  return (
    <footer className="mt-6 mb-6 rounded-2xl border border-border bg-black/80 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/60">
        <span>© 2026 Saldo Verde. Todos os direitos reservados.</span>
        <span className="text-white/60">Versão 1.0.0</span>
        <span className="inline-flex items-center gap-2 text-white">
          <span className="font-regular text-white/60">Status do sistema:</span>
          <span className="inline-flex items-center gap-2 font-semibold text-success">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            Online
          </span>
        </span>
      </div>
    </footer>
  );
}
