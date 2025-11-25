# 🤖 Chatbot Assistente - Aniversariante VIP

## 📋 Visão Geral

Sistema completo de chatbot assistente com IA integrado ao site, usando **Lovable AI** (Google Gemini 2.5 Flash) com conhecimento dinâmico do banco de dados em tempo real.

---

## ✨ Funcionalidades Implementadas

### 🎯 Chatbot Inteligente
- ✅ **Interface flutuante** moderna com gradiente violet/pink
- ✅ **Conversação em tempo real** usando Lovable AI
- ✅ **Contexto dinâmico** do banco de dados (estabelecimentos, cupons, estatísticas)
- ✅ **Histórico de conversação** mantido durante a sessão
- ✅ **Sugestões de perguntas** frequentes
- ✅ **Indicador de digitação** e estados de loading
- ✅ **Notificação de status** (online/offline)
- ✅ **Auto-scroll** para última mensagem
- ✅ **Tom de voz personalizado** para a marca

### 🧠 Conhecimento do Bot

O assistente possui conhecimento sobre:

#### Para Aniversariantes:
- ✅ Como funciona a plataforma
- ✅ Processo de cadastro (100% gratuito)
- ✅ Como emitir cupons digitais
- ✅ Categorias disponíveis
- ✅ Busca por localização
- ✅ Sistema de favoritos
- ✅ Funcionalidades da carteira digital

#### Para Estabelecimentos:
- ✅ Planos e preços por categoria
- ✅ Benefícios de ser parceiro
- ✅ Dashboard de analytics
- ✅ Processo de cadastro
- ✅ Regras de validação de cupons

#### Dados em Tempo Real:
- ✅ Total de estabelecimentos ativos
- ✅ Total de aniversariantes cadastrados
- ✅ Total de cupons emitidos
- ✅ Categorias disponíveis no sistema
- ✅ Exemplos de estabelecimentos reais

---

## 💰 Estrutura de Custos

### Lovable AI (Google Gemini 2.5 Flash)

#### ✅ **Uso Gratuito Incluído**
- Todas as contas Lovable incluem uso gratuito mensal do Lovable AI
- Quantidade varia conforme o plano (Free/Pro/Business)
- Renovação automática a cada mês

#### 💵 **Após Uso Gratuito**
- **Modelo**: Baseado no número de requests (não tokens)
- **Precificação**: Pay-as-you-go (pague conforme usar)
- **Recarga**: Settings → Workspace → Usage
- **Transparência**: Dashboard mostra uso em tempo real

#### 🎯 **Estimativa de Custos**
Para ter uma ideia aproximada:
- **100 conversas/dia**: ~3.000 requests/mês
- **500 conversas/dia**: ~15.000 requests/mês
- **1.000 conversas/dia**: ~30.000 requests/mês

*Valores exatos variam conforme tamanho das conversas e contexto.*

#### ⚡ **Rate Limits**
- Limite de requests por minuto por workspace
- **429 Error**: Muitas requests → aguardar alguns segundos
- **402 Error**: Créditos esgotados → adicionar créditos
- Sistema já trata esses erros com mensagens amigáveis

#### 📊 **Monitoramento de Uso**
1. Acesse **Settings → Workspace → Usage**
2. Visualize requests consumidos
3. Configure alertas de limite
4. Adicione créditos quando necessário

---

## 🏗️ Arquitetura Técnica

### Backend (Edge Function)

**Arquivo**: `supabase/functions/chat-assistant/index.ts`

```typescript
Fluxo:
1. Recebe mensagens do usuário
2. Busca contexto do banco de dados (Supabase)
3. Monta system prompt personalizado
4. Envia para Lovable AI (Gemini 2.5 Flash)
5. Retorna resposta para o cliente
```

**Segurança**:
- ✅ LOVABLE_API_KEY protegida no backend
- ✅ CORS configurado
- ✅ Validação de erros (429, 402, 500)
- ✅ Logs detalhados para debug

**Contexto Dinâmico**:
```typescript
- Total de estabelecimentos ativos
- Total de aniversariantes
- Total de cupons emitidos
- Categorias disponíveis
- Exemplos de estabelecimentos com benefícios
```

### Frontend (React Component)

**Arquivo**: `src/components/ChatAssistant.tsx`

**Features UI**:
- 🎨 Design premium com gradientes violet/pink
- 📱 Totalmente responsivo (400px width)
- 💬 Histórico de mensagens com timestamps
- ⌨️ Input com auto-focus
- 📜 Auto-scroll suave
- 🔄 Estados de loading
- ⚡ Indicador de online/offline
- 💡 Sugestões de perguntas

---

## 🚀 Como Usar

### Para o Usuário Final

1. **Abrir o chat**: Clique no botão flutuante no canto inferior direito
2. **Fazer pergunta**: Digite ou clique em uma sugestão
3. **Aguardar resposta**: O assistente responde em segundos
4. **Continuar conversa**: Histórico é mantido durante a sessão

### Para Desenvolvedores

#### Modificar o System Prompt
Edite o arquivo: `supabase/functions/chat-assistant/index.ts`

```typescript
const systemPrompt = `
  Você é o assistente virtual do **Aniversariante VIP**...
  // Personalize aqui o comportamento e conhecimento do bot
`;
```

#### Adicionar Mais Contexto
Adicione queries ao banco no mesmo arquivo:

