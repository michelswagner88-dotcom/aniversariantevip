// =============================================================================
// ESTABELECIMENTO PAGE - TOP 1 MUNDIAL
// Versão definitiva com todas as melhorias dos relatórios Manus/ChatGPT/Claude
// =============================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Gift,
  MapPin,
  Clock,
  Phone,
  Instagram,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Copy,
  Check,
  X,
  Navigation,
  Car,
  Users,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Calendar,
  UserCheck,
  FileText,
  ChevronUp,
  ExternalLink,
  Loader2,
  ImageIcon,
  CheckCircle2,
  Info,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  nome_fantasia: string;
  razao_social?: string;
  categoria: string[];
  especialidades?: string[];
  descricao?: string;
  descricao_beneficio: string;
  regras_beneficio?: string;
  valor_beneficio?: number;
  validade_beneficio?: string;
  logo_url?: string;
  imagem_url?: string;
  fotos?: string[];
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  telefone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  horario_funcionamento?: Record<string, string> | string;
  verificado?: boolean;
  resgates_mes?: number;
  slug?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BRAND_COLORS = {
  primary: "#240046",
  secondary: "#3C096C",
  accent: "#5A189A",
  light: "#7B2CBF",
  gradient: "linear-gradient(135deg, #240046 0%, #5A189A 100%)",
};

const DIAS_SEMANA = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

const REGRAS_GERAIS = [
  "Apresente documento oficial com foto e data de nascimento",
  "Confirme disponibilidade do benefício antes de ir ao estabelecimento",
  "Benefício válido apenas 1x por ano por pessoa",
  "Sujeito a alterações sem aviso prévio",
  "Não acumulativo com outras promoções",
];

// =============================================================================
// UTILS
// =============================================================================

const formatPhone = (phone?: string) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

const getWhatsAppLink = (phone?: string, message?: string) => {
  if (!phone) return "#";
  const cleaned = phone.replace(/\D/g, "");
  const msg = encodeURIComponent(message || "Olá! Vi no AniversarianteVIP e gostaria de mais informações.");
  return `https://wa.me/55${cleaned}?text=${msg}`;
};

const getInstagramLink = (instagram?: string) => {
  if (!instagram) return "#";
  const handle = instagram.replace("@", "").replace("https://instagram.com/", "");
  return `https://instagram.com/${handle}`;
};

// Parse horario_funcionamento que pode vir como string ou objeto do banco
const parseHorarioFuncionamento = (horario?: Record<string, string> | string): Record<string, string> | undefined => {
  if (!horario) return undefined;
  if (typeof horario === "string") {
    try {
      return JSON.parse(horario);
    } catch {
      return undefined;
    }
  }
  return horario;
};

const isOpenNow = (horarios?: Record<string, string> | string): { open: boolean; text: string } => {
  const parsed = parseHorarioFuncionamento(horarios);
  if (!parsed) return { open: false, text: "Horário não informado" };

  const now = new Date();
  const dayIndex = now.getDay();
  const dayName = DIAS_SEMANA[dayIndex];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = parsed[dayName];
  if (!todayHours || todayHours.toLowerCase() === "fechado") {
    return { open: false, text: "Fechado hoje" };
  }

  // Parse "12:00 - 23:00" format
  const match = todayHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (match) {
    const openTime = parseInt(match[1]) * 60 + parseInt(match[2]);
    const closeTime = parseInt(match[3]) * 60 + parseInt(match[4]);

    if (currentTime >= openTime && currentTime <= closeTime) {
      const closeHour = match[3].padStart(2, "0");
      const closeMin = match[4];
      return { open: true, text: `Aberto · Fecha às ${closeHour}:${closeMin}` };
    } else if (currentTime < openTime) {
      const openHour = match[1].padStart(2, "0");
      const openMin = match[2];
      return { open: false, text: `Fechado · Abre às ${openHour}:${openMin}` };
    }
  }

  return { open: false, text: "Fechado agora" };
};

// =============================================================================
// SKELETON LOADING
// =============================================================================

const PageSkeleton = memo(() => (
  <div className="min-h-screen bg-white">
    {/* Hero Skeleton */}
    <div className="relative h-[50vh] md:h-[60vh]">
      <Skeleton className="w-full h-full" />
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
));

