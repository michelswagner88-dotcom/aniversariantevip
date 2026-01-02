import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Building2, Users, Settings, Search, TrendingUp, Mail, Shield, Upload, Map, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalSearchCommandProps {
  onNavigate: (tab: string) => void;
}

interface SearchResult {
  id: string;
  type: 'establishment' | 'user';
  title: string;
  subtitle: string;
}

export function GlobalSearchCommand({ onNavigate }: GlobalSearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut ⌘K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const searchLower = search.toLowerCase();

        // Search establishments
        const { data: establishments } = await supabase
          .from('estabelecimentos')
          .select('id, nome_fantasia, cidade, categoria')
          .is('deleted_at', null)
          .or(`nome_fantasia.ilike.%${search}%,cidade.ilike.%${search}%,cnpj.ilike.%${search}%`)
          .limit(5);

        // Search users (aniversariantes + profiles)
        const { data: users } = await supabase
          .from('aniversariantes')
          .select('id, cpf, cidade')
          .is('deleted_at', null)
          .or(`cpf.ilike.%${search}%,cidade.ilike.%${search}%`)
          .limit(5);

        const searchResults: SearchResult[] = [];

        establishments?.forEach(est => {
          searchResults.push({
            id: est.id,
            type: 'establishment',
            title: est.nome_fantasia || 'Sem nome',
            subtitle: `${est.cidade || 'Cidade não informada'} • ${est.categoria?.[0] || 'Sem categoria'}`,
          });
        });

        users?.forEach(user => {
          searchResults.push({
            id: user.id,
            type: 'user',
            title: user.cpf || 'CPF não informado',
            subtitle: user.cidade || 'Cidade não informada',
          });
        });

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = useCallback((type: string, id?: string) => {
    setOpen(false);
    setSearch('');
    
    if (type === 'establishment' && id) {
      onNavigate('establishments');
    } else if (type === 'user' && id) {
      onNavigate('users');
    } else {
      onNavigate(type);
    }
  }, [onNavigate]);

  const quickActions = [
    { icon: TrendingUp, label: 'Dashboard', action: 'overview' },
    { icon: Users, label: 'Usuários', action: 'users' },
    { icon: Building2, label: 'Estabelecimentos', action: 'establishments' },
    { icon: Map, label: 'Mapa', action: 'mapa' },
    { icon: Mail, label: 'E-mails', action: 'email-analytics' },
    { icon: Shield, label: 'Segurança', action: 'security' },
    { icon: UserCog, label: 'Colaboradores', action: 'colaboradores' },
  ];

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
      >
        <Search size={16} />
        <span>Buscar...</span>
        <kbd className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-500">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar estabelecimentos, usuários, ações..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? 'Buscando...' : 'Nenhum resultado encontrado.'}
          </CommandEmpty>

          {results.length > 0 && (
            <>
              <CommandGroup heading="Resultados">
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result.type, result.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {result.type === 'establishment' ? (
                      <Building2 className="w-4 h-4 text-violet-400" />
                    ) : (
                      <Users className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Ações Rápidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.action}
                onSelect={() => handleSelect(action.action)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <action.icon className="w-4 h-4 text-slate-400" />
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
