import { useState, useEffect } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

interface StoredLocation extends UserLocation {
  timestamp: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Tentar carregar localização salva (válida por 1 hora)
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      try {
        const parsed: StoredLocation = JSON.parse(stored);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (parsed.timestamp > oneHourAgo) {
          setLocation({ lat: parsed.lat, lng: parsed.lng });
        }
      } catch (e) {
        console.error('Erro ao carregar localização salva:', e);
      }
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        setLocation(newLocation);
        setLoading(false);
        
        // Salvar no localStorage com timestamp
        localStorage.setItem('userLocation', JSON.stringify({
          ...newLocation,
          timestamp: Date.now(),
        }));
      },
      (err) => {
        let errorMessage = 'Não foi possível obter sua localização';
        
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Permissão de localização negada';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = 'Localização indisponível';
        } else if (err.code === err.TIMEOUT) {
          errorMessage = 'Tempo esgotado ao obter localização';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('userLocation');
  };

  return { 
    location, 
    loading, 
    error, 
    requestLocation,
    clearLocation 
  };
};
