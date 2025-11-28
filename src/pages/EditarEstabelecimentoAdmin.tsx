import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  CheckCircle, 
  Building2, 
  MapPin, 
  Clock, 
  Image, 
  Link, 
  Calendar, 
  RefreshCw, 
  Ruler, 
  ShoppingBag,
  Info,
  Phone,
  MessageSquare,
  Globe,
  Instagram,
  Camera,
  Loader2
} from 'lucide-react';
import { validateCNPJ, formatCNPJ, fetchCNPJData } from '@/lib/validators';
import { useCepLookup } from '@/hooks/useCepLookup';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { HorarioFuncionamentoEditor } from '@/components/admin/HorarioFuncionamentoEditor';

// Categorias disponíveis
const AVAILABLE_CATEGORIES = [
  'Academia', 'Bar', 'Barbearia', 'Cafeteria', 'Casa Noturna', 
  'Entretenimento', 'Hospedagem', 'Loja de Presentes', 'Moda e Acessórios', 
  'Confeitaria', 'Restaurante', 'Salão de Beleza', 'Saúde e Suplementos', 
  'Outros Comércios', 'Serviços'
];

const formatPhone = (phone: string) => {
  const raw = phone?.replace(/\D/g, '').substring(0, 11) || '';
  if (raw.length === 11) {
    return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (raw.length === 10) {
    return raw.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return raw;
};

const BenefitRulesSection = ({ rules, setRules }: any) => {
  const MAX_CHARS = 200;

  const handleTextChange = (e: any) => {
    const text = e.target.value.substring(0, MAX_CHARS);
    setRules((prev: any) => ({ ...prev, description: text }));
  };

  const setScope = (scope: string) => {
    setRules((prev: any) => ({ ...prev, scope }));
  };

  return (
    <div className="border border-violet-200 bg-violet-50 p-4 rounded-xl space-y-3">
      <h3 className="text-lg font-bold text-violet-800 flex items-center gap-2">
        <Ruler size={20} /> Regras de Benefício
      </h3>
      
      <div className="relative">
        <textarea
          value={rules.description}
          onChange={handleTextChange}
          placeholder="Ex: 10% de desconto em qualquer produto, válido de segunda a sexta."
          rows={4}
          className="w-full p-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none"
        />
        <div className="absolute bottom-2 right-3 text-xs text-slate-500">
          {rules.description.length} / {MAX_CHARS}
        </div>
      </div>

      <div className="pt-2">
        <label className="block text-sm font-semibold text-violet-800 mb-2">Escopo da Regra</label>
        <div className="flex gap-2">
          {['Dia', 'Semana', 'Mês'].map(scope => (
            <button
              key={scope}
              type="button"
              onClick={() => setScope(scope)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                rules.scope === scope 
                  ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-violet-100'
              }`}
            >
              <Calendar size={16} className="inline mr-1" /> {scope}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function EditarEstabelecimentoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fetchingPhoto, setFetchingPhoto] = useState(false);
  const [cnpjVerified, setCnpjVerified] = useState(false);
  const [error, setError] = useState('');
  
  const [establishmentData, setEstablishmentData] = useState({
    cnpj: '',
    name: '',
    cep: '',
    logradouro: '',
    numero: '',
    semNumero: false,
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    isMall: false,
    categories: [] as string[],
    menuLink: '',
    siteLink: '', 
    instagramUser: '', 
    phoneFixed: '', 
    phoneWhatsapp: '', 
    slogan: '', 
    mainPhotoUrl: '',
    hoursJson: '',
  });
  
  const [rules, setRules] = useState({ description: '', scope: 'Dia' });
  
  const { fetchCep: lookupCep } = useCepLookup();

  // Verificar autenticação PRIMEIRO
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log('Usuário não autenticado');
          toast.error('Você precisa estar logado');
          navigate('/auth');
          return;
        }

        // Verificar se é admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        if (!roleData) {
          console.log('Usuário não é admin');
          toast.error('Acesso negado - apenas administradores');
          navigate('/');
          return;
        }

        console.log('Autenticação confirmada - usuário é admin');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigate('/auth');
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Carregar dados SOMENTE após autenticação confirmada
  useEffect(() => {
    if (isAuthenticated && id) {
      loadEstabelecimento();
    }
  }, [isAuthenticated, id]);

  const loadEstabelecimento = async () => {
    setLoading(true);
    console.log('=== CARREGANDO ESTABELECIMENTO ===');
    console.log('ID:', id);

    try {
      const { data, error, status } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('id', id)
        .single();

      console.log('Status:', status);
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Erro ao buscar:', error);
        toast.error('Erro ao carregar estabelecimento');
        setLoading(false);
        return;
      }

      if (!data) {
        toast.error('Estabelecimento não encontrado');
        navigate('/admin/dashboard');
        setLoading(false);
        return;
      }

      if (data) {
        setEstablishmentData({
          cnpj: formatCNPJ(data.cnpj || ''),
          name: data.nome_fantasia || '',
          cep: data.cep || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          semNumero: !data.numero,
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          isMall: false,
          categories: data.categoria || [],
          menuLink: data.link_cardapio || '',
          siteLink: data.site || '',
          instagramUser: data.instagram?.replace('@', '') || '',
          phoneFixed: data.telefone || '',
          phoneWhatsapp: data.whatsapp || '',
          slogan: '',
          mainPhotoUrl: data.logo_url || '',
          hoursJson: data.horario_funcionamento || '',
        });

        setRules({
          description: data.regras_utilizacao || '',
          scope: data.periodo_validade_beneficio === 'semana_aniversario' ? 'Semana' 
                 : data.periodo_validade_beneficio === 'mes_aniversario' ? 'Mês'
                 : 'Dia'
        });

        setCnpjVerified(true);
        console.log('Campos preenchidos com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao carregar:', error);
      toast.error('Erro ao carregar estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleCnpjChange = (e: any) => {
    const formatted = formatCNPJ(e.target.value);
    setEstablishmentData(prev => ({ ...prev, cnpj: formatted }));
    setCnpjVerified(false);
  };

  const verifyCnpj = async () => {
    setLoading(true);
    setError('');
    const rawCnpj = establishmentData.cnpj.replace(/\D/g, '');

    if (rawCnpj.length !== 14) {
      setError('CNPJ deve conter 14 dígitos.');
      setLoading(false);
      return;
    }

    if (!validateCNPJ(rawCnpj)) {
      setError('CNPJ inválido. Verifique os dígitos verificadores.');
      toast.error('CNPJ inválido. Verifique os dígitos verificadores.');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCNPJData(rawCnpj);
      
      if (data) {
        setEstablishmentData(prev => ({
          ...prev,
          name: data.nome_fantasia || data.razao_social,
          cep: data.cep.replace(/\D/g, ''),
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.municipio,
          estado: data.uf,
        }));
        
        setCnpjVerified(true);
        toast.success('Dados carregados! Verifique e ajuste se necessário.');
      }
    } catch (error: any) {
      toast.error('Erro ao buscar CNPJ');
      setCnpjVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCep = async (cepValue: string) => {
    const rawCep = cepValue.replace(/\D/g, '').substring(0, 8);
    setEstablishmentData(prev => ({ ...prev, cep: rawCep }));
    
    if (rawCep.length !== 8) return;

    setLoading(true);
    
    try {
      const data = await lookupCep(rawCep);
      
      if (data) {
        setEstablishmentData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setEstablishmentData(prev => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      } else if (prev.categories.length < 3) {
        return { ...prev, categories: [...prev.categories, category] };
      }
      return prev;
    });
  };

  const handleBuscarFotoGoogle = async () => {
    setFetchingPhoto(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
        body: {
          nome: establishmentData.name,
          endereco: establishmentData.logradouro,
          cidade: establishmentData.cidade,
          estado: establishmentData.estado,
        },
      });

      if (error) throw error;

      if (data?.success && data?.photo_url) {
        setEstablishmentData(prev => ({ ...prev, mainPhotoUrl: data.photo_url }));
        toast.success('Foto encontrada!');
      } else {
        toast.error('Nenhuma foto encontrada no Google');
      }
    } catch (err) {
      console.error('Erro ao buscar foto:', err);
      toast.error('Erro ao buscar foto');
    } finally {
      setFetchingPhoto(false);
    }
  };

  const handleSalvar = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rawCnpj = establishmentData.cnpj.replace(/\D/g, '');

      // Mapear scope para periodo_validade_beneficio
      const periodoValidade = rules.scope === 'Dia' ? 'dia_aniversario'
                             : rules.scope === 'Semana' ? 'semana_aniversario'
                             : 'mes_aniversario';

      const updateData: any = {
        cnpj: rawCnpj,
        nome_fantasia: establishmentData.name,
        cep: establishmentData.cep,
        logradouro: establishmentData.logradouro,
        numero: establishmentData.numero || null,
        complemento: establishmentData.complemento || null,
        bairro: establishmentData.bairro,
        cidade: establishmentData.cidade,
        estado: establishmentData.estado,
        categoria: establishmentData.categories,
        link_cardapio: establishmentData.menuLink || null,
        site: establishmentData.siteLink || null,
        instagram: establishmentData.instagramUser ? `@${establishmentData.instagramUser}` : null,
        telefone: establishmentData.phoneFixed || null,
        whatsapp: establishmentData.phoneWhatsapp || null,
        logo_url: establishmentData.mainPhotoUrl || null,
        horario_funcionamento: establishmentData.hoursJson || null,
        regras_utilizacao: rules.description || null,
        periodo_validade_beneficio: periodoValidade,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('estabelecimentos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Estabelecimento atualizado com sucesso!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  // Loading enquanto verifica autenticação
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Loading enquanto carrega dados
  if (loading && !establishmentData.cnpj) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando estabelecimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Editar Estabelecimento</h2>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">{error}</div>}

          {/* 1. CNPJ e Nome */}
          <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><Building2 size={20} /> Informações Básicas</h3>
            
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">CNPJ *</span>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={establishmentData.cnpj}
                    onChange={handleCnpjChange}
                    onBlur={verifyCnpj}
                    maxLength={18}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                    placeholder="00.000.000/0000-00"
                    disabled={loading}
                  />
                  {cnpjVerified && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  )}
                </div>
                <button 
                  type="button"
                  onClick={verifyCnpj}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-xl font-semibold hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </label>
            
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Nome do Estabelecimento</span>
              <input 
                type="text" 
                value={establishmentData.name}
                onChange={(e) => setEstablishmentData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              />
            </label>
          </div>
          
          {/* 2. CONTATO */}
          <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><Phone size={20} /> Contato e Redes</h3>
            
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Telefone Fixo</span>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={formatPhone(establishmentData.phoneFixed)} 
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, phoneFixed: e.target.value.replace(/\D/g, '') }))}
                  maxLength={14}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                  placeholder="(XX) XXXX-XXXX"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">WhatsApp</span>
              <div className="relative">
                <MessageSquare size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={formatPhone(establishmentData.phoneWhatsapp)} 
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, phoneWhatsapp: e.target.value.replace(/\D/g, '') }))}
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                  placeholder="(XX) 9XXXX-XXXX"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Website</span>
              <div className="relative">
                <Globe size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="url" 
                  value={establishmentData.siteLink} 
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, siteLink: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                  placeholder="https://www.suaempresa.com.br"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Instagram</span>
              <div className="relative">
                <Instagram size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">@</div>
                <input 
                  type="text" 
                  value={establishmentData.instagramUser} 
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, instagramUser: e.target.value.replace('@', '') }))}
                  className="w-full pl-16 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                  placeholder="seuusuário"
                />
              </div>
            </label>
          </div>
          
          {/* 3. Endereço */}
          <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><MapPin size={20} /> Endereço</h3>
            
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">CEP</span>
              <input 
                type="text" 
                value={establishmentData.cep}
                onChange={(e) => fetchCep(e.target.value)}
                maxLength={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                placeholder="00000000"
                disabled={loading}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="text-sm font-medium text-slate-700 mb-1 block">Estado</span>
                <input 
                  type="text" 
                  value={establishmentData.estado}
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700 mb-1 block">Cidade</span>
                <input 
                  type="text" 
                  value={establishmentData.cidade}
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, cidade: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Bairro</span>
              <input 
                type="text" 
                value={establishmentData.bairro}
                onChange={(e) => setEstablishmentData(prev => ({ ...prev, bairro: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Rua/Avenida</span>
              <input 
                type="text" 
                value={establishmentData.logradouro} 
                onChange={(e) => setEstablishmentData(prev => ({ ...prev, logradouro: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              />
            </label>
            
            <div className="flex gap-4 items-end">
              <label className="flex-1">
                <span className="text-sm font-medium text-slate-700 mb-1 block">Número</span>
                <input 
                  type="text" 
                  value={establishmentData.numero} 
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, numero: e.target.value.replace(/\D/g, '') }))}
                  disabled={establishmentData.semNumero}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none disabled:bg-slate-100"
                />
              </label>
              <button 
                type="button"
                onClick={() => setEstablishmentData(prev => ({ ...prev, semNumero: !prev.semNumero, numero: '' }))}
                className={`py-3 px-4 rounded-xl font-semibold transition-colors ${
                  establishmentData.semNumero 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sem Número
              </button>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Complemento</span>
              <input 
                type="text" 
                value={establishmentData.complemento} 
                onChange={(e) => setEstablishmentData(prev => ({ ...prev, complemento: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              />
            </label>
          </div>

          {/* 4. Categorias e Links */}
          <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><MapPin size={20} /> Categorias e Links</h3>
            
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Categoria (Selecione até 3)</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      establishmentData.categories.includes(category) 
                        ? 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-700 hover:bg-violet-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Link do Cardápio Digital</span>
              <div className="relative">
                <Link size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="url" 
                  value={establishmentData.menuLink} 
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, menuLink: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                  placeholder="https://linkdocardapio.com.br"
                />
              </div>
            </label>
          </div>
          
          {/* 5. Imagem e Horário */}
          <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><Image size={20} /> Imagem e Horário</h3>
            
            <div>
              <span className="text-sm font-medium text-slate-700 mb-1 block">Horário de Funcionamento</span>
              <HorarioFuncionamentoEditor
                value={establishmentData.hoursJson}
                onChange={(json) => setEstablishmentData(prev => ({ ...prev, hoursJson: json }))}
              />
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700 mb-1 block">Foto Principal</span>
              {establishmentData.mainPhotoUrl && (
                <div className="relative mb-2">
                  <img 
                    src={establishmentData.mainPhotoUrl} 
                    alt="Foto atual" 
                    className="w-full h-48 object-cover rounded-lg" 
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBuscarFotoGoogle}
                  disabled={fetchingPhoto}
                  className="flex-1"
                >
                  {fetchingPhoto ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Buscar Foto do Google
                </Button>
              </div>

              <label className="block mt-2">
                <span className="text-xs text-slate-500">URL da Imagem</span>
                <input 
                  type="url"
                  value={establishmentData.mainPhotoUrl}
                  onChange={(e) => setEstablishmentData(prev => ({ ...prev, mainPhotoUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </label>
            </div>
          </div>
          
          {/* 6. Regras de Benefício */}
          <BenefitRulesSection rules={rules} setRules={setRules} />
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl text-xl"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </div>
    </div>
  );
}