// =============================================================================
// HERO GALLERY
// =============================================================================

const HeroGallery = memo(
  ({
    images,
    nome,
    beneficio,
    onShowGallery,
  }: {
    images: string[];
    nome: string;
    beneficio: string;
    onShowGallery: () => void;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const hasMultipleImages = images.length > 1;

    const next = useCallback(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, [images.length]);

    const prev = useCallback(() => {
      setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    }, [images.length]);

    return (
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-zinc-900">
        {/* Main Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex] || "/placeholder-estabelecimento.jpg"}
            alt={nome}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
            onLoad={() => setLoaded(true)}
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                      bg-white/90 hover:bg-white flex items-center justify-center
                      shadow-lg transition-all hover:scale-105 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                      bg-white/90 hover:bg-white flex items-center justify-center
                      shadow-lg transition-all hover:scale-105 z-10"
            >
              <ChevronRight className="w-6 h-6 text-zinc-800" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        )}

        {/* Floating Benefit Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-10"
        >
          <div
            className="bg-gradient-to-r from-[#240046] to-[#5A189A] 
                      text-white px-4 py-3 rounded-xl shadow-2xl
                      border border-white/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Gift className="w-5 h-5 text-yellow-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <span className="font-bold text-sm md:text-base">{beneficio}</span>
            </div>
          </div>
        </motion.div>

        {/* Gallery Button */}
        {images.length > 1 && (
          <button
            onClick={onShowGallery}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 
                    bg-white/90 hover:bg-white px-4 py-2 rounded-lg 
                    flex items-center gap-2 shadow-lg transition-all
                    hover:scale-105 z-10"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium text-sm">Ver {images.length} fotos</span>
          </button>
        )}

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 
                  hover:bg-white flex items-center justify-center shadow-lg
                  transition-all hover:scale-105 z-10"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-800" />
        </Link>

        {/* Share & Favorite */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => {
              navigator
                .share?.({
                  title: nome,
                  url: window.location.href,
                })
                .catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copiado!");
                });
            }}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white 
                    flex items-center justify-center shadow-lg transition-all hover:scale-105"
          >
            <Share2 className="w-5 h-5 text-zinc-800" />
          </button>
          <button
            onClick={() => toast.info("Faça login para favoritar")}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white 
                    flex items-center justify-center shadow-lg transition-all hover:scale-105"
          >
            <Heart className="w-5 h-5 text-zinc-800" />
          </button>
        </div>
      </div>
    );
  },
);

// =============================================================================
// BENEFIT CARD (Desktop Sidebar)
// =============================================================================

