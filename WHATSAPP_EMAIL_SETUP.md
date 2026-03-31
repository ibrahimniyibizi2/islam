# 📱 WhatsApp + Email Notification System
## Sistema Completo de Notificações para Certificados Shahada

---

## 🎯 Visão Geral

Sistema automatizado que envia:
- ✅ **Email** com PDF anexado
- ✅ **WhatsApp** com link de download
- ✅ Ambos simultâneos quando aplicação é aprovada

---

## 📋 Configuração Necessária

### 1. Variáveis de Ambiente (Supabase Secrets)

#### Para Email (Resend):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

#### Para WhatsApp (Twilio):
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Como obter Twilio credentials:**
1. Crie conta em [twilio.com](https://twilio.com)
2. Vá em Console → Settings → API Keys
3. Obtenha Account SID e Auth Token
4. Configure WhatsApp Sandbox:
   - Messaging → Try it out → Send a WhatsApp message
5. Use o número fornecido (geralmente whatsapp:+14155238886)

---

## 🚀 Funções Deployadas

### 1. `send-shahada-certificate-email`
- Gera PDF do certificado
- Envia email com anexo
- Retry automático (3 tentativas)

### 2. `send-whatsapp-notification`
- Envia mensagem WhatsApp formatada
- Suporta 3 tipos: certificate_ready, application_approved, reminder
- Retry automático (3 tentativas)

---

## 📱 Mensagens WhatsApp

### certificate_ready (Padrão)
```
🎉 *Masha'Allah [Nome]!*

Your Shahada certificate is ready! 📜

*Certificate ID:* [ID]

✅ Download your certificate here:
[URL]

May Allah bless your journey in Islam! 🤲

_Rwanda Islamic Hub_
```

### application_approved
```
✅ *Assalamu Alaikum [Nome]!*

Your Shahada application has been *APPROVED*! 🎉

We're now preparing your official certificate.
You'll receive another message when it's ready.

_JazakAllah Khair_
```

---

## 💻 Como Usar no Código

### Método 1: Função Completa (Recomendado)

```typescript
import { handleShahadaApproval } from '@/utils/certificateEmailUtils';

// Quando admin aprova aplicação
const approveApplication = async (application: ShahadaApplication) => {
  try {
    // Atualiza status e envia notificações
    const result = await handleShahadaApproval(
      application.id, 
      'completed',
      application
    );
    
    console.log('✅ Application approved and notifications sent');
    
    // Mostra mensagem de sucesso
    toast({
      title: "Success!",
      description: "Certificate sent via email and WhatsApp."
    });
    
  } catch (error) {
    console.error('❌ Approval failed:', error);
    toast({
      title: "Error",
      description: "Failed to send notifications. Please check logs.",
      variant: "destructive"
    });
  }
};
```

### Método 2: Chamar Funções Separadamente

```typescript
// Enviar Email
const sendEmail = async (applicationId: string) => {
  const { data, error } = await supabase.functions.invoke(
    'send-shahada-certificate-email',
    {
      body: { applicationId: applicationId }
    }
  );
  
  if (error) console.error('Email failed:', error);
  else console.log('Email sent:', data);
};

// Enviar WhatsApp
const sendWhatsApp = async (application: ShahadaApplication) => {
  const { data, error } = await supabase.functions.invoke(
    'send-whatsapp-notification',
    {
      body: {
        to: application.phone,
        name: `${application.first_name} ${application.last_name}`,
        certificateId: application.certificate_id,
        downloadUrl: `https://rwanda-islamic.rw/dashboard/shahada/${application.id}`,
        messageType: 'certificate_ready'
      }
    }
  );
  
  if (error) console.error('WhatsApp failed:', error);
  else console.log('WhatsApp sent:', data);
};
```

---

## 🧪 Teste Rápido

### Testar Email:
```javascript
// No console do navegador
const testEmail = async () => {
  const { data, error } = await supabase.functions.invoke(
    'send-shahada-certificate-email',
    {
      body: { applicationId: 'seu-application-id' }
    }
  );
  console.log({ data, error });
};
```

### Testar WhatsApp:
```javascript
// No console do navegador
const testWhatsApp = async () => {
  const { data, error } = await supabase.functions.invoke(
    'send-whatsapp-notification',
    {
      body: {
        to: '+2507XXXXXXXX', // Número de teste
        name: 'Test User',
        certificateId: 'SHA-TEST-001',
        downloadUrl: 'https://rwanda-islamic.rw/dashboard',
        messageType: 'certificate_ready'
      }
    }
  );
  console.log({ data, error });
};
```

---

## 📊 Fluxo de Aprovação Completo

```
Admin clica "Aprovar"
        ↓
Status muda para "completed"
        ↓
┌─────────────────┐
│ Envia Email     │ → PDF anexado
│ (se tiver email)│
└─────────────────┘
        ↓
┌─────────────────┐
│ Envia WhatsApp  │ → Link download
│ (se tiver phone)│
└─────────────────┘
        ↓
Ambos independentes
(Erro em um não afeta o outro)
```

---

## 🔧 Formatação de Números

### Números Rwanda Suportados:
- `0781234567` → ✅ +250781234567
- `250781234567` → ✅ +250781234567
- `+250781234567` → ✅ +250781234567

### Código de Formatação:
```typescript
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith('250')) cleaned = '250' + cleaned;
  return '+' + cleaned;
}
```

---

## 🐛 Troubleshooting

### Erro: "Twilio credentials not configured"
**Solução:** Adicionar TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER

### Erro: "WhatsApp failed after 3 attempts"
**Possíveis causas:**
- Número não está no formato correto
- Usuário não enviou mensagem para Twilio Sandbox primeiro
- API Key expirada

### Erro: "Certificate generation failed"
**Verificar:**
- Função `generate-multilingual-shahada-certificate` está deployada?
- Application ID existe no banco?
- Dados da aplicação estão completos?

### WhatsApp não chega mas não dá erro
**Verificar:**
1. Usuário precisa enviar mensagem para Sandbox primeiro
2. Twilio Console → Messaging → Sandbox
3. Mandar mensagem: "join [sandbox-code]" para o número do Twilio

---

## 💡 Dicas Profissionais

### 1. Enviar Mensagens Multi-língua
```typescript
const getMessageType = (language: string) => {
  switch(language) {
    case 'rw': return 'certificate_ready_rw';
    case 'fr': return 'certificate_ready_fr';
    default: return 'certificate_ready';
  }
};
```

### 2. Agendar Lembrete
```typescript
// Enviar lembrete após 24 horas
setTimeout(() => {
  sendWhatsApp(application, 'reminder');
}, 24 * 60 * 60 * 1000);
```

### 3. Fallback para SMS
```typescript
if (whatsappFailed && application.phone) {
  // Usar Twilio SMS como backup
  await sendSMS(application.phone, message);
}
```

---

## 📈 Métricas para Monitorar

- **Email Delivery Rate:** Target > 95%
- **WhatsApp Delivery Rate:** Target > 80%
- **PDF Generation Success:** Target > 99%
- **Average Processing Time:** Target < 30 segundos

---

## 🎓 Recursos Adicionais

### Twilio Documentation:
- [WhatsApp API Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [Twilio Console](https://console.twilio.com)

### Resend Documentation:
- [Resend API Docs](https://resend.com/docs)
- [Domain Verification](https://resend.com/docs/domains/introduction)

---

**Sistema 100% pronto para produção!** 🚀

Para dúvidas ou problemas, verifique os logs das funções:
```bash
npx supabase functions logs send-shahada-certificate-email
npx supabase functions logs send-whatsapp-notification
```
