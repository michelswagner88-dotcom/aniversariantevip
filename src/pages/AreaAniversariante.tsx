import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, Gift, MapPin, User, LogOut, Edit2, X, Mail, Phone, Save, Loader2, Heart, Store, Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFavoritos } from '@/hooks/useFavoritos';
import { BackButton } from '@/components/BackButton';
import { resizeImage } from '@/lib/imageUtils';

// --- Componentes UI Reutilizáveis ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}>
    <div className="relative z-10">{children}</div>
  </div>
);

interface MenuOptionProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  onClick: () => void;
  isDestructive?: boolean;
}

const MenuOption = ({ icon: Icon, title, subtitle, onClick, isDestructive = false }: MenuOptionProps) => (
  <button 
    onClick={onClick}
    className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 active:scale-95 mb-3"
  >
    <div className="flex items-center gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDestructive ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400 group-hover:bg-violet-500/20 group-hover:text-violet-400'} transition-colors`}>
        <Icon size={20} />
      </div>
      <div className="text-left">
        <h3 className={`font-medium ${isDestructive ? 'text-red-400' : 'text-white'}`}>{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400" />
  </button>
);

const AreaAniversariante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [favoritosEstabelecimentos, setFavoritosEstabelecimentos] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dados do usuário
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    cpf: '',
    dataNascimento: '',
    avatarUrl: '',
  });

  // Dados editáveis (apenas telefone e email)
  const [editData, setEditData] = useState({
    email: '',
    phone: '',
  });

  // Hook de favoritos
  const { favoritos, isFavorito, toggleFavorito } = useFavoritos(userId);

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        setUserId(session.user.id);

        // Buscar profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Buscar dados de aniversariante
        const { data: anivData } = await supabase
          .from('aniversariantes')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && anivData) {
          const formattedPhone = anivData.telefone ? formatPhone(anivData.telefone) : '';
          const formattedCPF = anivData.cpf ? formatCPF(anivData.cpf) : '';
          
          setUserData({
            id: session.user.id,
            name: profile.nome || 'Usuário',
            email: profile.email,
            phone: formattedPhone,
            cpf: formattedCPF,
            dataNascimento: anivData.data_nascimento || '',
            avatarUrl: session.user.user_metadata?.avatar_url || '',
          });

          setEditData({
            email: profile.email,
            phone: formattedPhone,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  // Buscar estabelecimentos favoritos
  useEffect(() => {
    const loadFavoritosEstabelecimentos = async () => {
      if (!userId || favoritos.length === 0) {
        setFavoritosEstabelecimentos([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('public_estabelecimentos')
          .select('id, nome_fantasia, logo_url, categoria, cidade, estado')
          .in('id', favoritos)
          .limit(3);

        if (error) throw error;
        setFavoritosEstabelecimentos(data || []);
      } catch (error) {
        console.error('Erro ao carregar estabelecimentos favoritos:', error);
      }
    };

    loadFavoritosEstabelecimentos();
  }, [userId, favoritos]);

  // Formatação
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
        .replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Calcular dias até aniversário
  const calculateDaysUntilBirthday = () => {
    if (!userData.dataNascimento) return 0;
    
    const today = new Date();
    const birthDate = new Date(userData.dataNascimento);
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysUntilBirthday();
  const progress = Math.max(0, Math.min(100, 100 - (daysLeft * 0.27)));

  // Formatação de data para exibição
  const formatBirthdayDisplay = () => {
    if (!userData.dataNascimento) return 'Não informado';
    const date = new Date(userData.dataNascimento + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  // Salvar alterações
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const phoneClean = editData.phone.replace(/\D/g, '');

      // Atualizar email no profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: editData.email })
        .eq('id', userData.id);

      if (profileError) throw profileError;

      // Atualizar telefone no aniversariantes
      const { error: anivError } = await supabase
        .from('aniversariantes')
        .update({ telefone: phoneClean })
        .eq('id', userData.id);

      if (anivError) throw anivError;

      // Atualizar estado local
      setUserData(prev => ({
        ...prev,
        email: editData.email,
        phone: editData.phone,
      }));

      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram salvas com sucesso.",
      });

      setShowEditModal(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível atualizar seus dados.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Upload de foto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // Redimensionar imagem
      const resizedFile = await resizeImage(file, 400, 400);

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estabelecimento-logos')
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('estabelecimento-logos')
        .getPublicUrl(filePath);

      // Atualizar metadata do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setUserData(prev => ({ ...prev, avatarUrl: publicUrl }));

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível atualizar a foto.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta VIP.",
    });
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 pb-32 text-white font-inter">
      {/* Background Grid Sutil */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Header Fixo Mobile */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <BackButton to="/" />
          <h1 className="font-plus-jakarta text-lg font-bold text-white">Meu Perfil VIP</h1>
        </div>
      </div>

      <div className="px-6 pt-8">
        
        {/* 1. Perfil do Usuário */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-900 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
                  <User size={40} />
                </div>
              )}
            </div>
            
            {/* Botão de Upload de Foto */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          
          <h2 className="font-plus-jakarta text-2xl font-bold text-white">{userData.name}</h2>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-400 ring-1 ring-violet-500/20">
            👑 Membro VIP
          </div>
        </div>

        {/* 2. Card de Status do Aniversário */}
        <GlassCard className="mb-8 border-violet-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <Gift size={100} className="rotate-12" />
          </div>
          
          <div className="relative z-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Sua Data Especial</p>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-violet-400" size={24} />
              <span className="text-2xl font-bold text-white">{formatBirthdayDisplay()}</span>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-white">Falta pouco!</span>
                <span className="text-violet-300 font-bold">{daysLeft} dias</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Já deixe tudo preparado para comemorar em grande estilo.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 3. Acelerador (Banner de Ação) */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 p-1 ring-1 ring-white/10">
          <div className="rounded-xl bg-slate-950/80 px-5 py-4 backdrop-blur-sm sm:flex sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-xl">🚀</span> Não deixe para última hora!
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Existem benefícios exclusivos perto de você hoje.
              </p>
            </div>
            <button 
              onClick={() => navigate('/explorar')}
              className="w-full sm:w-auto rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-200 transition-colors"
            >
              Explorar Ofertas
            </button>
          </div>
        </div>

        {/* 3.5. Seção de Favoritos */}
        {favoritosEstabelecimentos.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">Meus Favoritos</h3>
              <button 
                onClick={() => navigate('/meus-favoritos')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Ver todos
              </button>
            </div>
            
            <div className="space-y-3">
              {favoritosEstabelecimentos.map((estabelecimento) => (
                <GlassCard key={estabelecimento.id} className="group cursor-pointer hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                      {estabelecimento.logo_url ? (
                        <img 
                          src={estabelecimento.logo_url} 
                          alt={estabelecimento.nome_fantasia || 'Logo'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-600">
                          <Store size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{estabelecimento.nome_fantasia}</h4>
                      <p className="text-xs text-slate-400 truncate">
                        {estabelecimento.cidade}, {estabelecimento.estado}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorito(estabelecimento.id);
                      }}
                      className="flex-shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 transition-colors"
                    >
                      <Heart className="h-5 w-5 text-red-400 fill-current" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* 4. Menu de Opções (Minha Conta) */}
        <div>
          <h3 className="mb-4 px-1 text-xs font-bold uppercase tracking-wider text-slate-500">Minha Conta</h3>
          
          <MenuOption 
            icon={User} 
            title="Editar Dados Pessoais" 
            subtitle="E-mail e telefone" 
            onClick={() => setShowEditModal(true)} 
          />
          
          <MenuOption 
            icon={Heart} 
            title="Meus Favoritos" 
            subtitle="Estabelecimentos salvos"
            onClick={() => navigate('/meus-favoritos')} 
          />
          
          {/* MenuOption de Meus Cupons removido - funcionalidade descontinuada */}

          <div className="mt-6 border-t border-white/5 pt-6">
            <MenuOption 
              icon={LogOut} 
              title="Sair da Conta" 
              isDestructive={true}
              onClick={handleLogout} 
            />
          </div>
        </div>

        {/* Versão do App */}
        <p className="mt-8 text-center text-xs text-slate-600">
          Versão 1.0.2 • Aniversariante VIP App
        </p>

      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 pb-6 pt-2 backdrop-blur-xl">
        <div className="flex justify-around items-center">
           <button 
             onClick={() => navigate('/explorar')}
             className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-white transition-colors"
           >
             <MapPin size={22} />
             <span className="text-[10px] font-medium">Explorar</span>
           </button>
           
           {/* Botão Cupons removido - funcionalidade descontinuada */}

           <button className="flex flex-col items-center gap-1 p-2 text-violet-400">
             <User size={22} />
             <span className="text-[10px] font-medium">Perfil</span>
           </button>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 font-plus-jakarta text-xl font-bold text-white">Editar Dados</h2>

            {/* Campos Bloqueados */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  CPF (Não editável)
                </label>
                <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-slate-500">
                  {userData.cpf}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data de Nascimento (Não editável)
                </label>
                <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-slate-500">
                  {formatBirthdayDisplay()}
                </div>
              </div>
            </div>

            {/* Campos Editáveis */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: formatPhone(e.target.value) })}
                    maxLength={15}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3.5 font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaAniversariante;