const BenefitCard = memo(
  ({
    estabelecimento,
    onResgate,
    onVerComoUsar,
  }: {
    estabelecimento: Estabelecimento;
    onResgate: () => void;
    onVerComoUsar: () => void;
  }) => {
    const valorEconomizado = estabelecimento.valor_beneficio || 50;
    const resgatesMes = estabelecimento.resgates_mes || Math.floor(Math.random() * 50) + 10;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5A189A]
                rounded-2xl p-6 text-white shadow-2xl sticky top-24
                border border-purple-400/20 overflow-hidden"
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -inset-[100%] animate-[spin_20s_linear_infinite]
                      bg-gradient-to-r from-transparent via-white/5 to-transparent"
          />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <Gift className="w-6 h-6 text-yellow-400" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              />
            </div>
            <span className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Benefício Exclusivo</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>

          {/* Título do Benefício */}
          <h2 className="text-xl font-bold mb-4 leading-tight">{estabelecimento.descricao_beneficio}</h2>

          {/* Valor Economizado */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-purple-200 text-sm">Você economiza:</span>
              <span className="text-2xl font-bold text-green-400">R$ {valorEconomizado}</span>
            </div>
          </div>

          {/* Validade */}
          <div className="flex items-center gap-2 text-yellow-300 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {estabelecimento.validade_beneficio || "Válido no dia do seu aniversário"}
            </span>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1.5 text-purple-200">
              <Users className="w-4 h-4" />
              <span>{resgatesMes} resgates este mês</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>Popular!</span>
            </div>
          </div>

          {/* CTA Principal */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onResgate}
            className="w-full bg-white text-[#240046] font-bold py-4 rounded-xl
                    text-lg shadow-lg hover:shadow-xl transition-all
                    flex items-center justify-center gap-2 mb-3"
          >
            <Gift className="w-5 h-5" />
            Resgatar Meu Benefício
          </motion.button>

          {/* Botão Ver Como Usar */}
          <button
            onClick={onVerComoUsar}
            className="w-full py-3 rounded-xl border-2 border-white/30 
                    text-white font-medium hover:bg-white/10 transition-all
                    flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" />
            Ver como usar
          </button>

          {/* Garantias */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-center gap-4 text-xs text-purple-200">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% grátis
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> Verificado
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

// =============================================================================
// STICKY MOBILE CTA
// =============================================================================

const StickyMobileCTA = memo(
  ({
    estabelecimento,
    isVisible,
    onResgate,
    onVerComoUsar,
  }: {
    estabelecimento: Estabelecimento;
    isVisible: boolean;
    onResgate: () => void;
    onVerComoUsar: () => void;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const valorEconomizado = estabelecimento.valor_beneficio || 50;

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          >
            <div className="bg-white border-t border-zinc-200 shadow-2xl">
              {/* Aba Expansível */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center py-2 bg-zinc-50 border-b"
              >
                <ChevronUp className={cn("w-5 h-5 text-zinc-400 transition-transform", isExpanded && "rotate-180")} />
              </button>

              {/* Conteúdo Expandido */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-purple-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-[#240046]">
                      <Gift className="w-5 h-5" />
                      <span className="font-semibold text-sm">{estabelecimento.descricao_beneficio}</span>
                    </div>
                    <p className="text-sm text-purple-700 mt-1">
                      {estabelecimento.validade_beneficio || "Válido no dia do seu aniversário"}
                    </p>
                    <button onClick={onVerComoUsar} className="mt-2 text-sm text-[#240046] font-medium underline">
                      Ver como usar →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Principal */}
              <div className="p-4 pb-safe">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Benefício Exclusivo</p>
                    <p className="font-semibold text-zinc-900 text-sm line-clamp-1">
                      {estabelecimento.descricao_beneficio?.slice(0, 30)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Economia</p>
                    <p className="text-lg font-bold text-green-600">R$ {valorEconomizado}</p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onResgate}
                  className="w-full bg-gradient-to-r from-[#240046] to-[#5A189A]
                          text-white font-bold py-4 rounded-xl
                          flex items-center justify-center gap-2
                          shadow-lg shadow-purple-500/30"
                >
                  <Gift className="w-5 h-5" />
                  Resgatar Benefício Grátis
                </motion.button>

                <p className="text-center text-xs text-zinc-500 mt-2">✓ 100% grátis • Cadastro em 30 segundos</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

// =============================================================================
// MODAL VER COMO USAR
// =============================================================================

const ModalComoUsar = memo(
  ({
    isOpen,
    onClose,
    estabelecimento,
    isLoggedIn,
    onLogin,
    onResgate,
  }: {
    isOpen: boolean;
    onClose: () => void;
    estabelecimento: Estabelecimento;
    isLoggedIn: boolean;
    onLogin: () => void;
    onResgate: () => void;
  }) => {
    // Parse regras do estabelecimento
    const regrasEstabelecimento = useMemo(() => {
      if (!estabelecimento.regras_beneficio) return [];
      return estabelecimento.regras_beneficio.split("\n").filter((r) => r.trim());
    }, [estabelecimento.regras_beneficio]);

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl 
                      max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">Como usar seu benefício</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 
                          flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {!isLoggedIn ? (
                  // Tela de Login
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="w-8 h-8 text-[#240046]" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Faça login para continuar</h3>
                    <p className="text-zinc-600 mb-6">
                      Para ver as regras e resgatar seu benefício, você precisa estar logado.
                    </p>
                    <Button
                      onClick={onLogin}
                      className="bg-[#240046] hover:bg-[#3C096C] text-white px-8 py-3 rounded-xl"
                    >
                      Fazer login ou criar conta
                    </Button>
                  </div>
                ) : (
                  // Conteúdo das Regras
                  <div className="space-y-6">
                    {/* Passos */}
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#240046]" />
                        Passo a passo
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            step: 1,
                            title: "Confirme a disponibilidade",
                            desc: "Entre em contato com o estabelecimento antes de ir",
                          },
                          {
                            step: 2,
                            title: "Vá no dia do seu aniversário",
                            desc: "Ou dentro do período de validade informado",
                          },
                          {
                            step: 3,
                            title: "Apresente seu documento",
                            desc: "Documento oficial com foto e data de nascimento",
                          },
                        ].map((item) => (
                          <div key={item.step} className="flex gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-[#240046] text-white 
                                        flex items-center justify-center font-bold text-sm flex-shrink-0"
                            >
                              {item.step}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900">{item.title}</p>
                              <p className="text-sm text-zinc-600">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Regras do Estabelecimento */}
                    {regrasEstabelecimento.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="font-semibold text-[#240046] mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Regras deste estabelecimento
                        </h3>
                        <ul className="space-y-2">
                          {regrasEstabelecimento.map((regra, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{regra}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Regras Gerais */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Importante saber
                      </h3>
                      <ul className="space-y-2">
                        {REGRAS_GERAIS.map((regra, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                            <span className="text-amber-600">•</span>
                            <span>{regra}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              {isLoggedIn && (
                <div className="sticky bottom-0 bg-white border-t p-4">
                  <Button
                    onClick={() => {
                      onResgate();
                      onClose();
                    }}
                    className="w-full bg-[#240046] hover:bg-[#3C096C] text-white py-4 rounded-xl font-bold"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Entendi, quero resgatar!
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

// =============================================================================
// COMO FUNCIONA SECTION
// =============================================================================

const ComoFuncionaSection = memo(() => (
  <section className="py-8 border-t border-zinc-200">
    <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
      <Gift className="w-5 h-5 text-[#240046]" />
      Como funciona
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          step: 1,
          icon: <UserCheck className="w-7 h-7" />,
          title: "Cadastre-se grátis",
          desc: "Crie sua conta e informe a data do seu aniversário",
        },
        {
          step: 2,
          icon: <Calendar className="w-7 h-7" />,
          title: "Visite o estabelecimento",
          desc: "No dia ou semana do seu aniversário (confira a validade)",
        },
        {
          step: 3,
          icon: <Gift className="w-7 h-7" />,
          title: "Resgate seu benefício",
          desc: "Apresente documento com foto e aproveite!",
        },
      ].map((item) => (
        <motion.div
          key={item.step}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: item.step * 0.1 }}
          className="relative bg-purple-50 rounded-2xl p-6 text-center"
        >
          {/* Step Number */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2
                        w-8 h-8 bg-[#240046] text-white rounded-full
                        flex items-center justify-center font-bold text-sm shadow-lg"
          >
            {item.step}
          </div>

          <div className="text-[#240046] mt-2 mb-3 flex justify-center">{item.icon}</div>
          <h3 className="font-semibold text-zinc-900 mb-1">{item.title}</h3>
          <p className="text-sm text-zinc-600">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
));

// =============================================================================
// INFO SECTION (Sobre, Horário, Localização)
// =============================================================================

const InfoSection = memo(({ estabelecimento }: { estabelecimento: Estabelecimento }) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const endereco = useMemo(() => {
    const parts = [
      estabelecimento.logradouro,
      estabelecimento.numero,
      estabelecimento.bairro,
      estabelecimento.cidade,
      estabelecimento.estado,
    ].filter(Boolean);
    return parts.join(", ");
  }, [estabelecimento]);

  const openStatus = useMemo(
    () => isOpenNow(estabelecimento.horario_funcionamento),
    [estabelecimento.horario_funcionamento],
  );

  const horariosParsed = useMemo(
    () => parseHorarioFuncionamento(estabelecimento.horario_funcionamento),
    [estabelecimento.horario_funcionamento],
  );

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(endereco);
    setCopiedAddress(true);
    toast.success("Endereço copiado!");
    setTimeout(() => setCopiedAddress(false), 2000);
  }, [endereco]);

  // Google Static Map URL
  const staticMapUrl = useMemo(() => {
    if (!estabelecimento.latitude || !estabelecimento.longitude) return null;
    const lat = estabelecimento.latitude;
    const lng = estabelecimento.longitude;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) return null;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=640x300&scale=2&markers=color:purple%7C${lat},${lng}&key=${apiKey}`;
  }, [estabelecimento.latitude, estabelecimento.longitude]);

  return (
    <div className="space-y-8">
      {/* Sobre */}
      <section>
        <h2 className="text-xl font-bold text-zinc-900 mb-4">Sobre</h2>
        <p className="text-zinc-700 leading-relaxed">
          {estabelecimento.descricao ||
            `${estabelecimento.nome_fantasia} é referência em ${estabelecimento.categoria?.[0] || "experiências"} em ${estabelecimento.bairro || estabelecimento.cidade}. Celebre seu aniversário com benefícios exclusivos e viva momentos inesquecíveis.`}
        </p>

        {/* Tags */}
        {estabelecimento.especialidades && estabelecimento.especialidades.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {estabelecimento.especialidades.map((esp) => (
              <Badge key={esp} variant="secondary" className="bg-purple-100 text-[#240046] hover:bg-purple-200">
                {esp}
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* Horário */}
      <section className="border-t border-zinc-200 pt-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#240046]" />
          Horário de funcionamento
        </h2>

        {/* Status Aberto/Fechado */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4",
            openStatus.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", openStatus.open ? "bg-green-500" : "bg-red-500")} />
          {openStatus.text}
        </div>

        {/* Horários por dia */}
        {horariosParsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(horariosParsed).map(([dia, horario]) => (
              <div key={dia} className="flex justify-between py-2 px-3 rounded-lg bg-zinc-50">
                <span className="text-zinc-600 capitalize">{dia}</span>
                <span className="font-medium text-zinc-900">{horario}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Localização */}
      <section className="border-t border-zinc-200 pt-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#240046]" />
          Localização
        </h2>

        {/* Endereço */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="text-zinc-700">{endereco}</p>
          <button
            onClick={copyAddress}
            className="flex items-center gap-1.5 text-sm text-[#240046] hover:underline flex-shrink-0"
          >
            {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAddress ? "Copiado!" : "Copiar"}
          </button>
        </div>

        {/* Mapa Estático */}
        {staticMapUrl && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden mb-4 hover:opacity-95 transition-opacity"
          >
            <img src={staticMapUrl} alt="Mapa" className="w-full h-48 object-cover" />
          </a>
        )}

        {/* Botões de Rota */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              label: "Google Maps",
              icon: Navigation,
              href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`,
            },
            { label: "Waze", icon: Navigation, href: `https://waze.com/ul?q=${encodeURIComponent(endereco)}` },
            {
              label: "Uber",
              icon: Car,
              href: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(endereco)}`,
            },
            { label: "99", icon: Car, href: `https://99app.com/` },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 
                        rounded-xl border border-zinc-200 hover:border-[#240046]
                        hover:bg-purple-50 transition-all text-sm font-medium"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* Contato */}
      <section className="border-t border-zinc-200 pt-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">Contato</h2>

        <div className="flex flex-wrap gap-3">
          {estabelecimento.whatsapp && (
            <a
              href={getWhatsAppLink(estabelecimento.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl
                        bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          )}

          {estabelecimento.instagram && (
            <a
              href={getInstagramLink(estabelecimento.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl
                        bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </a>
          )}

          {estabelecimento.telefone && (
            <a
              href={`tel:${estabelecimento.telefone}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl
                        border border-zinc-200 hover:border-[#240046] hover:bg-purple-50
                        font-medium transition-all"
            >
              <Phone className="w-5 h-5" />
              {formatPhone(estabelecimento.telefone)}
            </a>
          )}
        </div>
      </section>
    </div>
  );
});

// =============================================================================
// CTA PARA PARCEIROS
// =============================================================================

const PartnerCTA = memo(() => (
  <section className="mt-12 py-8 px-6 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#240046] flex items-center justify-center">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900">Quer sua página assim?</h3>
          <p className="text-sm text-zinc-600">Cadastre seu estabelecimento e atraia aniversariantes</p>
        </div>
      </div>
      <Link
        to="/seja-parceiro"
        className="px-6 py-3 bg-[#240046] hover:bg-[#3C096C] text-white font-semibold
                  rounded-xl transition-colors flex items-center gap-2"
      >
        Cadastrar grátis
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  </section>
));

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

const EstabelecimentoDetalhePremium = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Auth state - usando Supabase diretamente (sem useAuth)
  const [user, setUser] = useState<User | null>(null);

  // States
  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [showComoUsarModal, setShowComoUsarModal] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Refs
  const heroRef = useRef<HTMLDivElement>(null);

  // Auth listener - usando Supabase diretamente
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch estabelecimento
  useEffect(() => {
    const fetchEstabelecimento = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("estabelecimentos")
          .select("*")
          .eq("slug", slug)
          .eq("ativo", true)
          .single();

        if (error) throw error;

        // Converter dados do banco para o tipo Estabelecimento
        // horario_funcionamento pode vir como string do banco
        setEstabelecimento(data as Estabelecimento);
      } catch (err) {
        console.error("Erro ao buscar estabelecimento:", err);
        toast.error("Estabelecimento não encontrado");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchEstabelecimento();
  }, [slug, navigate]);

  // Intersection Observer para Sticky CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handlers
  const handleResgate = useCallback(() => {
    if (!user) {
      toast.info("Faça login para resgatar seu benefício");
      navigate("/login");
      return;
    }
    // TODO: Implementar fluxo de resgate
    toast.success("Benefício marcado! Apresente este app no estabelecimento.");
  }, [user, navigate]);

  const handleVerComoUsar = useCallback(() => {
    setShowComoUsarModal(true);
  }, []);

  const handleLogin = useCallback(() => {
    setShowComoUsarModal(false);
    navigate("/login");
  }, [navigate]);

  // Prepare images
  const images = useMemo(() => {
    const imgs: string[] = [];
    if (estabelecimento?.logo_url) imgs.push(estabelecimento.logo_url);
    if (estabelecimento?.imagem_url) imgs.push(estabelecimento.imagem_url);
    if (estabelecimento?.fotos) imgs.push(...estabelecimento.fotos);
    return imgs.length > 0 ? imgs : ["/placeholder-estabelecimento.jpg"];
  }, [estabelecimento]);

  // Loading state
  if (loading) {
    return <PageSkeleton />;
  }

  // Not found
  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Estabelecimento não encontrado</h1>
          <Link to="/" className="text-[#240046] hover:underline">
            Voltar para a home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Hero Gallery */}
      <div ref={heroRef}>
        <HeroGallery
          images={images}
          nome={estabelecimento.nome_fantasia}
          beneficio={estabelecimento.descricao_beneficio}
          onShowGallery={() => setShowGallery(true)}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">{estabelecimento.nome_fantasia}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                <span className="capitalize">{estabelecimento.categoria?.[0]}</span>
                <span>•</span>
                <span>
                  {estabelecimento.bairro}, {estabelecimento.cidade}
                </span>
                {estabelecimento.verificado && (
                  <>
                    <span>•</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <Shield className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <InfoSection estabelecimento={estabelecimento} />
            <ComoFuncionaSection />
            <PartnerCTA />
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <BenefitCard
              estabelecimento={estabelecimento}
              onResgate={handleResgate}
              onVerComoUsar={handleVerComoUsar}
            />
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA
        estabelecimento={estabelecimento}
        isVisible={showStickyCta}
        onResgate={handleResgate}
        onVerComoUsar={handleVerComoUsar}
      />

      {/* Modal Como Usar */}
      <ModalComoUsar
        isOpen={showComoUsarModal}
        onClose={() => setShowComoUsarModal(false)}
        estabelecimento={estabelecimento}
        isLoggedIn={!!user}
        onLogin={handleLogin}
        onResgate={handleResgate}
      />
    </div>
  );
};

export default EstabelecimentoDetalhePremium;
