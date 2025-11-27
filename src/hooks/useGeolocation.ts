import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  cidade: string;
  estado: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface CachedLocation extends Location {
  timestamp: number;
}

type GeolocationStep = 
  | 'idle'
  | 'requesting_permission'
  | 'getting_coordinates'
  | 'geocoding'
  | 'success'
  | 'error';

// Supabase URL para chamar Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Cache expira após 7 dias
const CACHE_EXPIRY_DAYS = 7;
const CACHE_EXPIRY_MS = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GeolocationStep>('idle');
  const [cachedLocation, setCachedLocation] = useState<CachedLocation | null>(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const { toast } = useToast();

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      console.log('📍 Coordenadas obtidas:', { latitude, longitude });
      console.log('🌐 Chamando Edge Function para geocoding reverso...');
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/reverse-geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro no geocoding: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Resposta do geocoding:', data);
      
      const { cidade, estado } = data;
      
      if (!cidade || !estado) {
        throw new Error('Não foi possível extrair cidade/estado dos resultados');
      }
      
      console.log('✅ Localização identificada:', { cidade, estado });
      
      const locationData = {
        cidade,
        estado,
        coordinates: { latitude, longitude }
      };
      
      saveLocationToCache(locationData);
      setLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('❌ Erro ao fazer geocoding reverso:', err);
      throw err;
    }
  };

  const saveLocationToCache = (locationData: Location) => {
    const cachedData: CachedLocation = {
      ...locationData,
      timestamp: Date.now()
    };
    localStorage.setItem('user_location', JSON.stringify(cachedData));
  };

  const loadCachedLocation = (): CachedLocation | null => {
    try {
      const cached = localStorage.getItem('user_location');
      if (!cached) return null;

      const data: CachedLocation = JSON.parse(cached);
      
      // Verificar se o cache expirou
      const now = Date.now();
      if (now - data.timestamp > CACHE_EXPIRY_MS) {
        localStorage.removeItem('user_location');
        return null;
      }

      return data;
    } catch {
      return null;
    }
  };

  const confirmCachedLocation = () => {
    if (cachedLocation) {
      setLocation({
        cidade: cachedLocation.cidade,
        estado: cachedLocation.estado,
        coordinates: cachedLocation.coordinates
      });
      setLoading(false);
      setShowLocationConfirm(false);
      // Marcar como confirmado nesta sessão
      sessionStorage.setItem('location_confirmed_session', 'true');
      toast({
        title: "Localização confirmada!",
        description: `${cachedLocation.cidade}, ${cachedLocation.estado}`,
      });
    }
  };

  const rejectCachedLocation = () => {
    localStorage.removeItem('user_location');
    setCachedLocation(null);
    setShowLocationConfirm(false);
    // Marcar como confirmado nesta sessão (mesmo que tenha rejeitado)
    sessionStorage.setItem('location_confirmed_session', 'true');
    requestLocation();
  };

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep('requesting_permission');

    try {
      // Verificar se geolocalização está disponível
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada pelo navegador');
      }

      setCurrentStep('getting_coordinates');

      // Solicitar localização
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setCurrentStep('geocoding');
            
            await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            
            setCurrentStep('success');
            
            toast({
              title: "Localização detectada!",
              description: "Sua cidade foi identificada automaticamente.",
            });
          } catch (err) {
            console.error('❌ Erro ao identificar cidade:', err);
            setCurrentStep('error');
            setError('Localização obtida, mas não conseguimos identificar sua cidade');
            toast({
              title: "Não foi possível identificar a cidade",
              description: "Por favor, selecione manualmente.",
              variant: "destructive",
            });
            throw err;
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('❌ Erro ao obter localização:', err);
          
          let errorMessage = 'Erro ao obter localização';
          let toastDescription = 'Selecione sua cidade manualmente.';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              toastDescription = 'Você precisa permitir o acesso à sua localização.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              toastDescription = 'Não foi possível determinar sua localização.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização';
              toastDescription = 'Verifique se o GPS está ativo e tente novamente.';
              break;
          }
          
          setCurrentStep('error');
          setError(errorMessage);
          setLoading(false);
          
          toast({
            title: errorMessage,
            description: toastDescription,
            variant: "destructive",
          });
          
          throw err;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos de cache
        }
      );
    } catch (err) {
      setCurrentStep('error');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
      throw err;
    }
  };

  const setManualLocation = (cidade: string, estado: string) => {
    const locationData = { cidade, estado };
    saveLocationToCache(locationData);
    setLocation(locationData);
    
    toast({
      title: "Localização definida",
      description: `${cidade}, ${estado}`,
    });
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('user_location');
  };

  useEffect(() => {
    const cached = loadCachedLocation();
    const alreadyConfirmedThisSession = sessionStorage.getItem('location_confirmed_session');
    
    if (cached) {
      // Se já foi confirmado nesta sessão, usar diretamente sem mostrar modal
      if (alreadyConfirmedThisSession) {
        setLocation({
          cidade: cached.cidade,
          estado: cached.estado,
          coordinates: cached.coordinates
        });
        setLoading(false);
      } else {
        // Primeira vez na sessão: mostrar modal de confirmação
        setCachedLocation(cached);
        setShowLocationConfirm(true);
        setLoading(false);
      }
    } else {
      requestLocation();
    }
  }, []);

  return {
    location,
    loading,
    error,
    currentStep,
    cachedLocation,
    showLocationConfirm,
    requestLocation,
    setManualLocation,
    clearLocation,
    confirmCachedLocation,
    rejectCachedLocation
  };
};
