import { useEffect, useRef, useCallback } from 'react';

export type BehaviorTrigger = {
  type: 'idle' | 'validation_error' | 'field_abandon' | 'server_error';
  field?: string;
  message: string;
};

type ValidationError = {
  field: string;
  message: string;
  count: number;
  lastOccurrence: number;
};

export const useFormBehaviorMonitor = (
  onTrigger: (trigger: BehaviorTrigger) => void,
  isEnabled: boolean = true
) => {
  const focusedField = useRef<string | null>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const abandonTimer = useRef<NodeJS.Timeout | null>(null);
  const validationErrors = useRef<Map<string, ValidationError>>(new Map());
  const lastInteraction = useRef<number>(Date.now());

  const IDLE_TIMEOUT = 15000; // 15 segundos
  const ABANDON_TIMEOUT = 10000; // 10 segundos
  const VALIDATION_ERROR_THRESHOLD = 3;

  const clearTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (abandonTimer.current) clearTimeout(abandonTimer.current);
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (!isEnabled) return;
    
    lastInteraction.current = Date.now();
    clearTimers();
  }, [isEnabled, clearTimers]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    if (!isEnabled) return;

    handleUserInteraction();
    focusedField.current = fieldName;

    // Detectar pausa prolongada (Gatilho 1)
    idleTimer.current = setTimeout(() => {
      const requiredFields = [
        'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado',
        'cnpj', 'nomeFantasia', 'email', 'telefone', 'senha',
        'beneficiosAniversariante', 'regrasAniversariante',
        'nome', 'cpf', 'dataNascimento' // Campos de aniversariante
      ];

      if (requiredFields.includes(fieldName)) {
        onTrigger({
          type: 'idle',
          field: fieldName,
          message: 'Olá! Posso te ajudar com o preenchimento? Se precisar de alguma informação ou estiver com dúvida sobre o que colocar em qualquer campo, é só me dizer!'
        });
      }
    }, IDLE_TIMEOUT);
  }, [isEnabled, onTrigger, handleUserInteraction]);

  const trackFieldBlur = useCallback((fieldName: string, isComplexField: boolean = false) => {
    if (!isEnabled) return;

    handleUserInteraction();
    
    // Detectar abandono de campo crítico (Gatilho 3)
    if (isComplexField) {
      abandonTimer.current = setTimeout(() => {
        const complexFields = ['cnpj', 'cep', 'senha', 'beneficiosAniversariante', 'cpf'];
        
        if (complexFields.includes(fieldName) && focusedField.current !== fieldName) {
          onTrigger({
            type: 'field_abandon',
            field: fieldName,
            message: 'Estamos quase lá! Para finalizar o cadastro, precisamos apenas concluir esta etapa. Quer que eu te guie no próximo passo?'
          });
        }
      }, ABANDON_TIMEOUT);
    }

    focusedField.current = null;
  }, [isEnabled, onTrigger, handleUserInteraction]);

  const trackValidationError = useCallback((fieldName: string, errorMessage: string) => {
    if (!isEnabled) return;

    handleUserInteraction();
    
    const now = Date.now();
    const existing = validationErrors.current.get(fieldName);

    if (existing && now - existing.lastOccurrence < 60000) {
      // Erro repetido em menos de 1 minuto
      const newCount = existing.count + 1;
      validationErrors.current.set(fieldName, {
        ...existing,
        count: newCount,
        lastOccurrence: now
      });

      // Detectar erro de validação repetido (Gatilho 2)
      if (newCount >= VALIDATION_ERROR_THRESHOLD) {
        const fieldLabels: Record<string, string> = {
          email: 'E-mail',
          telefone: 'Telefone',
          cnpj: 'CNPJ',
          cep: 'CEP',
          senha: 'Senha',
          cpf: 'CPF',
          nome: 'Nome',
          dataNascimento: 'Data de Nascimento'
        };

        const fieldLabel = fieldLabels[fieldName] || fieldName;
        const suggestions: Record<string, string> = {
          telefone: 'Você inseriu o DDD? Por favor, tente o formato completo: (XX) XXXXX-XXXX.',
          cnpj: 'Verifique se inseriu todos os dígitos no formato: 00.000.000/0000-00.',
          cep: 'Verifique se o CEP está correto no formato: 00000-000.',
          email: 'Verifique se o e-mail está no formato correto: exemplo@dominio.com.',
          senha: 'A senha deve ter pelo menos 6 caracteres.',
          cpf: 'Verifique se o CPF está correto no formato: 000.000.000-00 com dígitos verificadores válidos.',
          dataNascimento: 'Verifique se a data está no formato correto: DD/MM/AAAA.'
        };

        const suggestion = suggestions[fieldName] || 'Verifique se o campo está preenchido corretamente.';

        onTrigger({
          type: 'validation_error',
          field: fieldName,
          message: `Detectei que o campo '${fieldLabel}' está gerando erro de formato repetidamente. ${suggestion}`
        });

        // Resetar contador após intervenção
        validationErrors.current.delete(fieldName);
      }
    } else {
      // Primeiro erro ou erro após muito tempo
      validationErrors.current.set(fieldName, {
        field: fieldName,
        message: errorMessage,
        count: 1,
        lastOccurrence: now
      });
    }
  }, [isEnabled, onTrigger, handleUserInteraction]);

  const trackServerError = useCallback((errorCode: number, errorMessage: string) => {
    if (!isEnabled) return;

    handleUserInteraction();
    
    // Detectar erro crítico do servidor (Gatilho 4)
    if (errorCode >= 500 || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      onTrigger({
        type: 'server_error',
        message: 'Pedimos desculpas! Nosso servidor encontrou uma instabilidade ao processar sua solicitação. Por favor, tente novamente em um minuto. Se o erro persistir, entre em contato com nosso suporte e faremos o cadastro por você imediatamente.'
      });
    }
  }, [isEnabled, onTrigger, handleUserInteraction]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleClick = () => handleUserInteraction();
    const handleKeyPress = () => handleUserInteraction();
    const handleScroll = () => handleUserInteraction();

    document.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('scroll', handleScroll);

    return () => {
      clearTimers();
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isEnabled, handleUserInteraction, clearTimers]);

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackValidationError,
    trackServerError
  };
};
