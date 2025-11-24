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

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=pt&types=place,region`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Procurar cidade e estado nos resultados
        let cidade = '';
        let estado = '';
        
        for (const feature of data.features) {
          if (feature.place_type.includes('place')) {
            cidade = feature.text;
          }
          if (feature.place_type.includes('region')) {
            estado = feature.properties?.short_code?.replace('BR-', '') || feature.text;
          }
        }
        
        // Se encontrou ambos, salvar
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
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // Cache de 5 minutos
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
