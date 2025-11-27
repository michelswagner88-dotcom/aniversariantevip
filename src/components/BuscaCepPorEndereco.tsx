import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Municipio {
  nome: string;
}

interface BuscaCepPorEnderecoProps {
  onCepFound: (cep: string) => void;
}

const BuscaCepPorEndereco: React.FC<BuscaCepPorEnderecoProps> = ({ onCepFound }) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Carregar estados ao montar o componente
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch('https://brasilapi.com.br/api/ibge/uf/v1');
        if (!response.ok) throw new Error('Erro ao buscar estados');
        const data: Estado[] = await response.json();
        setEstados(data.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        toast.error('Erro ao carregar lista de estados');
      } finally {
        setLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Carregar municípios quando estado é selecionado
  useEffect(() => {
    if (!selectedEstado) {
      setMunicipios([]);
      return;
    }

    const fetchMunicipios = async () => {
      setLoadingMunicipios(true);
      try {
        const response = await fetch(
          `https://brasilapi.com.br/api/ibge/municipios/v1/${selectedEstado}`
        );
        if (!response.ok) throw new Error('Erro ao buscar municípios');
        const data: Municipio[] = await response.json();
        setMunicipios(data.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
        console.error('Erro ao carregar municípios:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setLoadingMunicipios(false);
      }
    };

    fetchMunicipios();
  }, [selectedEstado]);

  const handleBuscarCep = async () => {
    if (!selectedEstado || !selectedMunicipio || !logradouro.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // BrasilAPI não tem endpoint de busca reversa de CEP por endereço
      // Vamos usar ViaCEP que tem essa funcionalidade
      const response = await fetch(
        `https://viacep.com.br/ws/${selectedEstado}/${selectedMunicipio}/${encodeURIComponent(logradouro)}/json/`
      );
      
      if (!response.ok) throw new Error('Erro na busca');
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Pegar o primeiro resultado
        const cepEncontrado = data[0].cep.replace('-', '');
        toast.success('CEP encontrado!');
        onCepFound(cepEncontrado);
      } else {
        toast.error('Nenhum CEP encontrado para este endereço', {
          description: 'Tente ser mais específico ou verificar a digitação'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP', {
        description: 'Tente novamente ou digite o CEP manualmente'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
      <h3 className="text-lg font-semibold text-white">Buscar CEP por Endereço</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-200 mb-2 block">
            Estado (UF)
          </label>
          <Select
            value={selectedEstado}
            onValueChange={(value) => {
              setSelectedEstado(value);
              setSelectedMunicipio('');
            }}
            disabled={loadingEstados}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado.sigla} value={estado.sigla}>
                  {estado.nome} ({estado.sigla})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200 mb-2 block">
            Cidade
          </label>
          <Select
            value={selectedMunicipio}
            onValueChange={setSelectedMunicipio}
            disabled={!selectedEstado || loadingMunicipios}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue 
                placeholder={
                  !selectedEstado 
                    ? "Selecione o estado primeiro" 
                    : loadingMunicipios 
                    ? "Carregando..." 
                    : "Selecione a cidade"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {municipios.map((municipio) => (
                <SelectItem key={municipio.nome} value={municipio.nome}>
                  {municipio.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200 mb-2 block">
            Nome da Rua
          </label>
          <Input
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            placeholder="Ex: Avenida Paulista"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            disabled={!selectedMunicipio}
          />
        </div>

        <Button
          onClick={handleBuscarCep}
          disabled={loading || !selectedEstado || !selectedMunicipio || !logradouro.trim()}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar CEP
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BuscaCepPorEndereco;
