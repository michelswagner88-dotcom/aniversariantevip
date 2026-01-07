// =============================================================================
// CADASTRO ESTABELECIMENTO - V3.0 COMPLETO
// CORREÇÕES IMPLEMENTADAS:
// - P0.2: Upload múltiplas fotos (1-10) com preview, capa, reordenar, excluir
// - P0.2: Pipeline 3 variações (thumb/card/gallery) em WEBP
// - P0.3: Chips "Tipo de Benefício" obrigatório
// - P0.4: CNPJ não preenche nome (mostra hint apenas)
// - P1.1: Spellcheck nos campos texto
// - Tema claro (branco + roxo)
// =============================================================================

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Instagram,
  Loader2,
  Check,
  X,
  Camera,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Gift,
  Percent,
  Sparkles,
  Award,
  AlertCircle,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { TelaConfirmacaoEmail } from "@/components/TelaConfirmacaoEmail";
import { validateCNPJ, formatCNPJ } from "@/lib/validators";
import { useCepLookup } from "@/hooks/useCepLookup";
import { useLogradouroExtractor } from "@/hooks/useLogradouroExtractor";
import { getFriendlyErrorMessage } from "@/lib/errorTranslator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { normalizarCidade } from "@/lib/utils";
import EspecialidadesSelector from "@/components/EspecialidadesSelector";

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

interface PhotoUrls {
  thumb: string;
  card: string;
  gallery: string;
}

interface PhotoItem {
  id: string;
  file?: File;
  urls: PhotoUrls;
  isCover: boolean;
  order: number;
  uploading?: boolean;
  error?: string;
}

type TipoBeneficio = "cortesia" | "brinde" | "desconto" | "bonus" | "gratis";

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const TIPOS_BENEFICIO = [
  { id: "cortesia" as TipoBeneficio, label: "Cortesia", emoji: "🎁" },
  { id: "brinde" as TipoBeneficio, label: "Brinde", emoji: "🎀" },
  { id: "desconto" as TipoBeneficio, label: "Desconto", emoji: "💰" },
  { id: "bonus" as TipoBeneficio, label: "Bônus", emoji: "⭐" },
  { id: "gratis" as TipoBeneficio, label: "Grátis", emoji: "🆓" },
];

// =============================================================================
// HELPERS
// =============================================================================

const standardizeTextWithAI = async (text: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("standardize-text", { body: { text } });
    if (error) {
      if (error.message?.includes("429")) toast.error("Limite de requisições. Tente novamente.");
      else if (error.message?.includes("402")) toast.error("Serviço indisponível.");
      else toast.error("Erro ao corrigir texto.");
      return text;
    }
    return data?.correctedText || text;
  } catch {
    toast.error("Erro ao conectar com o serviço");
    return text;
  }
};

const formatPhone = (phone: string): string => {
  const raw = phone.replace(/\D/g, "").substring(0, 11);
  if (raw.length === 11) return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (raw.length === 10) return raw.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return raw;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const processImageToSizes = (file: File): Promise<{ thumb: Blob; card: Blob; gallery: Blob }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const createBlob = (targetWidth: number, quality: number): Promise<Blob> => {
        return new Promise((res, rej) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            rej(new Error("Canvas não disponível"));
            return;
          }

          const ratio = img.height / img.width;
          let width = Math.min(img.width, targetWidth);
          let height = width * ratio;
          if (img.height > img.width) {
            height = Math.min(img.height, targetWidth);
            width = height / ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) =>
              blob ? res(blob) : canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha"))), "image/jpeg", quality),
            "image/webp",
            quality,
          );
        });
      };
      Promise.all([createBlob(360, 0.75), createBlob(900, 0.82), createBlob(1600, 0.85)])
        .then(([thumb, card, gallery]) => resolve({ thumb, card, gallery }))
        .catch(reject);
    };
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    img.src = URL.createObjectURL(file);
  });
};

