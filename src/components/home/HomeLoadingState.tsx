export const HomeLoadingState = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Animação de loading */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>
      </div>
      
      {/* Texto */}
      <p className="text-slate-400 text-center animate-pulse">
        Detectando sua localização...
      </p>
    </div>
  );
};
