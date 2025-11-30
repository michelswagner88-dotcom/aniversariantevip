import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  DollarSign, 
  Building2, 
  TrendingUp, 
  Copy, 
  CheckCircle2,
  ExternalLink,
  Wallet,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Afiliado() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [stats, setStats] = useState({
    total_earned: 0,
    total_establishments: 0,
    active_establishments: 0,
    pending_commission: 0,
  });
  const [stripeConnected, setStripeConnected] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);

    // Verificar status do Stripe Connect
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (profile?.stripe_onboarding_completed) {
      setStripeConnected(true);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Buscar estatísticas do afiliado (view já filtra automaticamente por auth.uid())
      const { data: statsData } = await supabase
        .from('affiliate_stats')
        .select('*')
        .maybeSingle();

      if (statsData) {
        setStats({
          total_earned: Number(statsData.total_earned) || 0,
          total_establishments: Number(statsData.total_establishments) || 0,
          active_establishments: Number(statsData.active_establishments) || 0,
          pending_commission: Number(statsData.pending_commission) || 0,
        });
      }

      // Buscar últimas comissões
      const { data: referralsData } = await supabase
        .from('referrals')
        .select(`
          *,
          estabelecimentos (
            nome_fantasia,
            razao_social
          )
        `)
        .eq('referrer_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setReferrals(referralsData || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding');

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Erro ao conectar Stripe:', error);
      toast.error('Erro ao conectar carteira. Tente novamente.');
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/cadastro-estabelecimento?ref=${userId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = `${window.location.origin}/cadastro-estabelecimento?ref=${userId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Glow Effects */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px]" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Programa <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 text-transparent bg-clip-text">Indique e Ganhe</span>
          </h1>
          <p className="text-slate-400">Ganhe 30% de comissão recorrente indicando estabelecimentos comerciais</p>
        </div>

        {/* Alerta Importante */}
        <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200">
            <strong>Atenção:</strong> Válido apenas para indicação de <strong>Estabelecimentos Comerciais (CNPJ)</strong>. 
            Cadastros de pessoa física não geram comissão.
          </div>
        </div>

        {/* Conectar Carteira */}
        {!stripeConnected && (
          <div className="mb-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Conecte sua Carteira</h3>
                <p className="text-slate-400 mb-4">
                  Para receber suas comissões, você precisa conectar sua conta bancária através do Stripe.
                </p>
                <button
                  onClick={handleConnectStripe}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
                >
                  Conectar Carteira <ExternalLink className="inline w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Saldo Disponível</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              R$ {stats.total_earned.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Comissões pagas</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Estabelecimentos</span>
              <Building2 className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.total_establishments}
            </div>
            <div className="text-xs text-emerald-400 mt-1">
              {stats.active_establishments} ativos
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Comissão Pendente</span>
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              R$ {stats.pending_commission.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">A receber</div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Receita Recorrente</span>
              <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              R$ {(stats.active_establishments * 29.90 * 0.30).toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Estimada/mês</div>
          </div>
        </div>

        {/* Link de Indicação */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Seu Link de Indicação</h3>
              <p className="text-sm text-slate-400">Compartilhe com estabelecimentos comerciais</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Histórico de Comissões */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Histórico de Comissões</h3>
          
          {referrals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma indicação ainda</p>
              <p className="text-sm mt-1">Compartilhe seu link para começar a ganhar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {referral.estabelecimentos?.nome_fantasia || referral.estabelecimentos?.razao_social}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      referral.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      R$ {Number(referral.commission_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {referral.status === 'paid' ? 'Pago' : 'Pendente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