const uploadToStorage = async (blob: Blob, folder: string, fileName: string): Promise<string> => {
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${fileName}.${ext}`;
  const { error } = await supabase.storage
    .from("establishment-photos")
    .upload(path, blob, { cacheControl: "31536000", upsert: true });
  if (error) throw error;
  return supabase.storage.from("establishment-photos").getPublicUrl(path).data.publicUrl;
};

// =============================================================================
// COMPONENTS
// =============================================================================

const Stepper = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-2 rounded-full transition-all",
          i + 1 === currentStep ? "w-8 bg-violet-600" : i + 1 < currentStep ? "w-4 bg-violet-400" : "w-4 bg-zinc-200",
        )}
      />
    ))}
  </div>
);

const BenefitTypeChips = ({
  selected,
  onChange,
  error,
}: {
  selected: TipoBeneficio | null;
  onChange: (t: TipoBeneficio) => void;
  error?: boolean;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-violet-800 flex items-center gap-2">
        <Gift size={18} /> Tipo de Benefício <span className="text-red-500">*</span>
      </label>
      {error && (
        <span className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} /> Selecione um tipo
        </span>
      )}
    </div>
    <div className="flex flex-wrap gap-2">
      {TIPOS_BENEFICIO.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          aria-pressed={selected === t.id}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 min-h-[44px] border-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50",
            selected === t.id
              ? "bg-violet-600 text-white border-violet-600 shadow-md"
              : "bg-white text-zinc-700 border-zinc-200 hover:border-violet-300 hover:bg-violet-50",
            error && selected !== t.id && "border-red-300",
          )}
        >
          <span className="text-lg">{t.emoji}</span>
          <span>{t.label}</span>
          {selected === t.id && <Check size={16} className="ml-1" />}
        </button>
      ))}
    </div>
  </div>
);

const BenefitRulesSection = ({
  rules,
  setRules,
  tipoBeneficio,
  setTipoBeneficio,
  tipoBeneficioError,
}: {
  rules: { description: string; scope: string };
  setRules: React.Dispatch<React.SetStateAction<{ description: string; scope: string }>>;
  tipoBeneficio: TipoBeneficio | null;
  setTipoBeneficio: (t: TipoBeneficio) => void;
  tipoBeneficioError: boolean;
}) => {
  const [showHelper, setShowHelper] = useState(false);
  const [isStandardizing, setIsStandardizing] = useState(false);

  const handleStandardize = async () => {
    if (!rules.description.trim()) {
      toast.error("Digite um texto");
      return;
    }
    setIsStandardizing(true);
    const corrected = await standardizeTextWithAI(rules.description);
    setRules((p) => ({ ...p, description: corrected }));
    toast.success("Texto corrigido!");
    setIsStandardizing(false);
  };

  return (
    <div className="border border-violet-200 bg-violet-50 p-5 rounded-xl space-y-4">
      <h3 className="text-lg font-bold text-violet-800 flex items-center gap-2">
        <Ruler size={20} /> Regras de Benefício
      </h3>
      <div className="relative">
        <textarea
          value={rules.description}
          onChange={(e) => setRules((p) => ({ ...p, description: e.target.value.substring(0, 200) }))}
          placeholder="Ex: 10% de desconto em qualquer produto..."
          rows={4}
          spellCheck={true}
          autoCorrect="on"
          autoCapitalize="sentences"
          className="w-full p-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none text-zinc-900 bg-white placeholder:text-zinc-400"
        />
        <div className="absolute bottom-2 right-3 text-xs text-zinc-500">{rules.description.length}/200</div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          onClick={handleStandardize}
          disabled={isStandardizing || !rules.description.trim()}
          className="px-3 py-1.5 rounded-full bg-violet-200 text-violet-700 hover:bg-violet-300 flex items-center gap-1.5 font-semibold disabled:opacity-50"
        >
          {isStandardizing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Corrigindo...
            </>
          ) : (
            <>
              <CheckCircle size={14} /> Corrigir Texto
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowHelper(!showHelper)}
          className="text-zinc-500 hover:text-violet-600 flex items-center gap-1"
        >
          <Info size={16} /> Ajuda
        </button>
      </div>
      {showHelper && (
        <p className="text-xs text-violet-700 bg-white p-2 rounded-lg border border-violet-200">
          Use o botão para padronizar o texto.
        </p>
      )}
      <div className="pt-3 border-t border-violet-200">
        <BenefitTypeChips selected={tipoBeneficio} onChange={setTipoBeneficio} error={tipoBeneficioError} />
      </div>
      <div className="pt-3 border-t border-violet-200">
        <label className="block text-sm font-semibold text-violet-800 mb-2">Validade do Benefício</label>
        <div className="flex gap-2">
          {["Dia", "Semana", "Mês"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRules((p) => ({ ...p, scope: s }))}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-semibold transition-all min-h-[44px]",
                rules.scope === s
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-white text-zinc-600 hover:bg-violet-100 border border-zinc-200",
              )}
            >
              <Calendar size={16} className="inline mr-1.5" />
              {s === "Dia" ? "Dia do Aniv." : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PhotoGalleryUpload = ({
  photos,
  setPhotos,
  establishmentId,
  error,
}: {
  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  establishmentId?: string;
  error?: boolean;
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos`);
      return;
    }

    for (const file of Array.from(files).slice(0, slots)) {
      if (!file.type.startsWith("image/") && !/\.(jpg|jpeg|png|gif|webp|heic)$/i.test(file.name)) {
        toast.error(`${file.name} inválido`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} > 25MB`);
        continue;
      }

      const id = generateId();
      const isFirst = photos.length === 0;
      setPhotos((p) => [
        ...p,
        { id, file, urls: { thumb: "", card: "", gallery: "" }, isCover: isFirst, order: p.length, uploading: true },
      ]);

      try {
        const processed = await processImageToSizes(file);
        const folder = establishmentId || `temp_${Date.now()}`;
        const [thumb, card, gallery] = await Promise.all([
          uploadToStorage(processed.thumb, folder, `${id}_thumb`),
          uploadToStorage(processed.card, folder, `${id}_card`),
          uploadToStorage(processed.gallery, folder, `${id}_gallery`),
        ]);
        setPhotos((p) => p.map((x) => (x.id === id ? { ...x, urls: { thumb, card, gallery }, uploading: false } : x)));
        toast.success("Foto adicionada!");
      } catch (e: any) {
        setPhotos((p) => p.map((x) => (x.id === id ? { ...x, uploading: false, error: e.message } : x)));
        toast.error(`Erro: ${file.name}`);
      }
    }
  };

  const remove = (id: string) => {
    setPhotos((p) => {
      const f = p.filter((x) => x.id !== id);
      if (f.length && !f.some((x) => x.isCover)) f[0].isCover = true;
      return f.map((x, i) => ({ ...x, order: i }));
    });
    toast.success("Removida");
  };

  const setCover = (id: string) => {
    setPhotos((p) => p.map((x) => ({ ...x, isCover: x.id === id })));
    toast.success("Capa definida!");
  };
  const moveUp = (i: number) => {
    if (i === 0) return;
    setPhotos((p) => {
      const n = [...p];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n.map((x, j) => ({ ...x, order: j }));
    });
  };
  const moveDown = (i: number) => {
    if (i === photos.length - 1) return;
    setPhotos((p) => {
      const n = [...p];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      return n.map((x, j) => ({ ...x, order: j }));
    });
  };
  const preview = (p: PhotoItem) => p.urls.thumb || (p.file ? URL.createObjectURL(p.file) : "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
          <Camera size={18} /> Fotos <span className="text-red-500">*</span>{" "}
          <span className="text-zinc-400">
            ({photos.length}/{MAX_PHOTOS})
          </span>
        </label>
        {error && photos.length === 0 && (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} /> Mínimo 1 foto
          </span>
        )}
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2",
                p.isCover ? "border-violet-500 ring-2 ring-violet-500/30" : "border-zinc-200",
                p.error && "border-red-400",
              )}
            >
              {p.uploading ? (
                <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
              ) : p.error ? (
                <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-2">
                  <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
                  <span className="text-xs text-red-600 text-center">{p.error}</span>
                </div>
              ) : (
                <img src={preview(p)} alt="" className="w-full h-full object-cover" />
              )}
              {p.isCover && !p.uploading && !p.error && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  CAPA
                </div>
              )}
              {!p.uploading && !p.error && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!p.isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(p.id)}
                        className="px-2 py-1 bg-white/90 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-white"
                      >
                        <Star size={12} />
                        Capa
                      </button>
                    )}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="p-1.5 bg-white/90 rounded-lg disabled:opacity-40"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(i)}
                        disabled={i === photos.length - 1}
                        className="p-1.5 bg-white/90 rounded-lg disabled:opacity-40"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {photos.length < MAX_PHOTOS && (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors",
            dragOver
              ? "border-violet-500 bg-violet-50"
              : error && !photos.length
                ? "border-red-300 bg-red-50"
                : "border-zinc-300 bg-zinc-50 hover:border-violet-400",
          )}
        >
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-violet-600" />
          </div>
          <p className="text-sm font-medium text-zinc-700">
            Arraste ou{" "}
            <label className="text-violet-600 cursor-pointer hover:underline">
              clique
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-zinc-500">JPG, PNG, WEBP até 25MB • Máx {MAX_PHOTOS}</p>
        </div>
      )}
      <p className="text-xs text-zinc-500 flex items-center gap-1">
        <Info size={12} /> Primeira foto = capa. Altere clicando em "Capa".
      </p>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EstablishmentRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasSpecialChar: false,
  });
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [mostrarTelaConfirmacao, setMostrarTelaConfirmacao] = useState(false);
  const [emailParaConfirmar, setEmailParaConfirmar] = useState("");
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [horarioTemp, setHorarioTemp] = useState({
    segunda: { aberto: true, inicio: "09:00", fim: "18:00" },
    terca: { aberto: true, inicio: "09:00", fim: "18:00" },
    quarta: { aberto: true, inicio: "09:00", fim: "18:00" },
    quinta: { aberto: true, inicio: "09:00", fim: "18:00" },
    sexta: { aberto: true, inicio: "09:00", fim: "18:00" },
    sabado: { aberto: true, inicio: "09:00", fim: "14:00" },
    domingo: { aberto: false, inicio: "00:00", fim: "00:00" },
  });

  // FOTOS: Array ao invés de única (P0.2)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photosError, setPhotosError] = useState(false);

  // TIPO BENEFÍCIO (P0.3)
  const [tipoBeneficio, setTipoBeneficio] = useState<TipoBeneficio | null>(null);
  const [tipoBeneficioError, setTipoBeneficioError] = useState(false);

  // CNPJ HINT (P0.4)
  const [cnpjRazaoSocial, setCnpjRazaoSocial] = useState<string | null>(null);

  const [establishmentData, setEstablishmentData] = useState({
    cnpj: "",
    name: "",
    cep: "",
    logradouro: "",
    numero: "",
    semNumero: false,
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    isMall: false,
    categories: [] as string[],
    especialidades: [] as string[],
    menuLink: "",
    siteLink: "",
    instagramUser: "",
    phoneFixed: "",
    phoneWhatsapp: "",
    slogan: "",
    hoursText: "Seg-Sex: 09h-18h, Sáb: 09h-14h, Dom: Fechado",
  });
  const [rules, setRules] = useState({ description: "", scope: "Dia" });
  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjVerified, setCnpjVerified] = useState(false);
  const [error, setError] = useState("");

  const { fetchCep: lookupCep } = useCepLookup();
  const { extractLogradouro, validateLogradouro } = useLogradouroExtractor();

  // Google OAuth return
  useEffect(() => {
    const check = async () => {
      if (searchParams.get("step") === "2" && searchParams.get("provider") === "google") {
        setStep(2);
        setIsGoogleUser(true);
        setError("");
        setCnpjVerified(false);
        setLoading(false);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setAuthData((p) => ({ ...p, email: user.email || "" }));
      }
    };
    check();
  }, [searchParams]);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstablishmentData((p) => ({ ...p, cnpj: formatCNPJ(e.target.value) }));
    setCnpjVerified(false);
    setCnpjRazaoSocial(null);
  };

  // P0.4: Verificar CNPJ mas NÃO preencher nome
  const verifyCnpj = async () => {
    const raw = establishmentData.cnpj.replace(/\D/g, "");
    if (raw.length < 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return;
    }
    if (!validateCNPJ(raw)) {
      toast.error("CNPJ inválido");
      return;
    }

    setLoadingCnpj(true);
    setError("");

    try {
      const { data: existe } = await supabase.from("estabelecimentos").select("id").eq("cnpj", raw).maybeSingle();
      if (existe) {
        toast.error("CNPJ já cadastrado");
        setLoadingCnpj(false);
        return;
      }

      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!res.ok) {
        toast.error(res.status === 404 ? "CNPJ não encontrado" : "Erro ao consultar");
        setLoadingCnpj(false);
        return;
      }

      const data = await res.json();
      if (data.descricao_situacao_cadastral && data.descricao_situacao_cadastral !== "ATIVA") {
        toast.warning(`Situação: ${data.descricao_situacao_cadastral}`);
      }

      const logExtraido = extractLogradouro(data.logradouro || "");
      const validacao = logExtraido ? validateLogradouro(logExtraido) : null;

      // P0.4: NÃO preencher name, apenas mostrar hint
      setCnpjRazaoSocial(data.nome_fantasia || data.razao_social || null);

      setEstablishmentData((p) => ({
        ...p,
        // name: NÃO PREENCHER (P0.4)
        phoneFixed: p.phoneFixed || (data.ddd_telefone_1 ? formatPhone(data.ddd_telefone_1) : ""),
        cep: p.cep || data.cep?.replace(/\D/g, "") || "",
        estado: p.estado || data.uf || "",
        cidade: p.cidade || data.municipio || "",
        bairro: p.bairro || data.bairro || "",
        logradouro: p.logradouro || (validacao?.valid ? logExtraido : data.logradouro) || "",
        numero: p.numero || data.numero || "",
        complemento: p.complemento || data.complemento || "",
      }));

      setCnpjVerified(true);
      toast.success("CNPJ verificado!");
    } catch (e: any) {
      toast.error("Erro de conexão");
      setCnpjVerified(false);
    } finally {
      setLoadingCnpj(false);
    }
  };

  const fetchCep = async (cep: string) => {
    const raw = cep.replace(/\D/g, "").substring(0, 8);
    setEstablishmentData((p) => ({ ...p, cep: raw }));
    if (raw.length !== 8) return;
    setLoading(true);
    try {
      const data = await lookupCep(raw);
      if (data) {
        const log = extractLogradouro(data.logradouro || "");
        const v = log ? validateLogradouro(log) : null;
        setEstablishmentData((p) => ({
          ...p,
          logradouro: v?.valid ? log : data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (cat: string) => {
    setEstablishmentData((p) => {
      if (p.categories.includes(cat)) return { ...p, categories: p.categories.filter((c) => c !== cat) };
      if (p.categories.length < 3) return { ...p, categories: [...p.categories, cat] };
      return p;
    });
  };

  const handleGoogleSignUp = async () => {
    // Passar tipo via URL param (persiste durante redirect OAuth)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?type=estabelecimento`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) toast.error("Erro Google");
  };

  const validatePassword = (pw: string) => {
    setPasswordRequirements({
      minLength: pw.length >= 8,
      hasUppercase: /[A-Z]/.test(pw),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    });
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData.email || !authData.password) {
      setError("Preencha email e senha");
      return;
    }
    if (!passwordRequirements.minLength || !passwordRequirements.hasUppercase || !passwordRequirements.hasSpecialChar) {
      setError("Senha não atende requisitos");
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhotosError(false);
    setTipoBeneficioError(false);

    const raw = establishmentData.cnpj.replace(/\D/g, "");
    const hasPhone = establishmentData.phoneFixed || establishmentData.phoneWhatsapp;

    // Validações
    if (photos.length === 0) {
      setPhotosError(true);
      toast.error("Adicione pelo menos 1 foto");
      return;
    }
    if (!tipoBeneficio) {
      setTipoBeneficioError(true);
      toast.error("Selecione o tipo de benefício");
      return;
    }
    if (!cnpjVerified) {
      toast.error("Verifique o CNPJ");
      return;
    }
    if (
      raw.length !== 14 ||
      !establishmentData.logradouro ||
      !establishmentData.cidade ||
      !establishmentData.categories.length
    ) {
      setError("Preencha campos obrigatórios");
      return;
    }
    if (!hasPhone) {
      setError("Informe pelo menos um telefone");
      return;
    }
    if (!establishmentData.name?.trim()) {
      toast.error("Nome obrigatório");
      return;
    }

    setLoading(true);

    try {
      const coverPhoto = photos.find((p) => p.isCover) || photos[0];
      const photosData = photos.map((p) => ({ id: p.id, order: p.order, isCover: p.isCover, urls: p.urls }));

      if (isGoogleUser) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão não encontrada");

        const { error: estabError } = await supabase.from("estabelecimentos").insert({
          id: user.id,
          cnpj: raw,
          razao_social: establishmentData.name,
          nome_fantasia: establishmentData.name,
          telefone: establishmentData.phoneFixed?.replace(/\D/g, "") || null,
          whatsapp: establishmentData.phoneWhatsapp?.replace(/\D/g, "") || null,
          instagram: establishmentData.instagramUser || null,
          site: establishmentData.siteLink || null,
          cep: establishmentData.cep || null,
          estado: establishmentData.estado || null,
          cidade: normalizarCidade(establishmentData.cidade || ""),
          bairro: establishmentData.bairro || null,
          logradouro: establishmentData.logradouro || null,
          numero: establishmentData.numero || null,
          complemento: establishmentData.complemento || null,
          categoria: establishmentData.categories,
          especialidades: establishmentData.especialidades.length ? establishmentData.especialidades : null,
          descricao_beneficio: rules.description || null,
          tipo_beneficio: tipoBeneficio,
          periodo_validade_beneficio:
            rules.scope === "Dia"
              ? "dia_aniversario"
              : rules.scope === "Semana"
                ? "semana_aniversario"
                : "mes_aniversario",
          horario_funcionamento: establishmentData.hoursText || null,
          logo_url: coverPhoto?.urls.card || null,
          fotos: photosData,
          link_cardapio: establishmentData.menuLink || null,
          ativo: false,
          cadastro_completo: true,
        } as any);

        if (estabError) throw estabError;
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role: "estabelecimento" }, { onConflict: "user_id,role" });
        toast.success("Cadastrado com sucesso!");
        navigate("/area-estabelecimento");
      } else {
        await criarContaCompleta(raw, coverPhoto, photosData);
      }
    } catch (e: any) {
      if (e.message === "CONFIRMATION_REQUIRED") return;
      toast.error(getFriendlyErrorMessage(e));
      setError(getFriendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const criarContaCompleta = async (raw: string, coverPhoto: PhotoItem | undefined, photosData: any[]) => {
    const { data: existe } = await supabase.from("estabelecimentos").select("cnpj").eq("cnpj", raw).maybeSingle();
    if (existe) {
      toast.error("CNPJ já cadastrado");
      throw new Error("CNPJ duplicado");
    }

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: authData.email,
      password: authData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { tipo: "estabelecimento", nome_fantasia: establishmentData.name },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) toast.error("Email já cadastrado");
      throw authError;
    }
    if (!signUpData.user) throw new Error("Erro ao criar conta");

    if (!signUpData.session) {
      toast.success("Cadastro iniciado!");
      setEmailParaConfirmar(authData.email);
      setMostrarTelaConfirmacao(true);
      setLoading(false);
      throw new Error("CONFIRMATION_REQUIRED");
    }

    const { error: estabError } = await supabase.from("estabelecimentos").insert({
      id: signUpData.user.id,
      cnpj: raw,
      razao_social: establishmentData.name,
      nome_fantasia: establishmentData.name,
      telefone: establishmentData.phoneFixed?.replace(/\D/g, "") || null,
      whatsapp: establishmentData.phoneWhatsapp?.replace(/\D/g, "") || null,
      instagram: establishmentData.instagramUser || null,
      site: establishmentData.siteLink || null,
      cep: establishmentData.cep || null,
      estado: establishmentData.estado || null,
      cidade: normalizarCidade(establishmentData.cidade || ""),
      bairro: establishmentData.bairro || null,
      logradouro: establishmentData.logradouro || null,
      numero: establishmentData.numero || null,
      complemento: establishmentData.complemento || null,
      categoria: establishmentData.categories,
      especialidades: establishmentData.especialidades.length ? establishmentData.especialidades : null,
      descricao_beneficio: rules.description || null,
      tipo_beneficio: tipoBeneficio,
      periodo_validade_beneficio:
        rules.scope === "Dia" ? "dia_aniversario" : rules.scope === "Semana" ? "semana_aniversario" : "mes_aniversario",
      horario_funcionamento: establishmentData.hoursText || null,
      logo_url: coverPhoto?.urls.card || null,
      fotos: photosData,
      link_cardapio: establishmentData.menuLink || null,
      ativo: true,
      cadastro_completo: true,
    } as any);

    if (estabError) throw estabError;
    await supabase.from("user_roles").insert({ user_id: signUpData.user.id, role: "estabelecimento" });
    toast.success("Cadastrado com sucesso! Seu estabelecimento já está visível.");
    navigate("/area-estabelecimento");
  };

  // =============================================================================
  // RENDER STEP 1 (Tema Claro)
  // =============================================================================

  const renderStep1 = () => (
    <form onSubmit={handleAuthSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 text-center">Cadastre seu estabelecimento</h2>
      <p className="text-zinc-500 text-center">Crie suas credenciais e complete os dados da sua empresa.</p>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl flex items-center justify-center gap-3 font-semibold hover:bg-zinc-50 transition-colors shadow-sm"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png"
          alt="Google"
          className="w-5 h-5"
        />
        Continuar com Google
      </button>

      <div className="flex items-center">
        <hr className="flex-1 border-zinc-200" />
        <span className="px-3 text-zinc-400 text-sm">OU</span>
        <hr className="flex-1 border-zinc-200" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail</label>
        <div className="relative">
          <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="email"
            value={authData.email}
            onChange={(e) => setAuthData((p) => ({ ...p, email: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Senha</label>
        <div className="relative">
          <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="password"
            value={authData.password}
            onChange={(e) => {
              setAuthData((p) => ({ ...p, password: e.target.value }));
              validatePassword(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none"
            required
          />
        </div>
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-zinc-500 font-medium">A senha deve conter:</p>
          {[
            { key: "minLength", label: "Mínimo 8 caracteres" },
            { key: "hasUppercase", label: "Uma letra maiúscula" },
            { key: "hasSpecialChar", label: "Um caractere especial" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              {passwordRequirements[key as keyof typeof passwordRequirements] ? (
                <CheckCircle size={16} className="text-emerald-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />
              )}
              <span
                className={
                  passwordRequirements[key as keyof typeof passwordRequirements] ? "text-emerald-600" : "text-zinc-500"
                }
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <button
        type="submit"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25"
      >
        Próxima Etapa <ArrowRight size={20} />
      </button>
    </form>
  );

  // =============================================================================
  // RENDER STEP 2 (Tema Claro)
  // =============================================================================

  const renderStep2 = () => (
    <form onSubmit={handleFinalSubmit} className="space-y-8">
      <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-zinc-500 hover:text-violet-600 flex items-center gap-1"
        >
          <ChevronLeft size={20} /> Voltar
        </button>
        <h2 className="text-2xl font-bold text-zinc-900">Dados do Estabelecimento</h2>
      </div>

      {isGoogleUser && authData.email && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <p className="text-violet-700 text-sm font-medium">✓ Cadastrando com Google</p>
          <div className="mt-2 bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700">
            {authData.email}
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* SEÇÃO 1: CNPJ e Nome */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <Building2 size={20} /> Informações Básicas
        </h3>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">CNPJ *</span>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={establishmentData.cnpj}
                onChange={handleCnpjChange}
                maxLength={18}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-zinc-900"
                placeholder="00.000.000/0000-00"
                required
              />
              {cnpjVerified && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              )}
            </div>
            <button
              type="button"
              onClick={verifyCnpj}
              disabled={loadingCnpj || establishmentData.cnpj.replace(/\D/g, "").length !== 14}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loadingCnpj ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : cnpjVerified ? (
                <>
                  <Check className="w-4 h-4" />
                  OK
                </>
              ) : (
                "Verificar"
              )}
            </button>
          </div>
          {/* P0.4: Hint da razão social (NÃO preenche o input) */}
          {cnpjRazaoSocial && (
            <p className="mt-2 text-sm text-violet-600 bg-violet-50 px-3 py-2 rounded-lg flex items-center gap-2">
              <Info size={16} /> Razão social encontrada: <strong>{cnpjRazaoSocial}</strong>
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">
            Nome do Estabelecimento * <span className="text-zinc-400 font-normal">(nome fantasia)</span>
          </span>
          <input
            type="text"
            value={establishmentData.name}
            onChange={(e) => setEstablishmentData((p) => ({ ...p, name: e.target.value }))}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="words"
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-zinc-900"
            placeholder="Como seu estabelecimento é conhecido"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">Slogan/Descrição Curta (máx. 50)</span>
          <input
            type="text"
            value={establishmentData.slogan}
            onChange={(e) => setEstablishmentData((p) => ({ ...p, slogan: e.target.value.substring(0, 50) }))}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-zinc-900"
            placeholder="Ex: O melhor açaí da cidade!"
          />
        </label>
      </div>

      {/* SEÇÃO 2: Contato */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <Phone size={20} /> Contato e Redes
        </h3>
        <p className="text-sm text-zinc-500 flex items-center gap-1">
          <Info size={16} className="text-violet-500" /> Pelo menos um telefone obrigatório.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Telefone Fixo</span>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={formatPhone(establishmentData.phoneFixed)}
                onChange={(e) => setEstablishmentData((p) => ({ ...p, phoneFixed: e.target.value.replace(/\D/g, "") }))}
                maxLength={14}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
                placeholder="(XX) XXXX-XXXX"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 mb-1 block">WhatsApp</span>
            <div className="relative">
              <MessageSquare size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={formatPhone(establishmentData.phoneWhatsapp)}
                onChange={(e) =>
                  setEstablishmentData((p) => ({ ...p, phoneWhatsapp: e.target.value.replace(/\D/g, "") }))
                }
                maxLength={15}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
                placeholder="(XX) 9XXXX-XXXX"
              />
            </div>
          </label>
        </div>

        <hr className="border-zinc-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Website</span>
            <div className="relative">
              <Globe size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={establishmentData.siteLink}
                onChange={(e) => setEstablishmentData((p) => ({ ...p, siteLink: e.target.value }))}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && !v.startsWith("http")) setEstablishmentData((p) => ({ ...p, siteLink: `https://${v}` }));
                }}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
                placeholder="www.site.com.br"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Instagram</span>
            <div className="relative">
              <Instagram size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
              <input
                type="text"
                value={establishmentData.instagramUser}
                onChange={(e) =>
                  setEstablishmentData((p) => ({ ...p, instagramUser: e.target.value.replace("@", "") }))
                }
                className="w-full pl-16 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
                placeholder="seuusuario"
              />
            </div>
          </label>
        </div>
      </div>

      {/* SEÇÃO 3: Endereço */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <MapPin size={20} /> Endereço
        </h3>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">CEP *</span>
          <input
            type="text"
            value={establishmentData.cep}
            onChange={(e) => fetchCep(e.target.value)}
            maxLength={8}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
            placeholder="00000000"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label>
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Estado *</span>
            <input
              type="text"
              value={establishmentData.estado}
              onChange={(e) => setEstablishmentData((p) => ({ ...p, estado: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
              required
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Cidade *</span>
            <input
              type="text"
              value={establishmentData.cidade}
              onChange={(e) => setEstablishmentData((p) => ({ ...p, cidade: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">Bairro *</span>
          <input
            type="text"
            value={establishmentData.bairro}
            onChange={(e) => setEstablishmentData((p) => ({ ...p, bairro: e.target.value }))}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">Rua/Avenida *</span>
          <input
            type="text"
            value={establishmentData.logradouro}
            onChange={(e) => setEstablishmentData((p) => ({ ...p, logradouro: e.target.value }))}
            spellCheck={true}
            autoCorrect="on"
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
            required
          />
        </label>

        <div className="flex gap-4 items-end">
          <label className="flex-1">
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Número *</span>
            <input
              type="text"
              value={establishmentData.numero}
              onChange={(e) => setEstablishmentData((p) => ({ ...p, numero: e.target.value.replace(/\D/g, "") }))}
              disabled={establishmentData.semNumero}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none disabled:bg-zinc-100 text-zinc-900"
              required={!establishmentData.semNumero}
            />
          </label>
          <button
            type="button"
            onClick={() => setEstablishmentData((p) => ({ ...p, semNumero: !p.semNumero, numero: "" }))}
            className={cn(
              "py-3 px-4 rounded-xl font-semibold transition-colors min-h-[48px]",
              establishmentData.semNumero ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
            )}
          >
            Sem Número
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <span className="text-sm font-medium text-zinc-700 mb-1 block">Complemento</span>
            <input
              type="text"
              value={establishmentData.complemento}
              onChange={(e) => setEstablishmentData((p) => ({ ...p, complemento: e.target.value }))}
              spellCheck={true}
              autoCorrect="on"
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setEstablishmentData((p) => ({ ...p, isMall: !p.isMall }))}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 min-h-[48px]",
                establishmentData.isMall
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
              )}
            >
              <ShoppingBag size={20} /> Em Shopping?
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: Categorias */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <MapPin size={20} /> Categorias e Links
        </h3>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">Categoria (até 3) *</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryToggle(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-colors min-h-[44px]",
                  establishmentData.categories.includes(cat.value)
                    ? "bg-violet-600 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-700 hover:bg-violet-100",
                )}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </label>

        <EspecialidadesSelector
          categoria={establishmentData.categories[0] || ""}
          selected={establishmentData.especialidades}
          onChange={(esp) => setEstablishmentData((p) => ({ ...p, especialidades: esp }))}
          maxSelection={3}
        />

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">Link do Cardápio Digital</span>
          <div className="relative">
            <Link size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="url"
              value={establishmentData.menuLink}
              onChange={(e) => setEstablishmentData((p) => ({ ...p, menuLink: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-zinc-900"
              placeholder="https://cardapio.com"
            />
          </div>
        </label>
      </div>

      {/* SEÇÃO 5: Fotos e Horário */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <Image size={20} /> Fotos e Horário
        </h3>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700 mb-1 block">Horário de Funcionamento</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 border border-zinc-200 bg-zinc-50 rounded-xl text-zinc-600 font-medium flex items-center gap-2">
              <Clock size={18} /> {establishmentData.hoursText}
            </div>
            <button
              type="button"
              onClick={() => setShowHorarioModal(true)}
              className="px-4 py-3 bg-zinc-100 text-violet-600 rounded-xl font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} /> Editar
            </button>
          </div>
        </label>

        {/* UPLOAD MÚLTIPLAS FOTOS (P0.2) */}
        <PhotoGalleryUpload photos={photos} setPhotos={setPhotos} error={photosError} />
      </div>

      {/* SEÇÃO 6: Regras de Benefício + Tipo (P0.3) */}
      <BenefitRulesSection
        rules={rules}
        setRules={setRules}
        tipoBeneficio={tipoBeneficio}
        setTipoBeneficio={setTipoBeneficio}
        tipoBeneficioError={tipoBeneficioError}
      />

      {/* BOTÃO FINAL */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xl shadow-lg shadow-violet-600/25 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Finalizando...
          </>
        ) : (
          <>
            Finalizar Cadastro <ChevronRight size={24} />
          </>
        )}
      </button>
    </form>
  );

  // =============================================================================
  // LAYOUT PRINCIPAL (Tema Claro)
  // =============================================================================

  if (mostrarTelaConfirmacao) {
    return (
      <TelaConfirmacaoEmail
        email={emailParaConfirmar}
        onVoltar={() => {
          setMostrarTelaConfirmacao(false);
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200/80 p-6 sm:p-10 rounded-3xl shadow-xl shadow-zinc-200/50">
        <div className="mb-6">
          <BackButton to="/seja-parceiro" />
        </div>
        <Stepper currentStep={step} totalSteps={2} />
        {step === 1 ? renderStep1() : renderStep2()}
      </div>

      {/* MODAL HORÁRIO */}
      {showHorarioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Horário de Funcionamento</h2>
              <button onClick={() => setShowHorarioModal(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: "segunda", label: "Segunda" },
                { key: "terca", label: "Terça" },
                { key: "quarta", label: "Quarta" },
                { key: "quinta", label: "Quinta" },
                { key: "sexta", label: "Sexta" },
                { key: "sabado", label: "Sábado" },
                { key: "domingo", label: "Domingo" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={(horarioTemp as any)[key].aberto}
                    onChange={(e) =>
                      setHorarioTemp((p) => ({ ...p, [key]: { ...(p as any)[key], aberto: e.target.checked } }))
                    }
                    className="w-4 h-4 accent-violet-600"
                  />
                  <span className="text-zinc-900 text-sm w-20 font-medium">{label}</span>
                  {(horarioTemp as any)[key].aberto ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={(horarioTemp as any)[key].inicio}
                        onChange={(e) =>
                          setHorarioTemp((p) => ({ ...p, [key]: { ...(p as any)[key], inicio: e.target.value } }))
                        }
                        className="px-2 py-1 border border-zinc-300 rounded-lg w-24 text-sm text-zinc-900 bg-white"
                      />
                      <span className="text-zinc-500 text-sm">às</span>
                      <input
                        type="time"
                        value={(horarioTemp as any)[key].fim}
                        onChange={(e) =>
                          setHorarioTemp((p) => ({ ...p, [key]: { ...(p as any)[key], fim: e.target.value } }))
                        }
                        className="px-2 py-1 border border-zinc-300 rounded-lg w-24 text-sm text-zinc-900 bg-white"
                      />
                    </div>
                  ) : (
                    <span className="text-zinc-400 text-sm">Fechado</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHorarioModal(false)}
                className="flex-1 px-4 py-3 border border-zinc-300 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const fmt = Object.entries(horarioTemp)
                    .map(([d, i]) => {
                      const ab = {
                        segunda: "Seg",
                        terca: "Ter",
                        quarta: "Qua",
                        quinta: "Qui",
                        sexta: "Sex",
                        sabado: "Sáb",
                        domingo: "Dom",
                      }[d];
                      return (i as any).aberto ? `${ab}: ${(i as any).inicio}-${(i as any).fim}` : `${ab}: Fechado`;
                    })
                    .join(", ");
                  setEstablishmentData((p) => ({ ...p, hoursText: fmt }));
                  setShowHorarioModal(false);
                  toast.success("Horário salvo!");
                }}
                className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
