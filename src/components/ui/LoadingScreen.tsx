export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-space-950 flex flex-col items-center justify-center z-50">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">⊕</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm">Calculando órbita…</p>
    </div>
  );
}
