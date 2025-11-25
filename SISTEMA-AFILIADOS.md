# 🤝 Sistema de Indique e Ganhe - AniversarianteVIP

Sistema completo de afiliação com Stripe Connect para pagamento automático de comissões recorrentes.

## 📋 Visão Geral

O sistema permite que usuários indiquem estabelecimentos comerciais e ganhem **30% de comissão recorrente** sobre cada pagamento de assinatura realizado pelos estabelecimentos indicados.

## 🔧 Configuração Inicial

### 1. Configurar Stripe Webhook

Para processar os pagamentos e distribuir comissões automaticamente, você precisa configurar um webhook no Stripe:

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers → Webhooks**
3. Clique em **Add endpoint**
4. Configure:
   - **URL do Endpoint**: `https://[SEU-PROJETO].supabase.co/functions/v1/stripe-webhook`
   - **Events to send**: Selecione os eventos:
     - `invoice.payment_succeeded` (para processar pagamentos)
     - `account.updated` (para confirmar onboarding do Connect)
5. Copie o **Signing secret** (começará com `whsec_...`)
6. Adicione o secret no Supabase:
   - Acesse as configurações do projeto
   - Vá em **Secrets/Edge Functions**
   - Adicione: `STRIPE_WEBHOOK_SECRET` com o valor copiado

### 2. Ativar Stripe Connect

1. No Stripe Dashboard, vá em **Connect**
2. Ative o Stripe Connect para seu projeto
3. Configure para usar **Express accounts** (para simplificar o onboarding dos afiliados)

## 🎯 Como Funciona

### Para Afiliados (Indicadores)

1. **Acessar Dashboard**: `/afiliado`
2. **Conectar Carteira**: Primeiro passo é conectar conta bancária via Stripe Connect
3. **Gerar Link**: Copiar link personalizado de indicação
4. **Compartilhar**: Enviar link para estabelecimentos comerciais
5. **Receber Comissões**: Automaticamente quando estabelecimentos pagam assinaturas

### Para Estabelecimentos (Indicados)

1. **Cadastro via Link**: Acessar `cadastro-estabelecimento?ref={user_id}`
2. **Referral Tracking**: Sistema automaticamente vincula ao afiliado
3. **Escolher Plano**: Redireciona para Stripe Checkout
4. **Pagamento**: Ao pagar, 30% vai automaticamente para o afiliado

## 💰 Fluxo de Comissão

```
┌──────────────────┐
│ Estabelecimento  │
│  paga R$ 100,00  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Stripe processa  │
│   pagamento      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ R$70   │ │  R$30    │
│ Para   │ │  Para    │
│ Você   │ │ Afiliado │
└────────┘ └──────────┘
```

## 📊 Estrutura do Banco de Dados

### Tabela: `referrals`
Registra todas as comissões geradas:
- `referrer_id`: ID do afiliado
- `establishment_id`: ID do estabelecimento indicado
- `commission_amount`: Valor da comissão
- `status`: Estado do pagamento (pending, paid, failed)
- `stripe_transfer_id`: ID da transferência no Stripe

### Campos Adicionados:
- `profiles.stripe_account_id`: Conta Stripe Connect do afiliado
- `profiles.stripe_onboarding_completed`: Status do onboarding
- `estabelecimentos.referred_by_user_id`: Quem indicou
- `estabelecimentos.plan_status`: Status da assinatura

## 🔐 Segurança

### RLS Policies Implementadas:
- Afiliados só veem suas próprias comissões
- Sistema tem acesso total para processar pagamentos
- Webhook público mas validado por assinatura Stripe

### Edge Functions:
- `stripe-connect-onboarding`: Criar conta Connect (autenticada)
- `stripe-webhook`: Processar pagamentos (pública, validada por signature)
- `create-referral-checkout`: Criar checkout com tracking (autenticada)

## 📈 Métricas do Dashboard

O dashboard do afiliado exibe:
- **Saldo Disponível**: Total de comissões já pagas
- **Estabelecimentos Indicados**: Total de indicações
- **Estabelecimentos Ativos**: Quantos pagam assinatura
- **Comissão Pendente**: Valor a receber
- **Receita Recorrente**: Estimativa mensal

## ⚠️ Avisos Importantes

### Para Afiliados:
- ✅ Válido apenas para **CNPJ** (estabelecimentos comerciais)
- ❌ Cadastros de pessoa física **não geram comissão**
- 💳 Necessário completar onboarding do Stripe Connect
- ⏰ Comissões são pagas automaticamente a cada pagamento do estabelecimento

### Para Estabelecimentos:
- 📊 30% de cada pagamento vai para o indicador
- ✅ Nenhuma taxa adicional para o estabelecimento
- 🔄 Pagamento recorrente mensal
- 📧 Confirmação por email ao completar cadastro

## 🚀 Próximos Passos

1. ✅ Configurar Webhook do Stripe
2. ✅ Ativar Stripe Connect
3. ✅ Testar fluxo completo em modo de teste
4. ✅ Ativar modo produção no Stripe
5. ✅ Comunicar afiliados sobre o programa

## 🐛 Troubleshooting

### Webhook não está funcionando:
- Verifique se o `STRIPE_WEBHOOK_SECRET` está configurado
- Confirme que a URL do webhook está correta
- Veja os logs da edge function: `supabase functions logs stripe-webhook`

### Comissões não estão sendo pagas:
- Confirme que o afiliado completou o onboarding
- Verifique se `stripe_onboarding_completed` está `true`
- Veja os logs para erros de transferência

### Referral não está sendo rastreado:
- Verifique se o parâmetro `?ref=` está na URL
- Confirme que o localStorage está salvando o ID
- Veja o console do navegador para logs

## 📞 Suporte

Para problemas técnicos:
- Logs das Edge Functions: Supabase Dashboard → Edge Functions → Logs
- Webhooks do Stripe: Stripe Dashboard → Developers → Webhooks → Event logs
- Analytics: `/afiliado` mostra estatísticas em tempo real
