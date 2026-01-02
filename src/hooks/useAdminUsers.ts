import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizarInput } from '@/lib/sanitize';

export interface AdminUser {
  id: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cidade: string;
  estado: string;
  bairro: string;
  created_at: string;
  // From profiles join
  nome?: string;
  email?: string;
}

interface UseAdminUsersOptions {
  pageSize?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { pageSize = 20 } = options;
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // First get aniversariantes
      const { data: aniversariantes, error: anivError, count } = await supabase
        .from('aniversariantes')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (anivError) throw anivError;

      // Get profiles for these users to have nome/email
      const userIds = aniversariantes?.map(a => a.id) || [];
      
      let profilesMap: Record<string, { nome: string; email: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', userIds);

        profiles?.forEach(p => {
          profilesMap[p.id] = { nome: p.nome || '', email: p.email };
        });
      }

      // Merge data
      const enrichedUsers: AdminUser[] = (aniversariantes || []).map(aniv => ({
        ...aniv,
        nome: profilesMap[aniv.id]?.nome || '',
        email: profilesMap[aniv.id]?.email || '',
      }));

      setUsers(enrichedUsers);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Client-side filtering (for search)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const searchSeguro = sanitizarInput(searchTerm, 100).toLowerCase();
    return users.filter(user => 
      user.cpf?.toLowerCase().includes(searchSeguro) ||
      user.telefone?.toLowerCase().includes(searchSeguro) ||
      user.nome?.toLowerCase().includes(searchSeguro) ||
      user.email?.toLowerCase().includes(searchSeguro) ||
      user.cidade?.toLowerCase().includes(searchSeguro)
    );
  }, [users, searchTerm]);

  // Paginated results
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  return {
    users: paginatedUsers,
    allUsers: users,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalCount: filteredUsers.length,
    totalPages,
    pageSize,
    reload: loadUsers,
  };
}
