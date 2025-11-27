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

type GeolocationStep = 
  | 'idle'
  | 'requesting_permission'
  | 'getting_coordinates'
  | 'geocoding'
  | 'success'
  | 'error';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GeolocationStep>('idle');
  const { toast } = useToast();

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      console.log('📍 Coordenadas obtidas:', { latitude, longitude });
      
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API Key não configurada');
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
      console.log('🌐 Fazendo requisição de geocoding reverso...');
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na API do Google Maps: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Resposta do geocoding:', data);
      
      if (data.status !== 'OK' || !data.results?.length) {
        throw new Error(`Geocoding falhou: ${data.status}`);
      }
      
      const result = data.results[0];
      let cidade = '';
      let estado = '';
      
      // Extrair cidade e estado dos componentes do endereço
      for (const component of result.address_components) {
        if (component.types.includes('administrative_area_level_2')) {
          cidade = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          estado = component.short_name;
        }
      }
      
      // Fallback: tentar locality para cidade
      if (!cidade) {
        for (const component of result.address_components) {
          if (component.types.includes('locality')) {
            cidade = component.long_name;
          }
        }
      }
      
      if (!cidade || !estado) {
        throw new Error('Não foi possível extrair cidade/estado dos resultados');
      }
      
      console.log('✅ Localização identificada:', { cidade, estado });
      
      const locationData = {
        cidade,
        estado,
        coordinates: { latitude, longitude }
      };
      
      setLocation(locationData);
      localStorage.setItem('user_location', JSON.stringify(locationData));
      return locationData;
    } catch (err) {
      console.error('❌ Erro ao fazer geocoding reverso:', err);
      throw err;
    }
  };

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep('requesting_permission');

    try {
      // Verificar se há localização salva no localStorage
      const savedLocation = localStorage.getItem('user_location');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        setLoading(false);
        setCurrentStep('success');
        return;
      }

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
            throw err; // Re-throw para o componente saber que falhou
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
          
          throw err; // Re-throw para o componente saber que falhou
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
      throw err; // Re-throw para o componente saber que falhou
    }
  };

  const setManualLocation = (cidade: string, estado: string) => {
    const locationData = { cidade, estado };
    setLocation(locationData);
    localStorage.setItem('user_location', JSON.stringify(locationData));
    
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
    requestLocation();
  }, []);

  return {
    location,
    loading,
    error,
    currentStep,
    requestLocation,
    setManualLocation,
    clearLocation
  };
};
