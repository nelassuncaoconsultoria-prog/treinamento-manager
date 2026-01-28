# Deployment no Render - Guia Completo

## 📋 Pré-requisitos

1. Conta no Render (https://render.com)
2. Repositório GitHub com o código do TreinaManager
3. Variáveis de ambiente configuradas

---

## 🚀 Passo a Passo para Deployment

### 1. Preparar o Repositório GitHub

```bash
# Se ainda não tiver no GitHub, crie um novo repositório
git init
git add .
git commit -m "Initial commit: TreinaManager ready for Render"
git branch -M main
git remote add origin https://github.com/seu-usuario/treinamento-manager.git
git push -u origin main
```

### 2. Criar Serviço Web no Render

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Selecione "Deploy an existing repository from GitHub"
4. Conecte sua conta GitHub e selecione o repositório `treinamento-manager`
5. Configure:
   - **Name**: `treinamento-manager`
   - **Environment**: `Node`
   - **Region**: `Ohio` (ou mais próximo de você)
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: `Free` (ou upgrade conforme necessário)

### 3. Criar Banco de Dados PostgreSQL

1. No Render Dashboard, clique em "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `treinamento-manager-db`
   - **Database**: `treinamento_manager`
   - **User**: `treinamento_user`
   - **Region**: Mesma do Web Service
   - **Plan**: `Free`
3. Copie a **Connection String** (você usará isso)

### 4. Configurar Variáveis de Ambiente

No Render Dashboard, acesse seu Web Service e vá para "Environment":

#### Variáveis Obrigatórias:

```
DATABASE_URL=postgresql://treinamento_user:PASSWORD@HOST:5432/treinamento_manager
NODE_ENV=production
PORT=3000
JWT_SECRET=gere-uma-chave-aleatoria-segura
```

#### Variáveis do Manus (se usar autenticação Manus):

```
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=seu-owner-id
OWNER_NAME=Seu Nome
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

#### Variáveis do Google Drive (Opcional):

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://seu-dominio-render.onrender.com/api/oauth/callback
GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_DRIVE_ROOT_FOLDER_ID=seu-folder-id
```

#### Variáveis de Branding:

```
VITE_APP_TITLE=TreinaManager
VITE_APP_LOGO=https://url-da-sua-logo.com/logo.png
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu-website-id
```

### 5. Deploy Inicial

1. Clique em "Deploy" no Render Dashboard
2. Monitore o log de build
3. Após sucesso, acesse sua aplicação em `https://seu-servico.onrender.com`

---

## 🔄 Executar Migrations do Banco de Dados

Após o primeiro deploy, você precisa executar as migrations:

### Opção 1: Via Render Shell (Recomendado)

1. No Render Dashboard, vá para seu Web Service
2. Clique em "Shell"
3. Execute:
   ```bash
   pnpm db:push
   ```

### Opção 2: Conectar via CLI Local

```bash
# Instale o Render CLI
npm install -g @render-oss/render-cli

# Faça login
render login

# Conecte ao banco de dados
render postgres connect treinamento-manager-db

# Execute as migrations
pnpm db:push
```

---

## 🌐 Configurar Domínio Customizado

1. No Render Dashboard, vá para "Settings"
2. Em "Custom Domain", adicione seu domínio
3. Configure os DNS records conforme instruído
4. Aguarde a propagação (pode levar até 24 horas)

---

## 📊 Monitorar Aplicação

### Logs

- Dashboard → Seu Web Service → "Logs"
- Veja logs em tempo real do servidor

### Métricas

- Dashboard → Seu Web Service → "Metrics"
- CPU, memória, requisições, etc.

### Alertas

- Configure alertas para downtime ou erros
- Settings → Notifications

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```
Solução: Certifique-se que pnpm install foi executado
- Verifique o Build Command: pnpm install && pnpm build
- Limpe o cache: Dashboard → Redeploy
```

### Erro: "Database connection failed"

```
Solução: Verifique DATABASE_URL
- Copie a Connection String correta do PostgreSQL
- Certifique-se que a senha está correta
- Teste a conexão localmente antes
```

### Erro: "Port already in use"

```
Solução: Render define a porta automaticamente
- Use process.env.PORT em vez de hardcoded 3000
- Verificar: server/_core/index.ts
```

### Aplicação muito lenta

```
Solução: Upgrade do plano
- Free tier tem limitações
- Considere upgrade para "Standard" ($7/mês)
```

---

## 🔐 Segurança

1. **JWT_SECRET**: Gere uma chave segura
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Variáveis Sensíveis**: Nunca commit no GitHub
   - Use apenas Environment Variables do Render
   - Revise o `.gitignore`

3. **HTTPS**: Automático no Render
   - Todos os domínios têm SSL/TLS

---

## 📈 Próximos Passos

1. ✅ Deploy inicial
2. ✅ Executar migrations
3. ✅ Testar autenticação
4. ✅ Configurar domínio customizado
5. ✅ Monitorar logs e métricas
6. ✅ Configurar backups do banco de dados

---

## 📞 Suporte

- **Render Docs**: https://render.com/docs
- **Render Support**: https://support.render.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 💡 Dicas

- Use `render.yaml` para Infrastructure as Code (IaC)
- Mantenha dependências atualizadas
- Implemente CI/CD com GitHub Actions
- Configure alertas para monitorar saúde da app
- Faça backups regulares do banco de dados
