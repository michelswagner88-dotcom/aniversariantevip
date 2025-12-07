import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TOTAL_CATEGORIAS, TOTAL_SUBCATEGORIAS } from '@/constants/categories';
import { RefreshCw, X } from 'lucide-react';

const APP_VERSION = '2.15.0';

const VersionBadge = () => {
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Refresh forçado
  const handleForceRefresh = async () => {
    setRefreshing(true);
    
    // 1. Limpar React Query
    queryClient.clear();
    
    // 2. Limpar caches do navegador
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // 3. Limpar localStorage/sessionStorage relacionado
    localStorage.removeItem('app_version');
    sessionStorage.clear();
    
    // 4. Recarregar página ignorando cache
    window.location.reload();
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-20 left-4 z-50 p-2 bg-black/70 hover:bg-black/90 text-white text-xs rounded-full transition-all"
        title="Ver versão"
      >
        v{APP_VERSION}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 p-3 bg-black/90 backdrop-blur-sm text-white text-xs rounded-xl shadow-lg min-w-[180px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/20">
        <span className="font-bold">🔧 Debug Info</span>
        <button 
          onClick={() => setExpanded(false)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-3">
        <p><span className="text-gray-400">Versão:</span> <span className="font-mono">{APP_VERSION}</span></p>
        <p><span className="text-gray-400">Categorias:</span> <span className="font-mono">{TOTAL_CATEGORIAS}</span></p>
        <p>
          <span className="text-gray-400">Subcategorias:</span>{' '}
          <span className={`font-mono font-bold ${TOTAL_SUBCATEGORIAS === 165 ? 'text-green-400' : 'text-red-400'}`}>
            {TOTAL_SUBCATEGORIAS}
          </span>
          {TOTAL_SUBCATEGORIAS === 165 ? ' ✅' : ' ❌'}
        </p>
        <p><span className="text-gray-400">Build:</span> <span className="font-mono text-[10px]">{new Date().toLocaleString('pt-BR')}</span></p>
      </div>

      {/* Refresh Button */}
      <button
        onClick={handleForceRefresh}
        disabled={refreshing}
        className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
      >
        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        {refreshing ? 'Limpando...' : 'Forçar Refresh'}
      </button>
      
      {/* Dica */}
      <p className="text-[10px] text-gray-500 mt-2 text-center">
        Subs = 165 significa versão atualizada
      </p>
    </div>
  );
};

export default VersionBadge;
