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
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { TelaConfirmacaoEmail } from "@/components/TelaConfirmacaoEmail";
import { validateCNPJ, formatCNPJ, fetchCNPJData } from "@/lib/validators";
import { useCepLookup } from "@/hooks/useCepLookup";
import { useLogradouroExtractor } from "@/hooks/useLogradouroExtractor";
import { getFriendlyErrorMessage } from "@/lib/errorTranslator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { normalizarCidade } from "@/lib/utils";
import EspecialidadesSelector from "@/components/EspecialidadesSelector";

// Função para padronizar texto usando Lovable AI
const standardizeTextWithAI = async (text: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("standardize-text", {
      body: { text },
    });

    if (error) {
      console.error("Erro ao padronizar texto:", error);

      // Tratamento específico para rate limit e payment
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições excedido. Tente novamente em alguns segundos.");
      } else if (error.message?.includes("402")) {
        toast.error("Serviço temporariamente indisponível. Entre em contato com o suporte.");
      } else {
        toast.error("Erro ao corrigir texto. Tente novamente.");
      }

      return text; // Retorna texto original em caso de erro
    }

    if (!data?.correctedText) {
      toast.error("Resposta inválida da correção");
      return text;
    }

    return data.correctedText;
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    toast.error("Erro ao conectar com o serviço de correção");
    return text;
  }
};

