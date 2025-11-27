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

// Supabase URL para chamar Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GeolocationStep>('idle');
  const { toast } = useToast();

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
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
      const { cidade, estado } = data;
      
      if (!cidade || !estado) {
        throw new Error('Não foi possível extrair cidade/estado dos resultados');
      }
      
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
    localStorage.setItem('user_location', JSON.stringify({
      cidade: locationData.cidade,
      estado: locationData.estado
    }));
  };

  const loadCachedLocation = (): Location | null => {
    try {
      const cached = localStorage.getItem('user_location');
      if (!cached) return null;

      const data = JSON.parse(cached);
      if (!data.cidade || !data.estado) return null;

      return data;
    } catch {
      return null;
    }
  };

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep('requesting_permission');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada pelo navegador');
      }

      setCurrentStep('getting_coordinates');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setCurrentStep('geocoding');
            
            await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            
            setCurrentStep('success');
            setLoading(false);
          } catch (err) {
            console.error('❌ Erro ao identificar cidade:', err);
            setCurrentStep('error');
            setError('Não foi possível identificar sua cidade');
            setLoading(false);
          }
        },
        (err) => {
          console.error('❌ Erro ao obter localização:', err);
          
          let errorMessage = 'Não foi possível obter sua localização';
          
          setCurrentStep('error');
          setError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Não usar cache do navegador
        }
      );
    } catch (err) {
      setCurrentStep('error');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  const setManualLocation = (cidade: string, estado: string) => {
    const locationData = { cidade, estado };
    saveLocationToCache(locationData);
    setLocation(locationData);
    setError(null);
    
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
    
    if (cached) {
      // Tem cache? Usa direto
      setLocation(cached);
      setLoading(false);
      setCurrentStep('success');
    } else {
      // Não tem cache? Tenta geolocalização UMA vez
      requestLocation();
    }
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
