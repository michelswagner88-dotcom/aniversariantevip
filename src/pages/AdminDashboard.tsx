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
  Loader2
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'user' | 'establishment' | null>(null);

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
      const [usersRes, establishmentsRes, cuponsRes] = await Promise.all([
        supabase.from('aniversariantes').select('*').is('deleted_at', null),
        supabase.from('estabelecimentos').select('*').is('deleted_at', null),
        supabase.from('cupons').select('*').is('deleted_at', null)
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (establishmentsRes.data) setEstablishments(establishmentsRes.data);
      if (cuponsRes.data) setCupons(cuponsRes.data);
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

  const handleEditClick = (item: any, type: 'user' | 'establishment') => {
    setCurrentItem({ ...item });
    setItemType(type);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (itemType === 'user') {
        const { error } = await supabase
          .from('aniversariantes')
          .update({ 
            telefone: currentItem.telefone,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentItem.id);
        
        if (error) throw error;
        setUsers(users.map(u => u.id === currentItem.id ? currentItem : u));
        toast.success('Usuário atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('estabelecimentos')
          .update({
            nome_fantasia: currentItem.nome_fantasia,
            telefone: currentItem.telefone,
            categoria: currentItem.categoria,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentItem.id);
        
        if (error) throw error;
        setEstablishments(establishments.map(e => e.id === currentItem.id ? currentItem : e));
        toast.success('Estabelecimento atualizado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setEditModalOpen(false);
      setCurrentItem(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const filteredEstablishments = useMemo(() => {
    return establishments.filter(est => 
      est.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      est.razao_social?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [establishments, searchTerm]);

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
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white">Gerenciar Estabelecimentos</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar empresa..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-300 text-sm font-semibold uppercase tracking-wider">
              <th className="p-4 border-b border-white/10">Estabelecimento</th>
              <th className="p-4 border-b border-white/10">CNPJ</th>
              <th className="p-4 border-b border-white/10">Cidade</th>
              <th className="p-4 border-b border-white/10 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredEstablishments.map(est => (
              <tr key={est.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-white">{est.nome_fantasia || est.razao_social}</div>
                  <div className="text-sm text-slate-400">
                    {(() => {
                      const cat = est.categoria?.[0];
                      const found = CATEGORIAS_ESTABELECIMENTO.find(c => c.value === cat);
                      return found ? `${found.icon} ${found.label}` : '🏪 Sem categoria';
                    })()}
                  </div>
                </td>
                <td className="p-4 text-slate-300">{est.cnpj}</td>
                <td className="p-4 text-slate-300">{est.cidade || 'N/A'}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(est, 'establishment')}
                      className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(est, 'establishment')}
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
        {filteredEstablishments.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhum estabelecimento encontrado.</div>
        )}
      </div>
    </div>
  );

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
          <div className="flex items-center gap-4">
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
              </h1>
              <p className="text-slate-400">Bem-vindo ao painel de controle do sistema.</p>
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsersTable()}
            {activeTab === 'establishments' && renderEstablishmentsTable()}
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

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Editar {itemType === 'user' ? 'Usuário' : 'Estabelecimento'}</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {itemType === 'user' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">CPF (não editável)</label>
                    <input 
                      type="text" 
                      value={currentItem.cpf}
                      disabled
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                    <input 
                      type="text" 
                      value={currentItem.telefone || ''}
                      onChange={(e) => setCurrentItem({...currentItem, telefone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome Fantasia</label>
                    <input 
                      type="text" 
                      value={currentItem.nome_fantasia || ''}
                      onChange={(e) => setCurrentItem({...currentItem, nome_fantasia: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                    <input 
                      type="text" 
                      value={currentItem.telefone || ''}
                      onChange={(e) => setCurrentItem({...currentItem, telefone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-white"
                    />
                  </div>
                </>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg font-medium"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