const formatPhone = (phone) => {
  const raw = phone.replace(/\D/g, "").substring(0, 11);
  if (raw.length === 11) {
    // Celular/WhatsApp
    return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (raw.length === 10) {
    // Fixo
    return raw.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
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
          index + 1 === currentStep ? "w-8 bg-[#7C3AED]" : "w-4 bg-white/20"
        }`}
      />
    ))}
  </div>
);

const BenefitRulesSection = ({ rules, setRules }) => {
  const [showHelper, setShowHelper] = useState(false);
  const [isStandardizing, setIsStandardizing] = useState(false);
  const MAX_CHARS = 200;

  const handleTextChange = (e) => {
    const text = e.target.value.substring(0, MAX_CHARS);
    setRules((prev) => ({ ...prev, description: text }));
  };

  const handleStandardize = async () => {
    if (!rules.description.trim()) {
      toast.error("Digite um texto antes de corrigir");
      return;
    }

    setIsStandardizing(true);

    try {
      const correctedText = await standardizeTextWithAI(rules.description);
      setRules((prev) => ({ ...prev, description: correctedText }));
      toast.success("Texto corrigido com sucesso!");
    } catch (error) {
      console.error("Erro ao padronizar:", error);
      toast.error("Erro ao corrigir texto");
    } finally {
      setIsStandardizing(false);
    }
  };

  const setScope = (scope) => {
    setRules((prev) => ({ ...prev, scope }));
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
          className="w-full p-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none text-slate-900 bg-white"
        />
        <div className="absolute bottom-2 right-3 text-xs text-slate-500">
          {rules.description.length} / {MAX_CHARS}
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          onClick={handleStandardize}
          disabled={isStandardizing || !rules.description.trim()}
          className="px-3 py-1 bg-violet-200 text-violet-700 rounded-full hover:bg-violet-300 transition-colors flex items-center gap-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStandardizing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Corrigindo...
            </>
          ) : (
            <>
              <CheckCircle size={14} /> Corrigir/Padronizar Texto
            </>
          )}
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
          {["Dia", "Semana", "Mês"].map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setScope(scope)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                rules.scope === scope
                  ? "bg-[#7C3AED] text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-violet-100"
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
    segunda: { aberto: true, inicio: "00:00", fim: "00:00" },
    terca: { aberto: true, inicio: "00:00", fim: "00:00" },
    quarta: { aberto: true, inicio: "00:00", fim: "00:00" },
    quinta: { aberto: true, inicio: "00:00", fim: "00:00" },
    sexta: { aberto: true, inicio: "00:00", fim: "00:00" },
    sabado: { aberto: true, inicio: "00:00", fim: "00:00" },
    domingo: { aberto: false, inicio: "00:00", fim: "00:00" },
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    categories: [],
    especialidades: [] as string[],
    menuLink: "",
    siteLink: "",
    instagramUser: "",
    phoneFixed: "",
    phoneWhatsapp: "",
    slogan: "",
    mainPhotoUrl: "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)",
    hoursText: "Seg-Sáb: 10h às 22h, Dom: Fechado",
  });
  const [rules, setRules] = useState({ description: "", scope: "Dia" });
  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjVerified, setCnpjVerified] = useState(false);
  const [error, setError] = useState("");

  const { fetchCep: lookupCep } = useCepLookup();
  const { extractLogradouro, validateLogradouro } = useLogradouroExtractor();

  // Detectar retorno do Google OAuth
  useEffect(() => {
    const checkGoogleReturn = async () => {
      const stepFromUrl = searchParams.get("step");
      const providerFromUrl = searchParams.get("provider");

      if (stepFromUrl === "2" && providerFromUrl === "google") {
        console.log("=== ETAPA 2 GOOGLE RETURN ===");
        console.log("Iniciando etapa 2...");

        setStep(2);
        setIsGoogleUser(true);
        setError("");
        setCnpjVerified(false);
        setLoading(false); // GARANTIR FALSE

        console.log("Loading definido como FALSE");

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setAuthData((prev) => ({
            ...prev,
            email: user.email || "",
          }));
          console.log("Email do usuário:", user.email);
        }

        console.log("Estado loading após setup:", loading);
      }
    };

    checkGoogleReturn();
  }, [searchParams]);

  // --- LÓGICA DE APIs E VALIDAÇÃO ---

  const handleCnpjChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setEstablishmentData((prev) => ({ ...prev, cnpj: formatted }));
    setCnpjVerified(false); // Reset verificação ao alterar
  };

  const formatarTelefone = (telefone: string): string => {
    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    return telefone;
  };

  // Processar imagem de forma tolerante (aceita qualquer foto)
  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            // Se canvas não funcionar, retorna arquivo original
            console.log("Canvas não disponível, usando imagem original");
            resolve(file);
            return;
          }

          // Tamanho quadrado 400x400 com boa qualidade
          const size = 400;
          canvas.width = size;
          canvas.height = size;

          // Fundo branco (para PNGs transparentes)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, size, size);

          // Calcular crop centralizado para ficar quadrado
          const minDimension = Math.min(img.width, img.height);
          const sx = (img.width - minDimension) / 2;
          const sy = (img.height - minDimension) / 2;

          // Desenhar imagem redimensionada
          ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                // Fallback: retorna arquivo original
                console.log("Erro ao gerar blob, usando original");
                resolve(file);
              }
            },
            "image/jpeg",
            0.85,
          );
        } catch (err) {
          // Qualquer erro: retorna arquivo original
          console.log("Erro no processamento, usando original:", err);
          resolve(file);
        }
      };

      img.onerror = () => {
        // Se não conseguir carregar, rejeita com mensagem amigável
        console.log("Erro ao carregar imagem");
        reject(new Error("Não foi possível carregar a imagem. Tente outra foto."));
      };

      // Criar URL para a imagem
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aceitar QUALQUER arquivo de imagem
    const isImage =
      file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|heic|heif|tiff|svg)$/i.test(file.name);

    if (!isImage) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    // Limite generoso de 25MB
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 25MB.");
      return;
    }

    setUploadingImage(true);

    try {
      // Processar imagem
      const processedBlob = await processImage(file);

      // Criar preview
      const previewUrl = URL.createObjectURL(processedBlob);
      setImagePreview(previewUrl);

      // Criar arquivo processado
      const processedFile = new File([processedBlob], `foto_${Date.now()}.jpg`, { type: "image/jpeg" });
      setSelectedImage(processedFile);

      // Upload para Supabase Storage
      const fileName = `estabelecimento_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage.from("establishment-photos").upload(fileName, processedFile, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        console.error("Erro no upload:", error);
        toast.error("Erro ao enviar foto. Tente novamente.");
        setUploadingImage(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("establishment-photos").getPublicUrl(fileName);

      setEstablishmentData((prev) => ({ ...prev, mainPhotoUrl: publicUrl }));
      toast.success("Foto adicionada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      toast.error(error.message || "Erro ao processar foto. Tente outra imagem.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    setImagePreview(null);
    setSelectedImage(null);
    setEstablishmentData((prev) => ({
      ...prev,
      mainPhotoUrl: "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)",
    }));
    const input = document.getElementById("foto-input") as HTMLInputElement;
    if (input) input.value = "";
    toast.success("Foto removida");
  };

  const verifyCnpj = async () => {
    const rawCnpj = establishmentData.cnpj.replace(/\D/g, "");

    // Early return se vazio
    if (rawCnpj.length === 0) {
      return;
    }

    // Validar tamanho
    if (rawCnpj.length < 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return;
    }

    // Validar dígitos verificadores
    if (!validateCNPJ(rawCnpj)) {
      toast.error("CNPJ inválido. Verifique os dígitos verificadores.");
      return;
    }

    setLoadingCnpj(true);
    setError("");

    try {
      // Verificar se CNPJ já existe no banco
      const { data: cnpjExistente } = await supabase
        .from("estabelecimentos")
        .select("id, nome_fantasia")
        .eq("cnpj", rawCnpj)
        .maybeSingle();

      if (cnpjExistente) {
        toast.error("Este CNPJ já está cadastrado na plataforma.");
        setLoadingCnpj(false);
        setCnpjVerified(false);
        return;
      }

      // Buscar dados na BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("CNPJ não encontrado na Receita Federal. Verifique o número.");
        } else if (response.status === 429) {
          toast.error("Muitas consultas. Aguarde um momento e tente novamente.");
        } else {
          toast.error("Erro ao consultar CNPJ. Tente novamente.");
        }
        setLoadingCnpj(false);
        setCnpjVerified(false);
        return;
      }

      const data = await response.json();

      // Verificar situação cadastral
      if (data.descricao_situacao_cadastral && data.descricao_situacao_cadastral !== "ATIVA") {
        toast.warning(
          `Atenção: Este CNPJ está com situação "${data.descricao_situacao_cadastral}" na Receita Federal.`,
        );
      }

      // Extrair e validar logradouro automaticamente da BrasilAPI
      const logradouroExtraido = extractLogradouro(data.logradouro || "");
      const validacaoLogradouro = logradouroExtraido ? validateLogradouro(logradouroExtraido) : null;

      // Preencher campos automaticamente (apenas se estiverem vazios)
      setEstablishmentData((prev) => ({
        ...prev,
        name: prev.name || data.nome_fantasia || data.razao_social || "",
        phoneFixed: prev.phoneFixed || (data.ddd_telefone_1 ? formatarTelefone(data.ddd_telefone_1) : ""),
        cep: prev.cep || (data.cep ? data.cep.replace(/\D/g, "") : ""),
        estado: prev.estado || data.uf || "",
        cidade: prev.cidade || data.municipio || "",
        bairro: prev.bairro || data.bairro || "",
        logradouro: prev.logradouro || (validacaoLogradouro?.valid ? logradouroExtraido : data.logradouro) || "",
        numero: prev.numero || data.numero || "",
        complemento: prev.complemento || data.complemento || "",
      }));

      if (validacaoLogradouro?.valid) {
        console.log("✅ Logradouro extraído e validado via CNPJ:", logradouroExtraido);
      }

      setCnpjVerified(true);
      toast.success("CNPJ verificado! Dados preenchidos automaticamente.");
    } catch (error: any) {
      console.error("Erro ao verificar CNPJ:", error);

      // Mostrar mensagem amigável
      if (
        error.message &&
        !error.message.includes("fetch") &&
        !error.message.includes("network") &&
        !error.message.includes("Failed")
      ) {
        toast.error(error.message);
      } else {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      }

      setCnpjVerified(false);
    } finally {
      setLoadingCnpj(false);
    }
  };

  const fetchCep = async (cepValue) => {
    const rawCep = cepValue.replace(/\D/g, "").substring(0, 8);
    setEstablishmentData((prev) => ({ ...prev, cep: rawCep }));

    if (rawCep.length !== 8) return;

    setLoading(true);

    try {
      const data = await lookupCep(rawCep);

      if (data) {
        // Extrair e validar logradouro automaticamente
        const logradouroExtraido = extractLogradouro(data.logradouro || "");
        const validacao = logradouroExtraido ? validateLogradouro(logradouroExtraido) : null;

        setEstablishmentData((prev) => ({
          ...prev,
          logradouro: validacao?.valid ? logradouroExtraido : data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));

        if (validacao?.valid) {
          console.log("✅ Logradouro validado e populado:", logradouroExtraido);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setEstablishmentData((prev) => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter((c) => c !== category) };
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
      sessionStorage.setItem("authType", "estabelecimento");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Erro Google OAuth:", error);
        toast.error("Erro ao conectar com Google");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao conectar com Google");
    }
  };

  const validatePassword = (password: string) => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const allRequirementsMet =
      passwordRequirements.minLength && passwordRequirements.hasUppercase && passwordRequirements.hasSpecialChar;

    if (!authData.email || !authData.password) {
      setError("Preencha email e senha.");
      return;
    }

    if (!allRequirementsMet) {
      setError("A senha não atende aos requisitos mínimos.");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const rawCnpj = establishmentData.cnpj.replace(/\D/g, "");
    const isPhoneFilled = establishmentData.phoneFixed || establishmentData.phoneWhatsapp;

    // Validar foto obrigatória
    if (
      !selectedImage &&
      !imagePreview &&
      establishmentData.mainPhotoUrl === "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)"
    ) {
      setError("Adicione uma foto do estabelecimento");
      toast.error("Adicione uma foto do estabelecimento");
      return;
    }

    // Validar CNPJ verificado
    if (!cnpjVerified) {
      setError('CNPJ deve ser verificado antes de continuar. Clique em "Verificar".');
      toast.error("CNPJ deve ser verificado antes de continuar.");
      return;
    }

    if (
      rawCnpj.length !== 14 ||
      !establishmentData.logradouro ||
      !establishmentData.cidade ||
      establishmentData.categories.length === 0
    ) {
      setError("Por favor, preencha todos os campos obrigatórios: CNPJ, Endereço e Categoria.");
      return;
    }

    if (!isPhoneFilled) {
      setError("Pelo menos um número de contato (Fixo ou WhatsApp) é obrigatório.");
      return;
    }

    if (!establishmentData.name || establishmentData.name.trim().length < 2) {
      setError("Nome do estabelecimento obrigatório");
      toast.error("Nome do estabelecimento obrigatório");
      return;
    }

    setLoading(true);

    try {
      if (isGoogleUser) {
        // Usuário Google: já tem conta no Auth, só criar estabelecimento
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Sessão não encontrada");
        }

        // Verificar CNPJ duplicado
        const { data: cnpjExistente } = await supabase
          .from("estabelecimentos")
          .select("cnpj")
          .eq("cnpj", rawCnpj)
          .maybeSingle();

        if (cnpjExistente) {
          toast.error("Este CNPJ já está cadastrado");
          return;
        }

        // Criar estabelecimento
        const { error: estabError } = await supabase.from("estabelecimentos").insert({
          id: user.id, // Vincular estabelecimento ao usuário autenticado
          cnpj: rawCnpj,
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
          descricao_beneficio: rules.description || null,
          periodo_validade_beneficio:
            rules.scope === "Dia"
              ? "dia_aniversario"
              : rules.scope === "Semana"
                ? "semana_aniversario"
                : "mes_aniversario",
          horario_funcionamento: establishmentData.hoursText || null,
          logo_url:
            establishmentData.mainPhotoUrl !== "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)"
              ? establishmentData.mainPhotoUrl
              : null,
          link_cardapio: establishmentData.menuLink || null,
          ativo: false,
        });

        if (estabError) throw estabError;

        // Criar role de estabelecimento
        await supabase.from("user_roles").upsert(
          {
            user_id: user.id,
            role: "estabelecimento",
          },
          { onConflict: "user_id,role" },
        );

        toast.success("Estabelecimento cadastrado com sucesso!");
        navigate("/area-estabelecimento");
      } else {
        // Usuário email/senha: criar conta completa
        await criarContaEstabelecimentoCompleta();
      }
    } catch (error: any) {
      console.error("Erro:", error);

      // Não mostrar erro se é apenas requisição de confirmação de email
      if (error.message === "CONFIRMATION_REQUIRED") {
        return;
      }

      const friendlyError = getFriendlyErrorMessage(error);
      toast.error(friendlyError);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const criarContaEstabelecimentoCompleta = async () => {
    const rawCnpj = establishmentData.cnpj.replace(/\D/g, "");

    // Verificar CNPJ duplicado
    const { data: cnpjExistente } = await supabase
      .from("estabelecimentos")
      .select("cnpj")
      .eq("cnpj", rawCnpj)
      .maybeSingle();

    if (cnpjExistente) {
      toast.error("Este CNPJ já está cadastrado");
      throw new Error("CNPJ duplicado");
    }

    // 1. Criar usuário no Auth com confirmação de email
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: authData.email,
      password: authData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          tipo: "estabelecimento",
          nome_fantasia: establishmentData.name,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        toast.error("Este email já está cadastrado");
      }
      throw authError;
    }

    if (!signUpData.user) {
      throw new Error("Erro ao criar conta");
    }

    // Se não tem sessão, precisa confirmar email
    if (signUpData.user && !signUpData.session) {
      toast.success("Cadastro iniciado!");
      setEmailParaConfirmar(authData.email);
      setMostrarTelaConfirmacao(true);
      setLoading(false);
      throw new Error("CONFIRMATION_REQUIRED"); // Interromper fluxo para mostrar tela
    }

    // Se tem sessão (auto-confirmação ativa), continua o cadastro
    // 2. Criar estabelecimento
    const { error: estabError } = await supabase.from("estabelecimentos").insert({
      id: signUpData.user.id, // Vincular estabelecimento ao usuário autenticado
      cnpj: rawCnpj,
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
      especialidades: establishmentData.especialidades.length > 0 ? establishmentData.especialidades : null,
      descricao_beneficio: rules.description || null,
      periodo_validade_beneficio:
        rules.scope === "Dia" ? "dia_aniversario" : rules.scope === "Semana" ? "semana_aniversario" : "mes_aniversario",
      horario_funcionamento: establishmentData.hoursText || null,
      logo_url:
        establishmentData.mainPhotoUrl !== "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)"
          ? establishmentData.mainPhotoUrl
          : null,
      link_cardapio: establishmentData.menuLink || null,
      ativo: false,
    });

    if (estabError) throw estabError;

    // 3. Criar role
    await supabase.from("user_roles").insert({
      user_id: signUpData.user.id,
      role: "estabelecimento",
    });

    toast.success("Estabelecimento cadastrado! Aguarde aprovação.");
    navigate("/area-estabelecimento");
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
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png"
          alt="Google Logo"
          className="w-5 h-5"
        />
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
            onChange={(e) => setAuthData((prev) => ({ ...prev, email: e.target.value }))}
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
            onChange={(e) => {
              const newPassword = e.target.value;
              setAuthData((prev) => ({ ...prev, password: newPassword }));
              validatePassword(newPassword);
            }}
            className="w-full pl-10 pr-4 py-3 border border-white/10 bg-white/5 text-white placeholder-slate-600 rounded-xl focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all"
            required
          />
        </div>

        {/* Password Requirements */}
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-slate-400 font-medium">A senha deve conter:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {passwordRequirements.minLength ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
              )}
              <span className={passwordRequirements.minLength ? "text-emerald-400" : "text-slate-500"}>
                Mínimo 8 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRequirements.hasUppercase ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
              )}
              <span className={passwordRequirements.hasUppercase ? "text-emerald-400" : "text-slate-500"}>
                Uma letra maiúscula
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRequirements.hasSpecialChar ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
              )}
              <span className={passwordRequirements.hasSpecialChar ? "text-emerald-400" : "text-slate-500"}>
                Um caractere especial (!@#$%...)
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">{error}</div>
      )}

      <button
        type="submit"
        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
      >
        Próxima Etapa <ArrowRight size={20} />
      </button>
    </form>
  );

  const renderStep2 = () => {
    // DEBUG TEMPORÁRIO
    console.log("=== RENDERIZANDO ETAPA 2 ===");
    console.log("loading:", loading);
    console.log("step:", step);
    console.log("isGoogleUser:", isGoogleUser);
    console.log("error:", error);
    console.log("establishmentData:", establishmentData);

    return (
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
            <p className="text-violet-700 text-sm font-medium">✓ Você está cadastrando com sua conta Google</p>
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
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <Building2 size={20} /> Informações Básicas
          </h3>

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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
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
                className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loadingCnpj ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </>
                ) : cnpjVerified ? (
                  <>
                    <Check className="w-4 h-4" />
                    Verificado
                  </>
                ) : (
                  "Verificar"
                )}
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
              onChange={(e) => setEstablishmentData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
              placeholder="Nome do seu estabelecimento"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Slogan/Descrição Curta (Máx. 50 Caracteres)
            </span>
            <input
              type="text"
              value={establishmentData.slogan}
              onChange={(e) => setEstablishmentData((prev) => ({ ...prev, slogan: e.target.value.substring(0, 50) }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
              placeholder="Ex: O melhor açaí da cidade!"
            />
          </label>
        </div>

        {/* 2. CONTATO E REDES SOCIAIS */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <Phone size={20} /> Contato e Redes
          </h3>
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
                onChange={(e) =>
                  setEstablishmentData((prev) => ({ ...prev, phoneFixed: e.target.value.replace(/\D/g, "") }))
                }
                maxLength={14}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
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
                onChange={(e) =>
                  setEstablishmentData((prev) => ({ ...prev, phoneWhatsapp: e.target.value.replace(/\D/g, "") }))
                }
                maxLength={15}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
                placeholder="(XX) 9XXXX-XXXX"
              />
            </div>
          </label>

          <hr className="border-slate-100 my-4" />

          {/* Site/Website */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Website Principal (Opcional - Exibido na Info)
            </span>
            <div className="relative">
              <Globe size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={establishmentData.siteLink}
                onChange={(e) => setEstablishmentData((prev) => ({ ...prev, siteLink: e.target.value }))}
                onBlur={(e) => {
                  // Adiciona https:// automaticamente se não tiver protocolo
                  const value = e.target.value.trim();
                  if (value && !value.startsWith("http://") && !value.startsWith("https://")) {
                    setEstablishmentData((prev) => ({ ...prev, siteLink: `https://${value}` }));
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
                placeholder="www.suaempresa.com.br"
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
                onChange={(e) =>
                  setEstablishmentData((prev) => ({ ...prev, instagramUser: e.target.value.replace("@", "") }))
                }
                className="w-full pl-16 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
                placeholder="seuusuário"
              />
            </div>
          </label>
        </div>

        {/* 3. Endereço */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <MapPin size={20} /> Endereço
          </h3>

          {/* CEP Input */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">CEP *</span>
            <input
              type="text"
              value={establishmentData.cep}
              onChange={(e) => fetchCep(e.target.value)}
              maxLength={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
              placeholder="00000000"
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
                onChange={(e) => setEstablishmentData((prev) => ({ ...prev, estado: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
                required
              />
            </label>
            <label className="col-span-2 md:col-span-1">
              <span className="text-sm font-medium text-slate-700 mb-1 block">Cidade *</span>
              <input
                type="text"
                value={establishmentData.cidade}
                onChange={(e) => setEstablishmentData((prev) => ({ ...prev, cidade: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Bairro *</span>
            <input
              type="text"
              value={establishmentData.bairro}
              onChange={(e) => setEstablishmentData((prev) => ({ ...prev, bairro: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Rua/Avenida *</span>
            <input
              type="text"
              value={establishmentData.logradouro}
              onChange={(e) => setEstablishmentData((prev) => ({ ...prev, logradouro: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
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
                onChange={(e) =>
                  setEstablishmentData((prev) => ({ ...prev, numero: e.target.value.replace(/\D/g, "") }))
                }
                disabled={establishmentData.semNumero}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none disabled:bg-slate-100 text-slate-900"
                required={!establishmentData.semNumero}
              />
            </label>
            <button
              type="button"
              onClick={() => setEstablishmentData((prev) => ({ ...prev, semNumero: !prev.semNumero, numero: "" }))}
              className={`py-3 px-4 rounded-xl font-semibold transition-colors ${
                establishmentData.semNumero
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                onChange={(e) => setEstablishmentData((prev) => ({ ...prev, complemento: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
              />
            </label>

            <div className="col-span-2 md:col-span-1 flex items-end">
              <button
                type="button"
                onClick={() => setEstablishmentData((prev) => ({ ...prev, isMall: !prev.isMall }))}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                  establishmentData.isMall
                    ? "bg-[#7C3AED] text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <ShoppingBag size={20} /> Localizado em Shopping?
              </button>
            </div>
          </div>
        </div>

        {/* 4. Categorias e Links */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <MapPin size={20} /> Categorias e Links
          </h3>

          {/* Seleção de Categoria */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Categoria (Selecione até 3) *</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    establishmentData.categories.includes(cat.value)
                      ? "bg-[#7C3AED] text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-violet-100"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            {establishmentData.categories.length === 3 && (
              <p className="mt-2 text-xs text-slate-500">Máximo de 3 categorias selecionadas.</p>
            )}
          </label>

          {/* Especialidades */}
          <div className="space-y-2">
            <EspecialidadesSelector
              categoria={establishmentData.categories[0] || ""}
              selected={establishmentData.especialidades}
              onChange={(especialidades) => setEstablishmentData((prev) => ({ ...prev, especialidades }))}
              maxSelection={3}
            />
          </div>

          {/* Link Cardápio Digital */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Link do Cardápio Digital (Opcional - Exibido no Card)
            </span>
            <div className="relative">
              <Link size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={establishmentData.menuLink}
                onChange={(e) => setEstablishmentData((prev) => ({ ...prev, menuLink: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-violet-500 outline-none text-slate-900"
                placeholder="https://linkdocardapio.com.br"
              />
              <p className="mt-1 text-xs text-slate-500">
                Este link é acessível diretamente pelo cliente no Card principal.
              </p>
            </div>
          </label>
        </div>

        {/* 5. Imagem e Horário */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 space-y-4">
          <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <Image size={20} /> Imagem e Horário
          </h3>

          {/* Horário de Funcionamento */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Horário de Funcionamento</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 font-medium flex items-center gap-2">
                <Clock size={18} /> {establishmentData.hoursText}
              </div>
              <button
                type="button"
                onClick={() => setShowHorarioModal(true)}
                className="px-4 py-3 bg-slate-100 text-violet-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} /> Editar
              </button>
            </div>
          </label>

          {/* Foto Principal */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700 block">Foto do Estabelecimento *</span>

            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
              {/* Preview da Foto */}
              <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300 mb-3">
                {uploadingImage ? (
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Processando...</p>
                  </div>
                ) : imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : establishmentData.mainPhotoUrl !==
                  "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)" ? (
                  <img src={establishmentData.mainPhotoUrl} alt="Foto atual" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">Nenhuma foto selecionada</p>
                    <p className="text-slate-400 text-xs mt-1">Clique abaixo para adicionar</p>
                  </div>
                )}
              </div>

              <input id="foto-input" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

              {/* Botões de Ação */}
              <div className="flex gap-2">
                {imagePreview ||
                establishmentData.mainPhotoUrl !==
                  "https://placehold.co/800x450/4C74B5/ffffff?text=FOTO+PADRÃO+(16:9)" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => document.getElementById("foto-input")?.click()}
                      disabled={uploadingImage}
                      className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={18} /> Alterar Foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingImage}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 size={18} /> Excluir Foto
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById("foto-input")?.click()}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Camera size={18} /> Adicionar Foto
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 text-center mt-2">
                Aceita qualquer imagem (JPG, PNG, GIF, WEBP, etc) até 25MB
              </p>
            </div>
          </div>
        </div>

        {/* 6. Regras de Benefício */}
        <BenefitRulesSection rules={rules} setRules={setRules} />

        {/* Botão Final */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
  };

  // --- LAYOUT ---

  // Se está mostrando tela de confirmação de email, exibir componente dedicado
  if (mostrarTelaConfirmacao) {
    return (
      <TelaConfirmacaoEmail
        email={emailParaConfirmar}
        onVoltar={() => {
          setMostrarTelaConfirmacao(false);
          setEmailParaConfirmar("");
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl">
        <div className="mb-6">
          <BackButton to="/seja-parceiro" />
        </div>
        <Stepper currentStep={step} totalSteps={2} />

        {step === 1 ? renderStep1() : renderStep2()}
      </div>

      {/* Modal de Horário de Funcionamento */}
      {showHorarioModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Horário de Funcionamento</h2>
              <button onClick={() => setShowHorarioModal(false)} className="text-slate-400 hover:text-slate-900">
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
                <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={horarioTemp[key].aberto}
                    onChange={(e) =>
                      setHorarioTemp((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], aberto: e.target.checked },
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-slate-900 text-sm w-20 font-medium">{label}</span>

                  {horarioTemp[key].aberto ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={horarioTemp[key].inicio}
                        onChange={(e) =>
                          setHorarioTemp((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], inicio: e.target.value },
                          }))
                        }
                        className="px-2 py-1 border border-slate-300 rounded-lg w-24 text-sm text-slate-900 bg-white"
                      />
                      <span className="text-slate-500 text-sm">às</span>
                      <input
                        type="time"
                        value={horarioTemp[key].fim}
                        onChange={(e) =>
                          setHorarioTemp((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], fim: e.target.value },
                          }))
                        }
                        className="px-2 py-1 border border-slate-300 rounded-lg w-24 text-sm text-slate-900 bg-white"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">Fechado</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHorarioModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const formatado = Object.entries(horarioTemp)
                    .map(([dia, info]) => {
                      const abrev = {
                        segunda: "Seg",
                        terca: "Ter",
                        quarta: "Qua",
                        quinta: "Qui",
                        sexta: "Sex",
                        sabado: "Sáb",
                        domingo: "Dom",
                      }[dia];
                      return info.aberto ? `${abrev}: ${info.inicio}-${info.fim}` : `${abrev}: Fechado`;
                    })
                    .join(", ");
                  setEstablishmentData((prev) => ({ ...prev, hoursText: formatado }));
                  setShowHorarioModal(false);
                  toast.success("Horário salvo!");
                }}
                className="flex-1 px-4 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold transition-colors"
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
