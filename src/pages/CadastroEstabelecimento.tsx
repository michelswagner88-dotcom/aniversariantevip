import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
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
  ChevronRight,
  ChevronLeft,
  Phone,
  MessageSquare,
  Globe,
  Instagram
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { validateCNPJ, formatCNPJ, fetchCNPJData } from '@/lib/validators';
import { useCepLookup } from '@/hooks/useCepLookup';
import { getFriendlyErrorMessage } from '@/lib/errorTranslator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Categorias disponíveis
const AVAILABLE_CATEGORIES = [
  'Academia', 'Bar', 'Barbearia', 'Cafeteria', 'Casa Noturna', 
  'Entretenimento', 'Hospedagem', 'Loja de Presentes', 'Moda e Acessórios', 
  'Confeitaria', 'Restaurante', 'Salão de Beleza', 'Saúde e Suplementos', 
  'Outros Comércios', 'Serviços'
];

const mockStandardizeText = (text) => {
  // Simula a correção gramatical e padronização (ex: capitular, remover excesso de espaços)
  if (!text) return '';
  return text.trim().replace(/\s\s+/g, ' ').replace('nao', 'não');
};

const formatPhone = (phone) => {
  const raw = phone.replace(/\D/g, '').substring(0, 11);
  if (raw.length === 11) { // Celular/WhatsApp
    return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (raw.length === 10) { // Fixo
    return raw.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return raw;
};

// --- COMPONENTES AUXILIARES ---

const Stepper = ({ currentStep, totalSteps }) => (
  <div className="flex justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={`h-2 rounded-full transition-all duration-300 ${
          index + 1 === currentStep ? 'w-8 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500' : 'w-4 bg-white/20'
        }`}
      />
    ))}
  </div>
);

const BenefitRulesSection = ({ rules, setRules }) => {
  const [showHelper, setShowHelper] = useState(false);
  const MAX_CHARS = 200;

  const handleTextChange = (e) => {
    const text = e.target.value.substring(0, MAX_CHARS);
    setRules(prev => ({ ...prev, description: text }));
  };

  const handleStandardize = () => {
    const standardizedText = mockStandardizeText(rules.description);
    setRules(prev => ({ ...prev, description: standardizedText }));
  };

  const setScope = (scope) => {
    setRules(prev => ({ ...prev, scope }));
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

      <div className="flex justify-between items-center text-sm">
        <button 
          type="button"
          onClick={handleStandardize}
          className="px-3 py-1 bg-violet-200 text-violet-700 rounded-full hover:bg-violet-300 transition-colors flex items-center gap-1 font-semibold"
        >
          <CheckCircle size={14} /> Corrigir/Padronizar Texto
        </button>
        <button 
          type="button"
          onClick={() => setShowHelper(!showHelper)}
          className="text-slate-500 hover:text-violet-600 flex items-center gap-1"
        >
          <Info size={16} /> Ajuda
        </button>
      </div>

      {showHelper && (
        <p className="text-xs text-violet-700 bg-white p-2 rounded-lg border border-violet-200">
          As regras devem ser claras. Use o botão de padronização para garantir a melhor leitura no App.
        </p>
      )}

      {/* Seletor de Escopo */}
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


// --- COMPONENTE PRINCIPAL ---

export default function EstablishmentRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [isGoogleUser, setIsGoogleUser] = useState(false);
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
    categories: [],
    menuLink: '',
    siteLink: '', 
    instagramUser: '', 
    phoneFixed: '', 
    phoneWhatsapp: '', 
    slogan: '', 
    mainPhotoUrl: 'https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)',
    hoursText: 'Seg-Sáb: 10h às 22h, Dom: Fechado',
  });
  const [rules, setRules] = useState({ description: '', scope: 'Dia' });
  const [loading, setLoading] = useState(false);
  const [cnpjVerified, setCnpjVerified] = useState(false);
  const [error, setError] = useState('');
  
  const { fetchCep: lookupCep } = useCepLookup();

  // Detectar retorno do Google OAuth
  useEffect(() => {
    const checkGoogleReturn = async () => {
      const stepFromUrl = searchParams.get('step');
      const providerFromUrl = searchParams.get('provider');

      if (stepFromUrl === '2' && providerFromUrl === 'google') {
        setStep(2);
        setIsGoogleUser(true);
        
        // Limpar estados ao carregar
        setError('');
        setCnpjVerified(false);
        setLoading(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAuthData(prev => ({
            ...prev,
            email: user.email || '',
          }));
        }
      }
    };

    checkGoogleReturn();
  }, [searchParams]);

  // --- LÓGICA DE APIs E VALIDAÇÃO ---

  const handleCnpjChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setEstablishmentData(prev => ({ ...prev, cnpj: formatted }));
    setCnpjVerified(false); // Reset verificação ao alterar
  };

  const verifyCnpj = async () => {
    const rawCnpj = establishmentData.cnpj.replace(/\D/g, '');

    // Early return - não fazer nada se CNPJ estiver vazio ou incompleto
    if (rawCnpj.length === 0) {
      return; // Silencioso, sem erro
    }

    if (rawCnpj.length < 14) {
      setError('CNPJ deve conter 14 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    // Validar dígitos verificadores primeiro
    if (!validateCNPJ(rawCnpj)) {
      setError('CNPJ inválido. Verifique os dígitos verificadores.');
      toast.error('CNPJ inválido. Verifique os dígitos verificadores.');
      setLoading(false);
      return;
    }

    try {
      // Buscar dados na BrasilAPI
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
      const friendlyError = getFriendlyErrorMessage(error);
      setError(friendlyError);
      toast.error(friendlyError);
      setCnpjVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCep = async (cepValue) => {
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

  const handleCategoryToggle = (category) => {
    setEstablishmentData(prev => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      } else if (prev.categories.length < 3) {
        return { ...prev, categories: [...prev.categories, category] };
      }
      return prev; // Max 3 categories
    });
  };
  
  // --- FLUXO DE SUBMISSÃO ---

  const handleGoogleSignUp = async () => {
    try {
      // Salvar no sessionStorage que é cadastro de estabelecimento
      sessionStorage.setItem('authType', 'estabelecimento');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erro Google OAuth:', error);
        toast.error('Erro ao conectar com Google');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conectar com Google');
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authData.email && authData.password) {
      setStep(2);
    } else {
      setError('Preencha email e senha.');
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const rawCnpj = establishmentData.cnpj.replace(/\D/g, '');
    const isPhoneFilled = establishmentData.phoneFixed || establishmentData.phoneWhatsapp;

    // Validar CNPJ verificado
    if (!cnpjVerified) {
      setError('CNPJ deve ser verificado antes de continuar. Clique em "Verificar".');
      toast.error('CNPJ deve ser verificado antes de continuar.');
      return;
    }

    if (rawCnpj.length !== 14 || !establishmentData.logradouro || !establishmentData.cidade || establishmentData.categories.length === 0) {
      setError('Por favor, preencha todos os campos obrigatórios: CNPJ, Endereço e Categoria.');
      return;
    }
    
    if (!isPhoneFilled) {
      setError('Pelo menos um número de contato (Fixo ou WhatsApp) é obrigatório.');
      return;
    }

    if (!establishmentData.name || establishmentData.name.trim().length < 2) {
      setError('Nome do estabelecimento obrigatório');
      toast.error('Nome do estabelecimento obrigatório');
      return;
    }

    setLoading(true);

    try {
      if (isGoogleUser) {
        // Usuário Google: já tem conta no Auth, só criar estabelecimento
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Sessão não encontrada');
        }

        // Verificar CNPJ duplicado
        const { data: cnpjExistente } = await supabase
          .from('estabelecimentos')
          .select('cnpj')
          .eq('cnpj', rawCnpj)
          .maybeSingle();

        if (cnpjExistente) {
          toast.error('Este CNPJ já está cadastrado');
          return;
        }

        // Criar estabelecimento
        const { error: estabError } = await supabase
          .from('estabelecimentos')
          .insert({
            cnpj: rawCnpj,
            razao_social: establishmentData.name,
            nome_fantasia: establishmentData.name,
            telefone: establishmentData.phoneFixed?.replace(/\D/g, '') || null,
            whatsapp: establishmentData.phoneWhatsapp?.replace(/\D/g, '') || null,
            instagram: establishmentData.instagramUser || null,
            site: establishmentData.siteLink || null,
            cep: establishmentData.cep || null,
            estado: establishmentData.estado || null,
            cidade: establishmentData.cidade || null,
            bairro: establishmentData.bairro || null,
            logradouro: establishmentData.logradouro || null,
            numero: establishmentData.numero || null,
            complemento: establishmentData.complemento || null,
            categoria: establishmentData.categories,
            descricao_beneficio: rules.description || null,
            periodo_validade_beneficio: rules.scope === 'Dia' ? 'dia_aniversario' : rules.scope === 'Semana' ? 'semana_aniversario' : 'mes_aniversario',
            horario_funcionamento: establishmentData.hoursText || null,
            logo_url: establishmentData.mainPhotoUrl !== 'https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)' ? establishmentData.mainPhotoUrl : null,
            link_cardapio: establishmentData.menuLink || null,
            ativo: false,
          });

        if (estabError) throw estabError;

        // Criar role de estabelecimento
        await supabase
          .from('user_roles')
          .upsert({ 
            user_id: user.id, 
            role: 'estabelecimento' 
          }, { onConflict: 'user_id,role' });

        toast.success('Estabelecimento cadastrado com sucesso!');
        navigate('/area-estabelecimento');

      } else {
        // Usuário email/senha: criar conta completa
        await criarContaEstabelecimentoCompleta();
      }

    } catch (error: any) {
      console.error('Erro:', error);
      const friendlyError = getFriendlyErrorMessage(error);
      toast.error(friendlyError);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const criarContaEstabelecimentoCompleta = async () => {
    const rawCnpj = establishmentData.cnpj.replace(/\D/g, '');

    // Verificar CNPJ duplicado
    const { data: cnpjExistente } = await supabase
      .from('estabelecimentos')
      .select('cnpj')
      .eq('cnpj', rawCnpj)
      .maybeSingle();

    if (cnpjExistente) {
      toast.error('Este CNPJ já está cadastrado');
      throw new Error('CNPJ duplicado');
    }

    // 1. Criar usuário no Auth
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: authData.email,
      password: authData.password,
      options: {
        data: {
          tipo: 'estabelecimento',
          nome_fantasia: establishmentData.name,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      }
      throw authError;
    }

    if (!signUpData.user) {
      throw new Error('Erro ao criar conta');
    }

    // 2. Criar estabelecimento
    const { error: estabError } = await supabase
      .from('estabelecimentos')
      .insert({
        cnpj: rawCnpj,
        razao_social: establishmentData.name,
        nome_fantasia: establishmentData.name,
        telefone: establishmentData.phoneFixed?.replace(/\D/g, '') || null,
        whatsapp: establishmentData.phoneWhatsapp?.replace(/\D/g, '') || null,
        instagram: establishmentData.instagramUser || null,
        site: establishmentData.siteLink || null,
        cep: establishmentData.cep || null,
        estado: establishmentData.estado || null,
        cidade: establishmentData.cidade || null,
        bairro: establishmentData.bairro || null,
        logradouro: establishmentData.logradouro || null,
        numero: establishmentData.numero || null,
        complemento: establishmentData.complemento || null,
        categoria: establishmentData.categories,
        descricao_beneficio: rules.description || null,
        periodo_validade_beneficio: rules.scope === 'Dia' ? 'dia_aniversario' : rules.scope === 'Semana' ? 'semana_aniversario' : 'mes_aniversario',
        horario_funcionamento: establishmentData.hoursText || null,
        logo_url: establishmentData.mainPhotoUrl !== 'https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)' ? establishmentData.mainPhotoUrl : null,
        link_cardapio: establishmentData.menuLink || null,
        ativo: false,
      });

    if (estabError) throw estabError;

    // 3. Criar role
    await supabase
      .from('user_roles')
      .insert({
        user_id: signUpData.user.id,
        role: 'estabelecimento',
      });

    toast.success('Estabelecimento cadastrado! Aguarde aprovação.');
    navigate('/area-estabelecimento');
  };

  // --- RENDERIZAÇÃO POR ETAPA ---

  const renderStep1 = () => (
    <form onSubmit={handleAuthSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Cadastre o seu estabelecimento</h2>
      <p className="text-slate-400 text-center">Crie suas credenciais e complete os dados da sua empresa.</p>

      {/* Login Google */}
      <button 
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition-colors"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png" alt="Google Logo" className="w-5 h-5" />
        Continuar com Google
      </button>

      <div className="flex items-center">
        <hr className="flex-1 border-white/10" />
        <span className="px-3 text-slate-500 text-sm">OU</span>
        <hr className="flex-1 border-white/10" />
      </div>

      {/* Login Email/Senha */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">E-mail</label>
        <div className="relative">
          <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="email" 
            value={authData.email}
            onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-white/10 bg-white/5 text-white placeholder-slate-600 rounded-xl focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
        <div className="relative">
          <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="password" 
            value={authData.password}
            onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-white/10 bg-white/5 text-white placeholder-slate-600 rounded-xl focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all"
            required
          />
        </div>
      </div>
      
      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">{error}</div>}

      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
      >
        Próxima Etapa <ArrowRight size={20} />
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleFinalSubmit} className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <button 
            type="button" 
            onClick={() => setStep(1)}
            className="text-slate-500 hover:text-violet-600 flex items-center gap-1"
        >
            <ChevronLeft size={20} /> Voltar
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Dados do Estabelecimento</h2>
      </div>

      {/* Mensagem para usuário Google */}
      {isGoogleUser && authData.email && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 space-y-2">
          <p className="text-violet-700 text-sm font-medium">
            ✓ Você está cadastrando com sua conta Google
          </p>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">Email (Google)</label>
            <div className="bg-slate-200 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700">
              {authData.email}
            </div>
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm mb-4">{error}</div>}

      {/* 1. CNPJ e Nome */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
        <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><Building2 size={20} /> Informações Básicas</h3>
        
        {/* CNPJ Input */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">CNPJ (Apenas números) *</span>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={establishmentData.cnpj}
                onChange={handleCnpjChange}
                maxLength={18}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
                placeholder="00.000.000/0000-00"
                disabled={loading}
                required
              />
              {cnpjVerified && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              )}
            </div>
            <button 
              type="button"
              onClick={verifyCnpj}
              disabled={loading || establishmentData.cnpj.replace(/\D/g, '').length !== 14}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-xl font-semibold hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
          {cnpjVerified && establishmentData.name && (
            <p className="mt-2 text-sm text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle size={16} /> Empresa Verificada: {establishmentData.name}
            </p>
          )}
        </label>
        
        {/* Nome e Slogan */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Nome do Estabelecimento *</span>
          <input 
            type="text" 
            value={establishmentData.name}
            onChange={(e) => setEstablishmentData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
            placeholder="Nome do seu estabelecimento"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Slogan/Descrição Curta (Máx. 50 Caracteres)</span>
          <input 
            type="text" 
            value={establishmentData.slogan}
            onChange={(e) => setEstablishmentData(prev => ({ ...prev, slogan: e.target.value.substring(0, 50) }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
            placeholder="Ex: O melhor açaí da cidade!"
          />
        </label>
      </div>
      
      {/* 2. CONTATO E REDES SOCIAIS */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
        <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><Phone size={20} /> Contato e Redes</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1">
            <Info size={16} className="text-violet-500" /> Pelo menos um telefone (Fixo ou WhatsApp) é obrigatório.
        </p>
        
        {/* Telefone Fixo */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Telefone Fixo (Opcional)</span>
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

        {/* Telefone WhatsApp */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">WhatsApp (Opcional)</span>
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

        <hr className="border-slate-100 my-4" />

        {/* Site/Website */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Website Principal (Opcional - Exibido na Info)</span>
          <div className="relative">
            <Globe size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="url" 
              value={establishmentData.siteLink} 
              onChange={(e) => setEstablishmentData(prev => ({ ...prev, siteLink: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              placeholder="https://www.suaempresa.com.br"
            />
            <p className="mt-1 text-xs text-slate-500">Este link aparecerá na seção 'Informações' do Card.</p>
          </div>
        </label>

        {/* Instagram */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Instagram (Opcional)</span>
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
        
        {/* CEP Input */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">CEP *</span>
          <input 
            type="text" 
            value={establishmentData.cep}
            onChange={(e) => fetchCep(e.target.value)}
            maxLength={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
            placeholder="00000000"
            disabled={loading}
            required
          />
        </label>

        {/* Campos de Endereço */}
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 md:col-span-1">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Estado *</span>
            <input 
              type="text" 
              value={establishmentData.estado}
              onChange={(e) => setEstablishmentData(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              required
            />
          </label>
          <label className="col-span-2 md:col-span-1">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Cidade *</span>
            <input 
              type="text" 
              value={establishmentData.cidade}
              onChange={(e) => setEstablishmentData(prev => ({ ...prev, cidade: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Bairro *</span>
          <input 
            type="text" 
            value={establishmentData.bairro}
            onChange={(e) => setEstablishmentData(prev => ({ ...prev, bairro: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Rua/Avenida *</span>
          <input 
            type="text" 
            value={establishmentData.logradouro} 
            onChange={(e) => setEstablishmentData(prev => ({ ...prev, logradouro: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
            required
          />
        </label>
        
        {/* Número e Sem Número */}
        <div className="flex gap-4 items-end">
          <label className="flex-1">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Número *</span>
            <input 
              type="text" 
              value={establishmentData.numero} 
              onChange={(e) => setEstablishmentData(prev => ({ ...prev, numero: e.target.value.replace(/\D/g, '') }))}
              disabled={establishmentData.semNumero}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none disabled:bg-slate-100"
              required={!establishmentData.semNumero}
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

        {/* Complemento e Shopping */}
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 md:col-span-1">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Complemento (Opcional)</span>
            <input 
              type="text" 
              value={establishmentData.complemento} 
              onChange={(e) => setEstablishmentData(prev => ({ ...prev, complemento: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
            />
          </label>
          
          <div className="col-span-2 md:col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => setEstablishmentData(prev => ({ ...prev, isMall: !prev.isMall }))}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                establishmentData.isMall 
                  ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag size={20} /> Localizado em Shopping?
            </button>
          </div>
        </div>
      </div>

      {/* 4. Categorias e Links */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
        <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><MapPin size={20} /> Categorias e Links</h3>
        
        {/* Seleção de Categoria */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Categoria (Selecione até 3) *</span>
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
          {establishmentData.categories.length === 3 && (
             <p className="mt-2 text-xs text-slate-500">Máximo de 3 categorias selecionadas.</p>
          )}
        </label>

        {/* Link Cardápio Digital */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Link do Cardápio Digital (Opcional - Exibido no Card)</span>
          <div className="relative">
             <Link size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="url" 
              value={establishmentData.menuLink} 
              onChange={(e) => setEstablishmentData(prev => ({ ...prev, menuLink: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none"
              placeholder="https://linkdocardapio.com.br"
            />
             <p className="mt-1 text-xs text-slate-500">Este link é acessível diretamente pelo cliente no Card principal.</p>
          </div>
        </label>
      </div>
      
      {/* 5. Imagem e Horário */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
        <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2"><Image size={20} /> Imagem e Horário</h3>
        
        {/* Horário de Funcionamento */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Horário de Funcionamento (Puxado do Google/Opção de Correção)</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 font-medium flex items-center gap-2">
               <Clock size={18} /> {establishmentData.hoursText}
            </div>
            <button 
              type="button"
              onClick={() => alert('Abrir modal para edição manual do horário de funcionamento.')}
              className="px-4 py-3 bg-slate-100 text-violet-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} /> Editar
            </button>
          </div>
        </label>

        {/* Foto Principal */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">Foto Principal (Padrão 16:9 - Melhor Qualidade para o Card)</span>
          <div className="relative border-4 border-dashed border-violet-200 rounded-xl overflow-hidden h-40 flex items-center justify-center bg-slate-50">
            <img 
              src={establishmentData.mainPhotoUrl} 
              alt="Foto Principal" 
              className="absolute inset-0 w-full h-full object-cover opacity-80" 
            />
            <button
              type="button"
              onClick={() => alert('Abrir uploader de imagens com crop para 16:9.')}
              className="relative z-10 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
            >
              <Image size={20} /> Trocar Foto
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
             <Info size={14} /> Utilize imagens nítidas, paisagens (horizontal) no formato 16:9 para um Card bonito.
          </p>
        </label>
      </div>
      
      {/* 6. Regras de Benefício */}
      <BenefitRulesSection rules={rules} setRules={setRules} />
      
      {/* Botão Final */}
      <button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xl shadow-lg shadow-emerald-200"
      >
        Finalizar Cadastro e Assinar Plano <ChevronRight size={24} />
      </button>
    </form>
  );


  // --- LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl">
        <div className="mb-6">
          <BackButton to="/seja-parceiro" />
        </div>
        <Stepper currentStep={step} totalSteps={2} />
        
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
}
