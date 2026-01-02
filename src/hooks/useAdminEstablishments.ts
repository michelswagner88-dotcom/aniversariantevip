import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizarInput } from '@/lib/sanitize';

export interface AdminEstablishment {
  id: string;
  codigo: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  cidade: string;
  estado: string;
  bairro: string;
  categoria: string[];
  ativo: boolean;
  deleted_at: string | null;
  logo_url: string;
  galeria_fotos: string[];
  horario_funcionamento: string;
  latitude: number;
  longitude: number;
  created_at: string;
  whatsapp: string;
  instagram: string;
  descricao_beneficio: string;
}

interface UseAdminEstablishmentsOptions {
  pageSize?: number;
  showDeleted?: boolean;
}

export function useAdminEstablishments(options: UseAdminEstablishmentsOptions = {}) {
  const { pageSize = 20, showDeleted = false } = options;
  
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loadEstablishments = async () => {
    setLoading(true);
    try {
      let query = supabase.from('estabelecimentos').select('*');
      
      if (!showDeleted) {
        query = query.is('deleted_at', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEstablishments(data || []);
    } catch (error) {
      console.error('Error loading establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstablishments();
  }, [showDeleted]);

  // Get unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = establishments.map(e => e.cidade).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [establishments]);

  // Client-side filtering
  const filteredEstablishments = useMemo(() => {
    const searchSeguro = sanitizarInput(searchTerm, 100);
    const codeSeguro = sanitizarInput(searchCode, 6);
    const citySeguro = sanitizarInput(filterCity, 100);
    const categorySeguro = sanitizarInput(filterCategory, 50);
    
    return establishments.filter(est => {
      const matchesCode = !codeSeguro || est.codigo?.includes(codeSeguro);
      
      const matchesSearch = !searchSeguro || 
        est.nome_fantasia?.toLowerCase().includes(searchSeguro.toLowerCase()) ||
        est.cnpj?.includes(searchSeguro) ||
        est.cidade?.toLowerCase().includes(searchSeguro.toLowerCase());
      
      const matchesCity = !citySeguro || est.cidade === citySeguro;
      const matchesCategory = !categorySeguro || est.categoria?.includes(categorySeguro);
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && est.ativo) || 
        (filterStatus === 'inactive' && !est.ativo);

      if (codeSeguro) {
        return matchesCode && matchesStatus;
      }

      return matchesSearch && matchesCity && matchesCategory && matchesStatus;
    });
  }, [establishments, searchTerm, searchCode, filterCity, filterCategory, filterStatus]);

  // Paginated results
  const paginatedEstablishments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredEstablishments.slice(start, end);
  }, [filteredEstablishments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEstablishments.length / pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: establishments.length,
    active: establishments.filter(e => e.ativo && !e.deleted_at).length,
    inactive: establishments.filter(e => !e.ativo && !e.deleted_at).length,
    deleted: establishments.filter(e => e.deleted_at).length,
    semFoto: establishments.filter(e => !e.logo_url).length,
    semGaleria: establishments.filter(e => !e.galeria_fotos || e.galeria_fotos.length === 0).length,
    semHorario: establishments.filter(e => !e.horario_funcionamento).length,
  }), [establishments]);

  return {
    establishments: paginatedEstablishments,
    allEstablishments: establishments,
    filteredEstablishments,
    loading,
    searchTerm,
    setSearchTerm,
    searchCode,
    setSearchCode,
    filterCity,
    setFilterCity,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalCount: filteredEstablishments.length,
    totalPages,
    pageSize,
    uniqueCities,
    stats,
    reload: loadEstablishments,
  };
}
