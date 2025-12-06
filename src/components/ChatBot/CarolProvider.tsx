import { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Carol from './Carol';

interface CarolContextType {
  abrirCarol: () => void;
  fecharCarol: () => void;
  isOpen: boolean;
}

const CarolContext = createContext<CarolContextType>({
  abrirCarol: () => {},
  fecharCarol: () => {},
  isOpen: false,
});

export const useCarol = () => useContext(CarolContext);

interface CarolProviderProps {
  children: ReactNode;
}

export const CarolProvider = ({ children }: CarolProviderProps) => {
  const location = useLocation();
  const [carolAberta, setCarolAberta] = useState(false);
  const [modoSuporte, setModoSuporte] = useState(false);

  // Rotas onde Carol aparece AUTOMATICAMENTE
  const rotasComCarol = [
    '/auth',
    '/cadastro',
    '/login',
    '/criar-conta',
    '/cadastro/aniversariante',
    '/cadastro/estabelecimento',
    '/login/aniversariante',
    '/login/estabelecimento',
    '/selecionar-perfil',
  ];

  // Verifica se está em rota de cadastro/login
  const estaNoCadastro = rotasComCarol.some(rota => 
    location.pathname === rota || location.pathname.startsWith(rota + '/')
  );

  // Função pra abrir Carol via suporte
  const abrirCarol = () => {
    setModoSuporte(true);
    setCarolAberta(true);
  };

  const fecharCarol = () => {
    setCarolAberta(false);
    setModoSuporte(false);
  };

  // Carol só aparece se:
  // 1. Está no cadastro (automático)
  // 2. Ou clicou em suporte (manual)
  const mostrarCarol = estaNoCadastro || carolAberta;

  return (
    <CarolContext.Provider value={{ abrirCarol, fecharCarol, isOpen: carolAberta }}>
      {children}
      
      {mostrarCarol && (
        <Carol
          modoSuporte={modoSuporte}
          onClose={fecharCarol}
          podeFechar={modoSuporte}
        />
      )}
    </CarolContext.Provider>
  );
};

export default CarolProvider;
