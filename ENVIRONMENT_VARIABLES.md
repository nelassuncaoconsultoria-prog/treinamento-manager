# Variáveis de Ambiente - TreinaManager

## 📋 Guia Completo de Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente necessárias para executar o TreinaManager no Render.

---

## 🔴 Variáveis Obrigatórias

### DATABASE_URL
**Descrição**: String de conexão com o banco de dados PostgreSQL  
**Formato**: `postgresql://user:password@host:port/database`  
**Exemplo**: `postgresql://treinamento_user:senha123@db.render.com:5432/treinamento_manager`  
**Origem**: Copie da página do PostgreSQL no Render Dashboard

### NODE_ENV
**Descrição**: Ambiente de execução  
**Valor**: `production`  
**Nota**: Deve ser `production` para o Render

### PORT
**Descrição**: Porta em que a aplicação escuta  
**Valor**: `3000`  
**Nota**: Render define automaticamente via variável de ambiente

### JWT_SECRET
**Descrição**: Chave secreta para assinar tokens JWT  
**Formato**: String aleatória segura (mínimo 32 caracteres)  
**Gerar**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Nota**: Nunca compartilhe ou coloque no GitHub

---

## 🟠 Variáveis de Autenticação (Manus OAuth)

Se você está usando autenticação Manus, configure estas variáveis:

### VITE_APP_ID
**Descrição**: ID da aplicação Manus  
**Origem**: Dashboard Manus → Configurações → App ID  
**Exemplo**: `app_1234567890abcdef`

### OAUTH_SERVER_URL
**Descrição**: URL do servidor OAuth Manus  
**Valor**: `https://api.manus.im`  
**Nota**: Não altere este valor

### OWNER_OPEN_ID
**Descrição**: OpenID do proprietário da aplicação  
**Origem**: Dashboard Manus → Perfil → OpenID  
**Exemplo**: `user_abcdef1234567890`

### OWNER_NAME
**Descrição**: Nome do proprietário  
**Exemplo**: `João Silva`

### VITE_OAUTH_PORTAL_URL
**Descrição**: URL do portal OAuth  
**Valor**: `https://portal.manus.im`  
**Nota**: Não altere este valor

---

## 🟡 Variáveis da API Forge (Manus)

Para usar serviços internos do Manus (LLM, Storage, etc.):

### BUILT_IN_FORGE_API_URL
**Descrição**: URL da API Forge  
**Valor**: `https://api.manus.im`  
**Nota**: Não altere este valor

### BUILT_IN_FORGE_API_KEY
**Descrição**: Chave de API para Forge (servidor)  
**Origem**: Dashboard Manus → Secrets → BUILT_IN_FORGE_API_KEY  
**Nota**: Chave privada do servidor

### VITE_FRONTEND_FORGE_API_URL
**Descrição**: URL da API Forge (frontend)  
**Valor**: `https://api.manus.im`  
**Nota**: Não altere este valor

### VITE_FRONTEND_FORGE_API_KEY
**Descrição**: Chave de API para Forge (frontend)  
**Origem**: Dashboard Manus → Secrets → VITE_FRONTEND_FORGE_API_KEY  
**Nota**: Chave pública do frontend

---

## 🟢 Variáveis do Google Drive (Opcional)

Para integração com Google Drive (upload de certificados):

### GOOGLE_CLIENT_ID
**Descrição**: Client ID do Google OAuth  
**Origem**: Google Cloud Console → Credenciais  
**Formato**: `xxxxx.apps.googleusercontent.com`

### GOOGLE_CLIENT_SECRET
**Descrição**: Client Secret do Google OAuth  
**Origem**: Google Cloud Console → Credenciais  
**Nota**: Nunca compartilhe ou coloque no GitHub

### GOOGLE_REDIRECT_URI
**Descrição**: URI de redirecionamento após autenticação Google  
**Formato**: `https://seu-dominio-render.onrender.com/api/oauth/callback`  
**Exemplo**: `https://treinamento-manager.onrender.com/api/oauth/callback`

### GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON
**Descrição**: Credenciais da Service Account do Google Drive  
**Formato**: JSON completo da chave de serviço  
**Nota**: 
- Gere em Google Cloud Console → Service Accounts
- Copie o JSON inteiro
- Nunca compartilhe ou coloque no GitHub

**Exemplo** (não use este, gere o seu):
```json
{
  "type": "service_account",
  "project_id": "seu-projeto",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### GOOGLE_DRIVE_ROOT_FOLDER_ID
**Descrição**: ID da pasta raiz no Google Drive  
**Origem**: Google Drive → Clique com botão direito na pasta → Obter link  
**Formato**: String de 33 caracteres  
**Exemplo**: `1Xw0_h4vJtQphWYxlUFaOS6zGKieIzX0N`

---

## 🔵 Variáveis de Branding

### VITE_APP_TITLE
**Descrição**: Título da aplicação  
**Valor**: `TreinaManager`  
**Nota**: Aparece no navegador e interface

### VITE_APP_LOGO
**Descrição**: URL do logo da aplicação  
**Formato**: URL completa (https://...)  
**Exemplo**: `https://seu-dominio.com/logo.png`

---

## 🟣 Variáveis de Analytics (Opcional)

### VITE_ANALYTICS_ENDPOINT
**Descrição**: Endpoint para enviar dados de analytics  
**Formato**: URL completa  
**Exemplo**: `https://analytics.seu-dominio.com`

### VITE_ANALYTICS_WEBSITE_ID
**Descrição**: ID do website para analytics  
**Exemplo**: `website_123456`

---

## 🔧 Como Configurar no Render

### Passo 1: Acessar Environment Variables

1. Acesse https://dashboard.render.com
2. Selecione seu Web Service (treinamento-manager)
3. Vá para "Environment"

### Passo 2: Adicionar Variáveis

1. Clique em "Add Environment Variable"
2. Preencha:
   - **Key**: Nome da variável (ex: `DATABASE_URL`)
   - **Value**: Valor da variável
3. Clique em "Save"

### Passo 3: Deploy

1. Após adicionar todas as variáveis, clique em "Deploy"
2. Monitore o log de build
3. Verifique se a aplicação iniciou sem erros

---

## ✅ Checklist de Configuração

- [ ] DATABASE_URL configurado
- [ ] NODE_ENV = production
- [ ] PORT = 3000
- [ ] JWT_SECRET gerado e configurado
- [ ] VITE_APP_ID configurado
- [ ] OAUTH_SERVER_URL = https://api.manus.im
- [ ] OWNER_OPEN_ID configurado
- [ ] OWNER_NAME configurado
- [ ] VITE_OAUTH_PORTAL_URL = https://portal.manus.im
- [ ] BUILT_IN_FORGE_API_URL = https://api.manus.im
- [ ] BUILT_IN_FORGE_API_KEY configurado
- [ ] VITE_FRONTEND_FORGE_API_URL = https://api.manus.im
- [ ] VITE_FRONTEND_FORGE_API_KEY configurado
- [ ] VITE_APP_TITLE configurado
- [ ] VITE_APP_LOGO configurado (opcional)
- [ ] Google Drive configurado (opcional)
- [ ] Analytics configurado (opcional)

---

## 🔐 Dicas de Segurança

1. **Nunca compartilhe secrets**: Não coloque chaves no GitHub
2. **Use Render Secrets**: Sempre use Environment Variables do Render
3. **Rotação de chaves**: Altere JWT_SECRET periodicamente
4. **Auditoria**: Monitore quem tem acesso às variáveis
5. **Backup**: Guarde as chaves em local seguro

---

## 🆘 Troubleshooting

### "Environment variable not found"
- Verifique o nome exato da variável
- Certifique-se que foi salvo
- Redeploy a aplicação

### "Invalid DATABASE_URL"
- Copie a Connection String correta do PostgreSQL
- Verifique se a senha está correta
- Teste a conexão localmente

### "JWT_SECRET is empty"
- Gere uma nova chave
- Configure a variável
- Redeploy

---

## 📞 Suporte

- Render Docs: https://render.com/docs
- Manus Docs: https://help.manus.im
- Google Cloud Console: https://console.cloud.google.com
