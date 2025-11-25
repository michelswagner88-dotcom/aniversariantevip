# Sistema de Chatbot Proativo - Aniversariante VIP

## Visão Geral

O sistema implementa um chatbot com comportamento proativo que monitora ativamente o comportamento do usuário na página de cadastro de estabelecimentos (`/cadastro-estabelecimento`) e intervém automaticamente quando detecta situações específicas de dificuldade ou frustração.

## Arquitetura

### 1. Hook de Monitoramento (`useFormBehaviorMonitor`)

Hook personalizado que detecta padrões comportamentais e dispara gatilhos proativos.

**Localização:** `src/hooks/useFormBehaviorMonitor.ts`

**Funcionalidades:**
- Rastreamento de foco em campos do formulário
- Detecção de inatividade (idle)
- Contagem de erros de validação repetidos
- Monitoramento de abandono de campos críticos
- Detecção de erros de servidor

### 2. Componente ChatAssistant Aprimorado

Componente de chat que agora aceita mensagens proativas automáticas.

**Localização:** `src/components/ChatAssistant.tsx`

**Novos recursos:**
- Método `sendProactiveMessage()` para enviar mensagens automaticamente
- Abre automaticamente quando recebe mensagem proativa
- Prop `onMount` para expor o método ao componente pai

### 3. Integração na Página de Cadastro

A página de cadastro de estabelecimentos integra o sistema de monitoramento.

**Localização:** `src/pages/CadastroEstabelecimento.tsx`

**Implementação:**
- Rastreamento de eventos `onFocus` e `onBlur` nos campos críticos
- Rastreamento de erros de validação
- Rastreamento de erros de servidor
- Ref para enviar mensagens proativas ao chatbot

## Gatilhos Comportamentais

### Gatilho 1: Pausa Prolongada (Idle)
**Condição:** Usuário foca em um campo obrigatório e permanece inativo por mais de 15 segundos.

**Campos monitorados:**
- CEP, logradouro, número, bairro, cidade, estado
- CNPJ, nome fantasia, e-mail, telefone, senha
- Benefícios para aniversariantes, regras

**Mensagem de intervenção:**
```
"Olá! Posso te ajudar com o preenchimento? Se precisar de alguma informação 
ou estiver com dúvida sobre o que colocar em qualquer campo, é só me dizer!"
```

### Gatilho 2: Erros de Validação Repetidos
**Condição:** Usuário recebe o mesmo erro de validação 3 vezes consecutivas em menos de 1 minuto.

**Campos rastreados:**
- E-mail
- Telefone
- CNPJ
- CEP
- Senha

**Exemplo de intervenção para telefone:**
```
"Detectei que o campo 'Telefone' está gerando erro de formato repetidamente. 
Você inseriu o DDD? Por favor, tente o formato completo: (XX) XXXXX-XXXX."
```

### Gatilho 3: Abandono de Campo Crítico
**Condição:** Usuário começa a preencher um campo complexo e sai dele por mais de 10 segundos.

**Campos críticos:**
- CNPJ
- CEP
- Senha
- Benefícios para aniversariantes

**Mensagem de intervenção:**
```
"Estamos quase lá! Para finalizar o cadastro, precisamos apenas concluir esta etapa. 
Quer que eu te guie no próximo passo?"
```

### Gatilho 4: Erro Crítico de Servidor
**Condição:** Sistema retorna erro 500, timeout ou erro de processamento.

**Mensagem de intervenção:**
```
"Pedimos desculpas! Nosso servidor encontrou uma instabilidade ao processar sua solicitação. 
Por favor, tente novamente em um minuto. Se o erro persistir, entre em contato com nosso 
suporte e faremos o cadastro por você imediatamente."
```

## Edge Function - Contexto de Suporte

O edge function `chat-assistant` foi atualizado com contexto específico para suporte proativo.

**Localização:** `supabase/functions/chat-assistant/index.ts`

**Novos recursos no prompt do sistema:**
- Instruções específicas para modo de suporte proativo
- Informações sobre campos críticos do formulário
- Dicas de suporte para problemas comuns
- Restrição explícita: não interferir com escolha de planos

## Como Funciona na Prática

### Fluxo de Detecção e Intervenção

1. **Usuário interage com formulário**
   - Evento `onFocus` dispara rastreamento do campo

2. **Sistema detecta comportamento**
   - Timer começa a contar (15s para idle, 10s para abandono)
   - Erros de validação são contabilizados

3. **Gatilho é acionado**
   - Hook chama callback `onTrigger` com tipo e mensagem
   - Mensagem é enviada para o chatbot via ref

4. **Chatbot intervém**
   - Mensagem do assistente é adicionada ao histórico
   - Janela do chat abre automaticamente
   - Usuário vê a mensagem de ajuda contextual

### Resetamento de Contadores

- **Interação do usuário**: Click, keypress ou scroll resetam timers
- **Erros resolvidos**: Contador de erros é resetado após 3 ocorrências ou após 1 minuto sem o mesmo erro
- **Campo alterado**: Timers são limpos quando o foco muda de campo

## Configurações

### Timeouts
```typescript
const IDLE_TIMEOUT = 15000; // 15 segundos
const ABANDON_TIMEOUT = 10000; // 10 segundos
const VALIDATION_ERROR_THRESHOLD = 3; // 3 erros consecutivos
```

### Desabilitar Monitoramento
Para desabilitar temporariamente o monitoramento:

```typescript
const { trackFieldFocus, trackFieldBlur, trackValidationError, trackServerError } = 
  useFormBehaviorMonitor(handleBehaviorTrigger, false); // false desabilita
```

## Exclusões Importantes

**O chatbot NÃO deve:**
- Interferir com escolha de planos de assinatura
- Sugerir valores ou pacotes
- Fazer vendas ou upsell
- Coletar informações sensíveis diretamente

**O chatbot DEVE:**
- Focar apenas em desbloquear o usuário
- Resolver problemas técnicos de preenchimento
- Orientar sobre formatos corretos
- Oferecer suporte para erros do sistema

## Benefícios

### Para o Usuário
- ✅ Suporte instantâneo sem precisar pedir ajuda
- ✅ Redução de frustração com erros repetidos
- ✅ Orientação contextual sobre campos complexos
- ✅ Feedback em tempo real sobre problemas

### Para a Plataforma
- ✅ Redução de abandono de cadastros
- ✅ Menos tickets de suporte manual
- ✅ Maior taxa de conversão de estabelecimentos
- ✅ Melhor experiência do usuário
- ✅ Dados sobre pontos de fricção no formulário

## Testes Recomendados

### Teste 1: Idle Detection
1. Focar no campo "CNPJ"
2. Aguardar 15 segundos sem digitar
3. Verificar se chatbot abre com mensagem de ajuda

### Teste 2: Validation Errors
1. Digitar e-mail inválido
2. Tentar submeter formulário
3. Repetir 3 vezes
4. Verificar se chatbot sugere formato correto

### Teste 3: Field Abandon
1. Começar a preencher "Benefícios para Aniversariantes"
2. Clicar fora do campo
3. Aguardar 10 segundos
4. Verificar se chatbot oferece guia

### Teste 4: Server Error
1. Simular erro 500 no servidor
2. Tentar submeter formulário
3. Verificar se chatbot informa sobre instabilidade

## Melhorias Futuras

- [ ] Analytics de gatilhos acionados
- [ ] A/B testing de mensagens de intervenção
- [ ] Machine learning para prever abandono
- [ ] Integração com sistema de tickets
- [ ] Suporte multiidioma
- [ ] Modo de treinamento para novos gatilhos
