import { useState, useEffect, useRef, useCallback, useMemo, memo, useId } from "react";
import { Search, MapPin, Mic, MicOff, Gift, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCidadesAutocomplete } from "@/hooks/useCidadesAutocomplete";
import { cn } from "@/lib/utils";

// =============================================================================
// WEB SPEECH API TYPES
// =============================================================================

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventCustom extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventCustom) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const PLACEHOLDERS = [
  "Digite o nome de um restaurante...",
  "Busque por um bar ou pub...",
  "Encontre sua academia...",
  "Procure um salão de beleza...",
  "Busque uma loja...",
  "Digite o nome do estabelecimento...",
];

const PLACEHOLDER_INTERVAL_MS = 3500;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 2;
const SEARCH_LIMIT = 8;
const SEARCH_LIMIT_BRASIL = 5;
const HAPTIC_LIGHT = 10;
const HAPTIC_MEDIUM: number[] = [10, 30, 10];

// =============================================================================
// TYPES
// =============================================================================

interface HeroSectionProps {
  cidade?: string;
  estado?: string;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onBuscaChange: (termo: string) => void;
  onBuscar: () => void;
}

interface EstabelecimentoSugestao {
  id: string;
  nome_fantasia: string;
  categoria: string[] | string;
  cidade: string;
  estado: string;
  slug: string;
  foraDaCidade?: boolean;
}

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useClickOutside = (ref: React.RefObject<HTMLElement | null>, callback: () => void) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
};

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEventCustom) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript("");
  }, []);

  return { isListening, isSupported, transcript, toggle, reset };
};

const useEstabelecimentosSearch = (cidade?: string, estado?: string) => {
  const [results, setResults] = useState<EstabelecimentoSugestao[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (termo: string) => {
      if (!termo || termo.length < SEARCH_MIN_CHARS) {
        setResults([]);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        let query = supabase
          .from("estabelecimentos")
          .select("id, nome_fantasia, categoria, cidade, estado, slug")
          .eq("ativo", true)
          .ilike("nome_fantasia", `%${termo}%`)
          .limit(SEARCH_LIMIT);

        if (cidade && estado) {
          query = query.ilike("cidade", cidade).ilike("estado", estado);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          console.error("[HeroSection] Erro ao buscar:", supabaseError);
          setError("Erro ao buscar estabelecimentos");
          setResults([]);
          return;
        }

        if (data && data.length > 0) {
          setResults(data);
        } else if (cidade && estado) {
          const { data: dataBrasil } = await supabase
            .from("estabelecimentos")
            .select("id, nome_fantasia, categoria, cidade, estado, slug")
            .eq("ativo", true)
            .ilike("nome_fantasia", `%${termo}%`)
            .limit(SEARCH_LIMIT_BRASIL);

          if (dataBrasil && dataBrasil.length > 0) {
            setResults(dataBrasil.map((e) => ({ ...e, foraDaCidade: true })));
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("[HeroSection] Erro:", err);
        setError("Erro ao buscar estabelecimentos");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [cidade, estado],
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isSearching, error, search, clear };
};

// =============================================================================
// UTILS
// =============================================================================

const haptic = (pattern: number | number[] = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

//
