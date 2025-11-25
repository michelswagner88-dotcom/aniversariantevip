import { useEffect, useState, useRef } from 'react';
import { X, Share2, Clock, CheckCircle2, Calendar, Bell, BellRing } from 'lucide-react';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import { useNotifications } from '../hooks/useNotifications';

const CouponScreen = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'coupon' | 'invite'>('coupon');
  const [isSharing, setIsSharing] = useState(false);
  const inviteRef = useRef<HTMLDivElement>(null);
  
  // Hook de Notificações
  const { permission, requestPermission } = useNotifications();

  const data = {
    id: "VIP-9823-XC",
    placeName: "Sushi Palace",
    benefit: "Rodízio Grátis",
    rules: "Aniversariante + 1 pagante",
    userName: "Carlos Silva",
    date: "24/11/2025",
    fullDate: new Date('2025-11-24T20:00:00'),
    address: "Rua das Flores, 123 - Centro",
    bgImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 6000);
    return () => { clearInterval(timer); clearTimeout(confettiTimer); };
  }, []);

  // Adicionar ao Calendário
  const handleAddToCalendar = () => {
    const start = data.fullDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(data.fullDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Niver no ${data.placeName}`)}&dates=${start}/${end}&details=${encodeURIComponent(`Benefício: ${data.benefit}. Regras: ${data.rules}`)}&location=${encodeURIComponent(data.address)}`;
    
    window.open(googleUrl, '_blank');
    toast.success("Redirecionando para o Google Agenda...");
  };

  const handleShareInvite = async () => {
    if (!inviteRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(inviteRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });

      const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (!imageBlob) throw new Error("Erro ao gerar imagem");

      const shareData = {
        title: `Convite: Niver do ${data.userName}`,
        text: `Ei! Vou comemorar meu aniversário no ${data.placeName} e quero você lá! 🎂`,
        files: [new File([imageBlob], 'convite-vip.png', { type: 'image/png' })]
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const link = document.createElement('a');
        link.download = 'meu-convite-vip.png';
        link.href = canvas.toDataURL();
        link.click();
        toast.success("Convite baixado! Agora poste no Insta.");
      }
    } catch (error) {
      toast.error("Não foi possível compartilhar direto. Tente tirar print.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-slate-950 p-4 font-inter overflow-y-auto pb-20">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} colors={['#8b5cf6', '#ec4899', '#fbbf24']} />}
      
      <div className="sticky top-0 z-30 w-full max-w-md pt-4 pb-6 bg-slate-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-lg">Seu Benefício VIP</h1>
          <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X size={20}/></button>
        </div>

        <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10">
          <button 
            onClick={() => setActiveTab('coupon')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'coupon' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            🎫 Cupom (Garçom)
          </button>
          <button 
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'invite' ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            💌 Criar Convite
          </button>
        </div>
      </div>

      {activeTab === 'coupon' && (
        <div className="w-full max-w-sm animate-in fade-in zoom-in duration-300 space-y-4">
          
          {/* Card do Cupom */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-amber-500/30">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-300/20 via-yellow-500/20 to-amber-300/20 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="relative h-48 w-full">
                <img src={data.bgImage} className="h-full w-full object-cover opacity-80" alt={data.placeName} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  <CheckCircle2 size={14} /> Cupom Ativo
                </div>
              </div>

              <div className="px-6 pb-8 text-center">
                <h2 className="font-plus-jakarta text-2xl font-bold text-white">{data.placeName}</h2>
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Benefício</p>
                  <h1 className="mt-1 text-2xl font-extrabold text-white">{data.benefit}</h1>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 bg-slate-950/50 py-2 rounded-lg">
                  <Clock size={16} className="animate-pulse text-violet-400" />
                  <span className="font-mono text-xl font-medium text-white">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>

                <div className="mt-6 border-t-2 border-dashed border-slate-800 pt-6">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Código de Validação</p>
                  <span className="font-mono text-3xl font-bold tracking-widest text-white">{data.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleAddToCalendar}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors active:scale-95"
            >
              <Calendar size={18} className="text-violet-400" />
              Salvar Data
            </button>

            <button 
              onClick={requestPermission}
              disabled={permission === 'granted'}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all active:scale-95 ${
                permission === 'granted' 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default' 
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {permission === 'granted' ? (
                <>
                  <BellRing size={18} className="animate-pulse" />
                  Ativado
                </>
              ) : (
                <>
                  <Bell size={18} className="text-pink-400" />
                  Me Lembre
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 px-4">
            Mostre esta tela ao chegar. O relógio em movimento comprova a validade.
          </p>
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="w-full max-w-sm animate-in slide-in-from-right duration-300 flex flex-col items-center">
          <p className="mb-4 text-center text-sm text-slate-400">
            Este é o convite oficial para seus amigos. <br/> Compartilhe no Insta ou Whats!
          </p>

          <div 
            ref={inviteRef}
            className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl text-center"
          >
            <img src={data.bgImage} className="absolute inset-0 h-full w-full object-cover opacity-60" crossOrigin="anonymous" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90"></div>
            
            <div className="relative z-10 flex h-full flex-col items-center justify-between p-8 py-12">
              <div className="w-full">
                <div className="mx-auto mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  🎉 Convite VIP
                </div>
                <h2 className="font-plus-jakarta text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
                  Vamos<br/>Comemorar!
                </h2>
                <p className="mt-4 text-lg font-medium text-violet-200 drop-shadow-md">
                  Aniversário do {data.userName.split(' ')[0]}
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase text-slate-400">Onde?</p>
                  <h3 className="text-xl font-bold text-white">{data.placeName}</h3>
                  <p className="text-sm text-slate-300">{data.address}</p>
                </div>
                
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase text-slate-400">Quando?</p>
                  <h3 className="text-xl font-bold text-white">{data.date}</h3>
                </div>
              </div>

              <div className="w-full">
                <div className="mb-2 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <p className="text-[10px] uppercase tracking-widest text-white/60">
                  AniversarianteVIP.com.br
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleShareInvite}
            disabled={isSharing}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-4 font-bold text-white shadow-lg shadow-violet-500/30 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isSharing ? "Gerando imagem..." : (
              <>
                <Share2 size={20} />
                Compartilhar Convite
              </>
            )}
          </button>
          
          <p className="mt-4 text-xs text-slate-500">
            *Ao clicar, você poderá enviar direto para o Stories ou WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponScreen;
