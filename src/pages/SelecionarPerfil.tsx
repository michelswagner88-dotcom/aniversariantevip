import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RoleCard = ({ icon: Icon, title, description, onClick, gradientClass }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-white/10 hover:border-violet-500/50 group text-left w-full h-full"
    >
      <div className={`p-4 rounded-full mb-6 bg-gradient-to-r ${gradientClass} group-hover:scale-110 transition-transform`}>
        <Icon size={32} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 mb-8 flex-grow leading-relaxed font-medium">{description}</p>
      <div className="flex items-center font-bold text-lg text-violet-400 group-hover:gap-3 gap-1 transition-all">
        Acessar Painel <ArrowRight size={24} className="ml-1" />
      </div>
    </button>
  );
};

export default function SelecionarPerfil() {
  const navigate = useNavigate();

  const handleAniversarianteClick = () => {
    navigate('/auth');
  };

  const handleEstabelecimentoClick = () => {
    navigate('/login-estabelecimento');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Glow effects */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Como você deseja <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">acessar</span> a plataforma?
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Escolha o perfil que corresponde à sua necessidade
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Card Aniversariante */}
          <RoleCard
            icon={Users}
            title="Entrar como Aniversariante"
            description="Acesse benefícios exclusivos, emita cupons e aproveite descontos especiais no seu aniversário."
            onClick={handleAniversarianteClick}
            gradientClass="from-violet-600 via-fuchsia-500 to-pink-500"
          />

          {/* Card Estabelecimento */}
          <RoleCard
            icon={Building2}
            title="Entrar como Estabelecimento"
            description="Gerencie seu estabelecimento, cadastre benefícios, atraia clientes e acompanhe suas estatísticas."
            onClick={handleEstabelecimentoClick}
            gradientClass="from-cyan-500 via-blue-500 to-indigo-600"
          />

        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Ainda não tem conta?{' '}
            <button 
              onClick={() => navigate('/auth')}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Cadastre-se gratuitamente
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
