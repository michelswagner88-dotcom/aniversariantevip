import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Navigation, Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useActiveCities } from '@/hooks/useActiveCities';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

interface CityComboboxProps {
  value?: string;
  onSelect: (cidade: string, estado: string) => void;
  placeholder?: string;
  className?: string;
}

export const CityCombobox: React.FC<CityComboboxProps> = ({
  value,
  onSelect,
  placeholder = "Selecione uma cidade...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  
  const { location, requestLocation } = useGeolocation();
  
  const { data: cities = [], isLoading } = useActiveCities({
    userLat: location?.coordinates?.latitude,
    userLng: location?.coordinates?.longitude,
    searchTerm,
  });

  const handleUseMyLocation = async () => {
    setIsRequestingLocation(true);
    try {
      await requestLocation();
      toast.success('Localização detectada!');
    } catch (error) {
      toast.error('Não foi possível obter sua localização');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Encontrar cidade selecionada
  const selectedCity = cities.find(
    city => `${city.cidade}, ${city.estado}` === value
  );

  // Cidades em destaque (top 5 com mais estabelecimentos)
  const topCities = cities.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white",
            className
          )}
        >
          <span className="truncate">
            {selectedCity
              ? `${selectedCity.cidade}, ${selectedCity.estado}`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0 bg-slate-900 border-white/10" 
        align="start"
      >
        <Command className="bg-slate-900">
          <CommandInput
            placeholder="Digite o nome da cidade..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="text-white border-white/10"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                <span className="ml-2 text-sm text-slate-400">Carregando cidades...</span>
              </div>
            ) : (
              <>
                {/* Botão "Perto de Mim" */}
                <CommandGroup heading="Localização">
                  <CommandItem
                    onSelect={handleUseMyLocation}
                    className="cursor-pointer hover:bg-white/5"
                    disabled={isRequestingLocation}
                  >
                    <Navigation className={cn(
                      "mr-2 h-4 w-4 text-blue-400",
                      isRequestingLocation && "animate-pulse"
                    )} />
                    <span className="text-white">
                      {isRequestingLocation ? 'Detectando...' : 'Usar minha localização'}
                    </span>
                  </CommandItem>
                </CommandGroup>

                {/* Cidades em Alta (se não estiver pesquisando) */}
                {!searchTerm && topCities.length > 0 && (
                  <CommandGroup heading="🔥 Cidades em Alta">
                    {topCities.map((city) => (
                      <CommandItem
                        key={`${city.cidade}-${city.estado}`}
                        value={`${city.cidade}, ${city.estado}`}
                        onSelect={() => {
                          onSelect(city.cidade, city.estado);
                          setOpen(false);
                        }}
                        className="cursor-pointer hover:bg-white/5"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === `${city.cidade}, ${city.estado}`
                              ? "opacity-100 text-violet-400"
                              : "opacity-0"
                          )}
                        />
                        <MapPin className="mr-2 h-3 w-3 text-slate-400" />
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-white">
                            {city.cidade}, {city.estado}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {city.total_estabelecimentos} {city.total_estabelecimentos === 1 ? 'local' : 'locais'}
                            {city.distancia && ` • ${city.distancia.toFixed(1)}km`}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Todas as cidades */}
                {cities.length > 0 && (
                  <CommandGroup heading={searchTerm ? "Resultados" : "Todas as Cidades"}>
                    {cities.slice(searchTerm ? 0 : 5).map((city) => (
                      <CommandItem
                        key={`${city.cidade}-${city.estado}`}
                        value={`${city.cidade}, ${city.estado}`}
                        onSelect={() => {
                          onSelect(city.cidade, city.estado);
                          setOpen(false);
                        }}
                        className="cursor-pointer hover:bg-white/5"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === `${city.cidade}, ${city.estado}`
                              ? "opacity-100 text-violet-400"
                              : "opacity-0"
                          )}
                        />
                        <MapPin className="mr-2 h-3 w-3 text-slate-400" />
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-white">
                            {city.cidade}, {city.estado}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {city.total_estabelecimentos} {city.total_estabelecimentos === 1 ? 'local' : 'locais'}
                            {city.distancia && ` • ${city.distancia.toFixed(1)}km`}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                <CommandEmpty className="text-center py-6">
                  <p className="text-slate-400 mb-2">
                    Ainda não chegamos em <span className="font-bold text-white">{searchTerm}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Mas temos opções incríveis perto de você!
                  </p>
                </CommandEmpty>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