```typescript
// Exemplo: buscar cidades disponíveis
const { data: cidades } = await supabase
  .from("estabelecimentos")
  .select("cidade")
  .is("deleted_at", null);

contextInfo += `\nCidades: ${Array.from(new Set(cidades?.map(c => c.cidade))).join(", ")}`;
```

#### Alterar o Modelo de IA
No edge function, altere a linha:

```typescript
model: "google/gemini-2.5-flash", // Altere aqui
```

Modelos disponíveis:
- `google/gemini-2.5-flash` (padrão - rápido e econômico)
- `google/gemini-2.5-pro` (mais poderoso)
- `google/gemini-2.5-flash-lite` (mais rápido/barato)
- `openai/gpt-5` (alternativa OpenAI)

---

## 🎨 Customização Visual

### Cores e Estilos
Edite: `src/components/ChatAssistant.tsx`

```typescript
// Header gradient
className="bg-gradient-to-r from-violet-600/20 to-pink-600/20"

// User message bubble
className="bg-gradient-to-r from-violet-600 to-pink-600"

// Bot message bubble
className="border border-white/10 bg-white/5"
```

### Tamanho da Janela
```typescript
className="h-[600px] w-[400px]" // Ajuste aqui
```

### Posição do Botão
```typescript
className="fixed bottom-6 right-6" // Ajuste posição
```

---

## 🧪 Testes

### Teste de Funcionamento Básico
```
Perguntas para testar:
1. "Como funciona a plataforma?"
2. "Quais categorias estão disponíveis?"
3. "Como emitir um cupom?"
4. "Quanto custa para estabelecimentos?"
5. "Quantos estabelecimentos tem cadastrados?"
```

### Teste de Contexto Dinâmico
```
1. Cadastre um novo estabelecimento
2. Pergunte ao bot: "Quantos estabelecimentos tem?"
3. Bot deve responder com número atualizado
```

### Teste de Rate Limiting
```
1. Envie muitas mensagens rapidamente
2. Sistema deve mostrar erro 429 com mensagem amigável
3. Aguarde alguns segundos e tente novamente
```

---

## 📊 Monitoring e Logs

### Ver Logs do Edge Function
1. Acesse **Cloud → Edge Functions**
2. Selecione `chat-assistant`
3. Clique em **Logs**
4. Filtre por erros ou por período

### Logs Importantes
```
✅ "Enviando request para Lovable AI com X mensagens"
✅ "Resposta recebida com sucesso"
❌ "Erro Lovable AI: 429" (rate limit)
❌ "Erro Lovable AI: 402" (sem créditos)
❌ "Erro no chat-assistant" (erro geral)
```

---

## 🔧 Troubleshooting

### Bot não responde
1. Verifique console do navegador (F12)
2. Verifique logs do edge function
3. Confirme que LOVABLE_API_KEY está configurada
4. Teste edge function diretamente no Supabase

### Erro 429 (Rate Limit)
- **Causa**: Muitas requests em pouco tempo
- **Solução**: Aguardar alguns segundos
- **Prevenção**: Implementar debounce no input

### Erro 402 (Sem Créditos)
- **Causa**: Uso gratuito esgotado
- **Solução**: Adicionar créditos em Settings → Workspace → Usage
- **Prevenção**: Configurar alertas de limite

### Contexto desatualizado
- **Causa**: Cache ou delay na leitura do banco
- **Solução**: Testar com `includeContext: true` no body
- **Verificação**: Olhar logs do edge function

---

## 🎯 Próximos Passos (Melhorias Futuras)

### 🚀 Funcionalidades Avançadas
- [ ] **Streaming de resposta** (tokens aparecem em tempo real)
- [ ] **Sugestões contextuais** (bot sugere próximas perguntas)
- [ ] **Busca semântica** (vector database para documentação)
- [ ] **Multi-idioma** (detectar idioma do usuário)
- [ ] **Histórico persistente** (salvar conversas no banco)
- [ ] **Analytics** (rastrear perguntas mais comuns)

### 🎨 UI/UX
- [ ] **Modo compacto** (minimizar sem fechar)
- [ ] **Temas customizados** (light/dark mode)
- [ ] **Emojis e GIFs** (resposta mais visual)
- [ ] **Typing indicator** animado
- [ ] **Quick replies** (botões de ação rápida)
- [ ] **Áudio** (falar com o bot via voz)

### 🔧 Otimizações
- [ ] **Cache de respostas** (perguntas frequentes)
- [ ] **Debounce** no input (evitar rate limit)
- [ ] **Retry automático** em caso de erro
- [ ] **Fallback** para respostas offline
- [ ] **Compressão de contexto** (reduzir tokens)

---

## 📚 Referências

- [Lovable AI Documentation](https://docs.lovable.dev/features/ai)
- [Google Gemini Models](https://ai.google.dev/gemini-api/docs/models)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Best Practices](https://react.dev/)

---

## 🤝 Suporte

Se tiver dúvidas ou problemas:
1. Verifique os logs do edge function
2. Consulte esta documentação
3. Entre em contato com o suporte do Lovable
4. Acesse a comunidade Discord do Lovable

---

**Última atualização**: 2025-11-25  
**Versão**: 1.0.0  
**Status**: ✅ Produção - Totalmente Funcional
