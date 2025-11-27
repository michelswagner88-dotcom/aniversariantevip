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

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API Key não configurada');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR&result_type=locality|administrative_area_level_1`
      );

      if (!response.ok) {
        throw new Error(`Erro na API do Google Maps: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        let cidade = '';
        let estado = '';
        
        // Extrair cidade e estado dos componentes do endereço
        for (const result of data.results) {
          for (const component of result.address_components) {
            if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
              cidade = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              estado = component.short_name;
            }
          }
          
          if (cidade && estado) break;
        }
        
        if (cidade && estado) {
          const locationData = {
            cidade,
            estado,
            coordinates: { latitude, longitude }
          };
          
          setLocation(locationData);
          localStorage.setItem('user_location', JSON.stringify(locationData));
          return locationData;
        }
      }
      
      throw new Error('Não foi possível determinar a localização');
    } catch (err) {
      console.error('Erro ao fazer geocoding reverso:', err);
      throw err;
    }
  };

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar se há localização salva no localStorage
      const savedLocation = localStorage.getItem('user_location');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        setLoading(false);
        return;
      }

      // Verificar se geolocalização está disponível
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada pelo navegador');
      }

      // Solicitar localização
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            
            toast({
              title: "Localização detectada!",
              description: "Sua cidade foi identificada automaticamente.",
            });
          } catch (err) {
            setError('Erro ao identificar cidade');
            toast({
              title: "Não foi possível identificar a cidade",
              description: "Por favor, selecione manualmente.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Erro ao obter localização:', err);
          
          let errorMessage = 'Erro ao obter localização';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permissão negada para acessar localização';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case err.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização';
              break;
          }
          
          setError(errorMessage);
          setLoading(false);
          
          toast({
            title: "Localização não disponível",
            description: "Selecione sua cidade manualmente.",
          });
        },
        {
          enableHighAccuracy: true, // Precisão alta para melhor resultado
          timeout: 15000, // Aumentar timeout
          maximumAge: 0 // Sempre pegar localização nova
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
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
    requestLocation,
    setManualLocation,
    clearLocation
  };
};
