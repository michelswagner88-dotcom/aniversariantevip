import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Ticket, 
  TrendingUp, 
  DollarSign, 
  Menu, 
  X, 
  Search, 
  Trash2, 
  Edit2,
  AlertCircle,
  LogOut,
  Loader2,
  Mail,
  Send,
  Upload,
  UserCog,
  Camera
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';
import * as XLSX from 'xlsx';
import { sanitizarInput } from '@/lib/sanitize';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ExpansionInsights } from '@/components/admin/ExpansionInsights';
import { GrowthMetricsChart } from '@/components/admin/GrowthMetricsChart';
import { NavigationMetricsPanel } from '@/components/admin/NavigationMetricsPanel';
import { GerenciarColaboradores } from '@/components/colaborador/GerenciarColaboradores';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { EditEstablishmentModal } from '@/components/admin/EditEstablishmentModal';
import { MapaEstabelecimentos } from '@/components/MapaEstabelecimentos';
import { geocodificarEndereco } from '@/lib/geoUtils';

const COLORS = ['#94a3b8', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-xl border border-white/10">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={change >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
        {change >= 0 ? "+" : ""}{change}%
      </span>
      <span className="text-slate-500 ml-2">vs. mês passado</span>
    </div>
  </div>
);

const StatusBadge = ({ status }: any) => {
  const styles: any = {
    Ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Pendente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Inativo: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    Bloqueado: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.Inativo}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Estados de Dados
  const [users, setUsers] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [cupons, setCupons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  // Estados de Modal
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editEstabModalOpen, setEditEstabModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedEstab, setSelectedEstab] = useState<any>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'user' | 'establishment' | null>(null);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailAnalytics, setEmailAnalytics] = useState<any[]>([]);
  const [bulkFetchingPhotos, setBulkFetchingPhotos] = useState(false);
  const [photoProgress, setPhotoProgress] = useState({ current: 0, total: 0 });
  const [importingCSV, setImportingCSV] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  // Filtros avançados
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/admin');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error('Acesso negado');
      navigate('/');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', session.user.id)
      .single();

    setAdminName(profileData?.nome || 'Admin');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, establishmentsRes, cuponsRes, emailAnalyticsRes] = await Promise.all([
        supabase.from('aniversariantes').select('*').is('deleted_at', null),
        showDeleted 
          ? supabase.from('estabelecimentos').select('*')
          : supabase.from('estabelecimentos').select('*').is('deleted_at', null),
        supabase.from('cupons').select('*').is('deleted_at', null),
        supabase.from('email_analytics').select('*').order('sent_at', { ascending: false })
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (establishmentsRes.data) setEstablishments(establishmentsRes.data);
      if (cuponsRes.data) setCupons(cuponsRes.data);
      if (emailAnalyticsRes.data) setEmailAnalytics(emailAnalyticsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/admin');
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingCSV(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        setImportProgress({ current: 0, total: rows.length });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < rows.length; i++) {
          const row: any = rows[i];
          setImportProgress({ current: i + 1, total: rows.length });

          try {
            const cnpj = row.CNPJ?.toString().replace(/\D/g, '');
            const instagram = row.INSTAGRAM ? (row.INSTAGRAM.startsWith('@') ? row.INSTAGRAM : `@${row.INSTAGRAM}`) : null;

            const estabelecimentoData: any = {
              cnpj: cnpj || '',
              nome_fantasia: row.NOME_ESTABELECIMENTO || '',
              razao_social: row.NOME_ESTABELECIMENTO || '',
              horario_funcionamento: row.HORARIO_FUNCIONAMENTO || null,
              estado: row.ESTADO || '',
              cidade: row.CIDADE || '',
              bairro: row.BAIRRO || null,
              logradouro: row.RUA || null,
              numero: row.NUMERO || null,
              complemento: row.COMPLEMENTO || null,
              telefone: row.TELEFONE?.toString().replace(/\D/g, '') || null,
              whatsapp: row.WHATSAPP?.toString().replace(/\D/g, '') || null,
              instagram: instagram,
              site: row.SITE || null,
              categoria: row.CATEGORIA ? [row.CATEGORIA] : [],
              descricao_beneficio: row.BENEFICIO || null,
              regras_utilizacao: row.REGRAS || null,
              ativo: true,
              plan_status: 'active',
            };

            // Geocodificar endereço se houver cidade e estado
            if (estabelecimentoData.cidade && estabelecimentoData.estado) {
              const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
              if (GOOGLE_MAPS_API_KEY) {
                try {
                  const geoData = await geocodificarEndereco({
                    rua: estabelecimentoData.logradouro,
                    numero: estabelecimentoData.numero,
                    bairro: estabelecimentoData.bairro,
                    cidade: estabelecimentoData.cidade,
                    estado: estabelecimentoData.estado,
                  }, GOOGLE_MAPS_API_KEY);

                  if (geoData) {
                    estabelecimentoData.latitude = geoData.latitude;
                    estabelecimentoData.longitude = geoData.longitude;
                    estabelecimentoData.endereco_formatado = geoData.endereco_formatado;
                  }

                  // Rate limiting - esperar 200ms entre geocodificações
                  await new Promise(resolve => setTimeout(resolve, 200));
                } catch (geoError) {
                  console.warn('Aviso: Falha ao geocodificar estabelecimento:', geoError);
                  // Continuar importação mesmo se geocodificação falhar
                }
              }
            }

            const { error } = await supabase
              .from('estabelecimentos')
              .upsert(estabelecimentoData, { onConflict: 'cnpj', ignoreDuplicates: false });

            if (error) throw error;
            successCount++;
          } catch (err) {
            console.error('Erro ao importar linha:', err);
            errorCount++;
          }
        }

        toast.success(`✅ Importação concluída! ${successCount} estabelecimentos importados, ${errorCount} erros.`);
        loadData();
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      toast.error('Erro ao importar arquivo');
    } finally {
      setImportingCSV(false);
    }
  };

  const handleSimulateBirthdayRobot = async () => {
    setSendingEmails(true);
    try {
      toast.info('🤖 Iniciando Robô de Aniversário...');
      
      const { data, error } = await supabase.functions.invoke('send-birthday-reminder', {
        body: {}
      });

      if (error) throw error;

      console.log('Resultado do robô:', data);
      
      toast.success(
        `✅ Robô executado! ${data.birthdayToday || 0} aniversariantes HOJE, ${data.birthdayIn7Days || 0} em 7 dias. Total: ${data.success || 0} emails enviados.`,
        { duration: 6000 }
      );
    } catch (error: any) {
      console.error('Erro ao executar robô:', error);
      toast.error('❌ Erro ao executar robô de aniversário: ' + error.message);
    } finally {
      setSendingEmails(false);
    }
  };

  const handleDeleteClick = (item: any, type: 'user' | 'establishment') => {
    setCurrentItem(item);
    setItemType(type);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemType === 'user') {
        const { error } = await supabase
          .from('aniversariantes')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', currentItem.id);
        
        if (error) throw error;
        setUsers(users.filter(u => u.id !== currentItem.id));
        toast.success('Usuário removido com sucesso');
      } else {
        const { error } = await supabase
          .from('estabelecimentos')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', currentItem.id);
        
        if (error) throw error;
        setEstablishments(establishments.filter(e => e.id !== currentItem.id));
        toast.success('Estabelecimento removido com sucesso');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao remover');
    } finally {
      setDeleteModalOpen(false);
      setCurrentItem(null);
    }
  };

  const handleEditClick = async (item: any, type: 'user' | 'establishment') => {
    if (type === 'user') {
      // Buscar dados completos do usuário (profile + aniversariante)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('id', item.id)
        .single();

      setSelectedUser({
        ...item,
        nome: profileData?.nome || '',
        email: profileData?.email || '',
      });
      setEditUserModalOpen(true);
    } else {
      // Navegar para página de edição completa
      navigate(`/admin/estabelecimento/${item.id}/editar`);
    }
  };


  const handleToggleEstablishmentStatus = async (establishmentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('estabelecimentos')
        .update({ 
          ativo: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', establishmentId);
      
      if (error) throw error;
      
      setEstablishments(establishments.map(e => 
        e.id === establishmentId ? { ...e, ativo: !currentStatus } : e
      ));
      
      toast.success(!currentStatus ? 'Estabelecimento ativado' : 'Estabelecimento desativado');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do estabelecimento');
    }
  };

  const handleRestaurarTodos = async () => {
    const deletadosCount = establishments.filter(e => e.deleted_at).length;
    if (deletadosCount === 0) {
      toast.info('Nenhum estabelecimento deletado para restaurar');
      return;
    }

    if (!confirm(`⚠️ Tem certeza que deseja restaurar ${deletadosCount} estabelecimento(s) deletado(s)?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('estabelecimentos')
        .update({ deleted_at: null })
        .not('deleted_at', 'is', null);

      if (error) throw error;

      toast.success(`✅ ${deletadosCount} estabelecimentos restaurados com sucesso!`);
      loadData();
    } catch (err) {
      console.error('Erro ao restaurar:', err);
      toast.error('Erro ao restaurar estabelecimentos');
    }
  };

  const handleRestaurarUm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estabelecimentos')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;

      toast.success('Estabelecimento restaurado!');
      loadData();
    } catch (err) {
      toast.error('Erro ao restaurar');
    }
  };

  const filteredUsers = useMemo(() => {
    const searchSeguro = sanitizarInput(searchTerm, 100);
    return users.filter(user => 
      user.cpf?.toLowerCase().includes(searchSeguro.toLowerCase()) || 
      user.telefone?.toLowerCase().includes(searchSeguro.toLowerCase())
    );
  }, [users, searchTerm]);

  const filteredEstablishments = useMemo(() => {
    const searchSeguro = sanitizarInput(searchTerm, 100);
    const citySeguro = sanitizarInput(filterCity, 100);
    const categorySeguro = sanitizarInput(filterCategory, 50);
    
    return establishments.filter(est => {
      const matchesSearch = !searchSeguro || 
        est.nome_fantasia?.toLowerCase().includes(searchSeguro.toLowerCase()) ||
        est.cnpj?.includes(searchSeguro) ||
        est.cidade?.toLowerCase().includes(searchSeguro.toLowerCase());
      
      const matchesCity = !citySeguro || est.cidade === citySeguro;
      const matchesCategory = !categorySeguro || est.categoria?.includes(categorySeguro);
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && est.ativo) || 
        (filterStatus === 'inactive' && !est.ativo);

      return matchesSearch && matchesCity && matchesCategory && matchesStatus;
    });
  }, [establishments, searchTerm, filterCity, filterCategory, filterStatus]);

  const estabelecimentosSemFoto = useMemo(() => {
    return establishments.filter(e => !e.logo_url || e.logo_url === '');
  }, [establishments]);

  const estabelecimentosDeletados = useMemo(() => {
    return establishments.filter(e => e.deleted_at !== null);
  }, [establishments]);

  const uniqueCities = useMemo(() => {
    const cities = establishments.map(e => e.cidade).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [establishments]);

  const handleBuscarFotosEmLote = async () => {
    if (estabelecimentosSemFoto.length === 0) {
      toast.info('Todos os estabelecimentos já têm foto!');
      return;
    }

    setBulkFetchingPhotos(true);
    setPhotoProgress({ current: 0, total: estabelecimentosSemFoto.length });

    let sucesso = 0;
    let erros = 0;

    for (let i = 0; i < estabelecimentosSemFoto.length; i++) {
      const est = estabelecimentosSemFoto[i];
      setPhotoProgress({ current: i + 1, total: estabelecimentosSemFoto.length });

      try {
        const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
          body: {
            nome: est.nome_fantasia,
            endereco: est.logradouro || '',
            cidade: est.cidade,
            estado: est.estado,
          },
        });

        if (data?.success && data?.photo_url) {
          await supabase
            .from('estabelecimentos')
            .update({ logo_url: data.photo_url })
            .eq('id', est.id);
          sucesso++;
        } else {
          erros++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        erros++;
      }
    }

    setBulkFetchingPhotos(false);
    loadData();
    toast.success(`✅ ${sucesso} fotos encontradas | ❌ ${erros} não encontradas`);
  };

  const handleBuscarFotoIndividual = async (est: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
        body: {
          nome: est.nome_fantasia,
          endereco: est.logradouro || '',
          cidade: est.cidade,
          estado: est.estado,
        },
      });

      if (error) throw error;

      if (data?.success && data?.photo_url) {
        await supabase
          .from('estabelecimentos')
          .update({ logo_url: data.photo_url })
          .eq('id', est.id);
        toast.success('Foto encontrada!');
        loadData();
      } else {
        toast.error('Nenhuma foto encontrada');
      }
    } catch (err) {
      console.error('Erro ao buscar foto:', err);
      toast.error('Erro ao buscar foto');
    }
  };

  const MOCK_STATS_HISTORY = [
    { name: 'Jan', usuarios: Math.round(users.length * 0.4), cupons: Math.round(cupons.length * 0.3), receita: 2400 },
    { name: 'Fev', usuarios: Math.round(users.length * 0.5), cupons: Math.round(cupons.length * 0.4), receita: 2800 },
    { name: 'Mar', usuarios: Math.round(users.length * 0.6), cupons: Math.round(cupons.length * 0.5), receita: 3200 },
    { name: 'Abr', usuarios: Math.round(users.length * 0.7), cupons: Math.round(cupons.length * 0.6), receita: 3600 },
    { name: 'Mai', usuarios: Math.round(users.length * 0.85), cupons: Math.round(cupons.length * 0.8), receita: 4200 },
    { name: 'Jun', usuarios: users.length, cupons: cupons.length, receita: 4800 },
  ];

  const PLAN_DISTRIBUTION = [
    { name: 'Gratuito', value: Math.round(establishments.length * 0.5) },
    { name: 'Premium', value: Math.round(establishments.length * 0.35) },
    { name: 'Empresarial', value: Math.round(establishments.length * 0.15) },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métricas de Crescimento */}
      <GrowthMetricsChart />
      
      {/* Insights de Expansão */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Insights de Expansão</h2>
        <ExpansionInsights />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Usuários Totais" value={users.length} change={12.5} icon={Users} color="bg-gradient-to-r from-blue-500 to-blue-600" />
        <StatCard title="Estabelecimentos" value={establishments.length} change={8.2} icon={Building2} color="bg-gradient-to-r from-violet-500 to-violet-600" />
        <StatCard title="Cupons Emitidos" value={cupons.length} change={-2.4} icon={Ticket} color="bg-gradient-to-r from-amber-500 to-amber-600" />
        <StatCard title="Cupons Ativos" value={cupons.filter(c => !c.usado).length} change={24.5} icon={DollarSign} color="bg-gradient-to-r from-emerald-500 to-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Crescimento da Plataforma</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_STATS_HISTORY}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey="usuarios" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="cupons" stroke="#f59e0b" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Distribuição de Planos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLAN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PLAN_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {PLAN_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTable = () => (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white">Gerenciar Usuários</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por CPF ou telefone..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 border-b border-white/10 flex justify-end">
        <button
          onClick={handleBuscarFotosEmLote}
          disabled={bulkFetchingPhotos || estabelecimentosSemFoto.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
        >
          {bulkFetchingPhotos ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando... ({photoProgress.current}/{photoProgress.total})
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Buscar Fotos do Google ({estabelecimentosSemFoto.length})
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-300 text-sm font-semibold uppercase tracking-wider">
              <th className="p-4 border-b border-white/10">Usuário</th>
              <th className="p-4 border-b border-white/10">CPF</th>
              <th className="p-4 border-b border-white/10">Data Nascimento</th>
              <th className="p-4 border-b border-white/10 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold mr-3">
                      {user.cpf?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{user.cpf}</div>
                      <div className="text-sm text-slate-400">{user.telefone || 'Sem telefone'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{user.cpf}</td>
                <td className="p-4 text-slate-300 text-sm">{new Date(user.data_nascimento).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(user, 'user')}
                      className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user, 'user')}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</div>
        )}
      </div>
    </div>
  );

  const renderEstablishmentsTable = () => (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-white">Gerenciar Estabelecimentos</h2>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImportCSV}
                disabled={importingCSV}
              />
              <div className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors">
                {importingCSV ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando... ({importProgress.current}/{importProgress.total})
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar CSV
                  </>
                )}
              </div>
            </label>
            <button
              onClick={handleBuscarFotosEmLote}
              disabled={bulkFetchingPhotos || estabelecimentosSemFoto.length === 0}
              className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              {bulkFetchingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando... ({photoProgress.current}/{photoProgress.total})
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Buscar Fotos ({estabelecimentosSemFoto.length})
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Todas as cidades</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS_ESTABELECIMENTO.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Toggle para mostrar deletados + Botão restaurar */}
        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-white/10">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => {
                setShowDeleted(e.target.checked);
                loadData();
              }}
              className="rounded"
            />
            Mostrar estabelecimentos deletados
          </label>
          
          {showDeleted && estabelecimentosDeletados.length > 0 && (
            <button
              onClick={handleRestaurarTodos}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              Restaurar Todos ({estabelecimentosDeletados.length})
            </button>
          )}

          {estabelecimentosDeletados.length > 0 && !showDeleted && (
            <span className="text-sm text-amber-400">
              ⚠️ {estabelecimentosDeletados.length} estabelecimento(s) deletado(s)
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-300 text-sm font-semibold uppercase tracking-wider">
              <th className="p-4 border-b border-white/10">Estabelecimento</th>
              <th className="p-4 border-b border-white/10">CNPJ</th>
              <th className="p-4 border-b border-white/10">Cidade</th>
              <th className="p-4 border-b border-white/10">Status</th>
              <th className="p-4 border-b border-white/10 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredEstablishments.map(est => (
              <tr 
                key={est.id} 
                className={`hover:bg-white/5 transition-colors ${est.deleted_at ? 'opacity-50 bg-red-500/10' : ''}`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-semibold text-white">{est.nome_fantasia || est.razao_social}</div>
                      <div className="text-sm text-slate-400">
                        {(() => {
                          const cat = est.categoria?.[0];
                          const found = CATEGORIAS_ESTABELECIMENTO.find(c => c.value === cat);
                          return found ? `${found.icon} ${found.label}` : '🏪 Sem categoria';
                        })()}
                      </div>
                    </div>
                    {est.deleted_at && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold">
                        Deletado
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-300">{est.cnpj}</td>
                <td className="p-4 text-slate-300">{est.cidade || 'N/A'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={est.ativo !== false}
                      onCheckedChange={() => handleToggleEstablishmentStatus(est.id, est.ativo !== false)}
                      disabled={!!est.deleted_at}
                    />
                    <span className="text-sm text-slate-400">
                      {est.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  {est.deleted_at ? (
                    <button 
                      onClick={() => handleRestaurarUm(est.id)}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors ml-auto"
                    >
                      <AlertCircle size={16} />
                      Restaurar
                    </button>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleBuscarFotoIndividual(est)}
                        className="p-2 text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 rounded-lg transition-colors"
                        title="Buscar foto"
                      >
                        <Camera size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(est, 'establishment')}
                        className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(est, 'establishment')}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEstablishments.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhum estabelecimento encontrado.</div>
        )}
      </div>
    </div>
  );

  const renderEmailAnalytics = () => {
    // Cálculos de métricas
    const totalSent = emailAnalytics.length;
    const totalOpened = emailAnalytics.filter(e => e.opened_at).length;
    const totalClicked = emailAnalytics.filter(e => e.clicked_at).length;
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
    const clickToOpenRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

    // Analytics por tipo de email
    const welcome = emailAnalytics.filter(e => e.email_type === 'welcome');
    const reminder = emailAnalytics.filter(e => e.email_type === 'birthday_reminder');
    const birthday = emailAnalytics.filter(e => e.email_type === 'birthday_today');

    const getMetrics = (emails: any[]) => {
      const sent = emails.length;
      const opened = emails.filter(e => e.opened_at).length;
      const clicked = emails.filter(e => e.clicked_at).length;
      return {
        sent,
        opened,
        clicked,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0',
        clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0',
      };
    };

    const welcomeMetrics = getMetrics(welcome);
    const reminderMetrics = getMetrics(reminder);
    const birthdayMetrics = getMetrics(birthday);

    return (
      <div className="space-y-6">
        {/* Cards de Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Send className="w-8 h-8 text-violet-400" />
              <span className="text-2xl font-bold text-white">{totalSent}</span>
            </div>
            <h3 className="text-sm text-slate-400">E-mails Enviados</h3>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">{openRate}%</span>
            </div>
            <h3 className="text-sm text-slate-400">Taxa de Abertura</h3>
            <p className="text-xs text-slate-500 mt-1">{totalOpened} abertos</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{clickRate}%</span>
            </div>
            <h3 className="text-sm text-slate-400">Taxa de Clique</h3>
            <p className="text-xs text-slate-500 mt-1">{totalClicked} cliques</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-amber-400" />
              <span className="text-2xl font-bold text-white">{clickToOpenRate}%</span>
            </div>
            <h3 className="text-sm text-slate-400">Conversão Abertura→Clique</h3>
            <p className="text-xs text-slate-500 mt-1">De quem abriu</p>
          </div>
        </div>

        {/* Performance por Tipo de E-mail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { name: 'Boas-vindas', metrics: welcomeMetrics, icon: '👋', color: 'violet' },
            { name: 'Lembrete (7 dias)', metrics: reminderMetrics, icon: '📆', color: 'blue' },
            { name: 'Parabéns (hoje)', metrics: birthdayMetrics, icon: '🎂', color: 'fuchsia' },
          ].map((type) => (
            <div key={type.name} className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{type.name}</h3>
                  <p className="text-sm text-slate-400">{type.metrics.sent} enviados</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Taxa Abertura</span>
                  <span className={`text-lg font-bold text-${type.color}-400`}>{type.metrics.openRate}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r from-${type.color}-600 to-${type.color}-400 h-2 rounded-full`} 
                    style={{ width: `${type.metrics.openRate}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Cliques: {type.metrics.clickRate}%</span>
                  <span>{type.metrics.clicked} de {type.metrics.sent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela de E-mails Recentes */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">E-mails Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-300 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 border-b border-white/10">Tipo</th>
                  <th className="p-4 border-b border-white/10">E-mail</th>
                  <th className="p-4 border-b border-white/10">Enviado</th>
                  <th className="p-4 border-b border-white/10">Status</th>
                  <th className="p-4 border-b border-white/10 text-center">Cliques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {emailAnalytics.slice(0, 20).map(email => (
                  <tr key={email.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                        {email.email_type === 'welcome' && '👋 Boas-vindas'}
                        {email.email_type === 'birthday_reminder' && '📆 Lembrete'}
                        {email.email_type === 'birthday_today' && '🎂 Parabéns'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{email.email_address}</td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(email.sent_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {email.opened_at ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                            <Mail size={12} /> Aberto
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">
                            Enviado
                          </span>
                        )}
                        {email.clicked_at && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                            Clicou
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-300 font-semibold">
                      {email.click_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {emailAnalytics.length === 0 && (
              <div className="p-8 text-center text-slate-500">Nenhum e-mail enviado ainda.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-white">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-white/10 transition-transform transform 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${mobileMenuOpen ? 'translate-x-0' : ''}
          lg:translate-x-0 lg:static flex flex-col shadow-xl
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            AdminPanel
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <TrendingUp size={20} /> Dashboard
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gerenciamento</div>
          <button 
             onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); setSearchTerm(''); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Users size={20} /> Usuários
          </button>
          <button 
             onClick={() => { setActiveTab('establishments'); setMobileMenuOpen(false); setSearchTerm(''); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'establishments' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Building2 size={20} /> Estabelecimentos
          </button>
          <button 
             onClick={() => { setActiveTab('mapa'); setMobileMenuOpen(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'mapa' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
            Mapa
          </button>
          <button 
             onClick={() => { setActiveTab('colaboradores'); setMobileMenuOpen(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'colaboradores' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <UserCog size={20} /> Colaboradores
          </button>
          <button 
             onClick={() => navigate('/admin/import')}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/5 text-slate-300"
          >
            <Upload size={20} /> Importar CSV
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Analytics</div>
          <button 
             onClick={() => { setActiveTab('email-analytics'); setMobileMenuOpen(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'email-analytics' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <Mail size={20} /> E-mails
          </button>
          <button 
             onClick={() => { setActiveTab('navigation-metrics'); setMobileMenuOpen(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'navigation-metrics' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <TrendingUp size={20} /> Navegação B2B
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 lg:px-8 relative z-10">
          <button className="lg:hidden text-slate-400" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="hidden lg:flex text-slate-400 text-sm">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateBirthdayRobot}
              disabled={sendingEmails}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-lg text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Simular envio diário de e-mails de aniversário"
            >
              {sendingEmails ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Testar Robô 🤖
                </>
              )}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">{adminName}</div>
                <div className="text-xs text-slate-400">Administrador</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold border-2 border-white/20">
                {adminName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">
                {activeTab === 'overview' && 'Visão Geral'}
                {activeTab === 'users' && 'Usuários Cadastrados'}
                {activeTab === 'establishments' && 'Parceiros & Empresas'}
                {activeTab === 'mapa' && 'Mapa de Estabelecimentos'}
                {activeTab === 'email-analytics' && 'Analytics de E-mails'}
                {activeTab === 'navigation-metrics' && 'Métricas de Navegação B2B'}
              </h1>
              <p className="text-slate-400">
                {activeTab === 'navigation-metrics' 
                  ? 'Dados de tráfego gerado para negociações com parceiros de transporte'
                  : activeTab === 'mapa'
                  ? 'Visualize todos os estabelecimentos no mapa com suas localizações'
                  : 'Bem-vindo ao painel de controle do sistema.'
                }
              </p>
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsersTable()}
            {activeTab === 'establishments' && renderEstablishmentsTable()}
            {activeTab === 'mapa' && (
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="h-[600px]">
                  <MapaEstabelecimentos
                    estabelecimentos={filteredEstablishments}
                    showClusters={true}
                    height="600px"
                  />
                </div>
              </div>
            )}
            {activeTab === 'colaboradores' && <GerenciarColaboradores />}
            {activeTab === 'email-analytics' && renderEmailAnalytics()}
            {activeTab === 'navigation-metrics' && <NavigationMetricsPanel />}
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="text-rose-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir <strong className="text-white">{currentItem?.nome_fantasia || currentItem?.cpf}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAIS DE EDIÇÃO COMPLETOS */}
      <EditUserModal
        user={selectedUser}
        open={editUserModalOpen}
        onOpenChange={setEditUserModalOpen}
        onSuccess={loadData}
      />

      <EditEstablishmentModal
        establishment={selectedEstab}
        open={editEstabModalOpen}
        onOpenChange={setEditEstabModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
