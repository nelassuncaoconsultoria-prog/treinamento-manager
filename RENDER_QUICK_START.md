# 🚀 Render Quick Start - Começar em 5 Minutos

## ⚡ Resumo Rápido

Você tem um projeto Node.js + PostgreSQL pronto para o Render. Siga estes passos:

---

## 1️⃣ Preparar o GitHub

```bash
# Se ainda não tiver no GitHub:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/treinamento-manager.git
git push -u origin main
```

**Ou use o Manus UI:** Settings → GitHub → Export

---

## 2️⃣ Criar Banco de Dados no Render

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - Name: `treinamento-manager-db`
   - Database: `treinamento_manager`
   - Plan: `Free`
4. Clique em "Create"
5. **Copie a Connection String** (você vai precisar)

---

## 3️⃣ Criar Web Service no Render

1. Clique em "New +" → "Web Service"
2. Selecione "Deploy an existing repository from GitHub"
3. Conecte GitHub e selecione `treinamento-manager`
4. Configure:
   - **Name**: `treinamento-manager`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: `Free`
5. Clique em "Create Web Service"

---

## 4️⃣ Adicionar Variáveis de Ambiente

No Render Dashboard → Seu Web Service → "Environment":

**Mínimo necessário:**

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | Cole a Connection String do PostgreSQL |
| `JWT_SECRET` | Gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Se usar Manus OAuth:**

| Variável | Valor |
|----------|-------|
| `VITE_APP_ID` | Seu App ID |
| `OAUTH_SERVER_URL` | `https://api.manus.im` |
| `OWNER_OPEN_ID` | Seu Owner ID |
| `OWNER_NAME` | Seu Nome |
| `VITE_OAUTH_PORTAL_URL` | `https://portal.manus.im` |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Sua chave |
| `VITE_FRONTEND_FORGE_API_KEY` | Sua chave frontend |
| `VITE_FRONTEND_FORGE_API_URL` | `https://api.manus.im` |

**Opcional (Google Drive):**

| Variável | Valor |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Seu Client ID |
| `GOOGLE_CLIENT_SECRET` | Seu Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://seu-dominio.onrender.com/api/oauth/callback` |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` | Seu JSON |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Seu Folder ID |

---

## 5️⃣ Deploy!

1. Clique em "Deploy" no Render Dashboard
2. Aguarde o build completar (2-5 minutos)
3. Acesse `https://seu-servico.onrender.com`

---

## ✅ Verificar se Funcionou

```bash
# Acesse sua aplicação
https://seu-servico.onrender.com

# Verifique os logs
Render Dashboard → Seu Web Service → "Logs"

# Procure por:
✅ "Server running on http://localhost:3000/"
```

---

## 🗄️ Executar Migrations (Importante!)

Após o primeiro deploy:

1. Acesse Render Dashboard → Seu Web Service
2. Clique em "Shell"
3. Execute:
   ```bash
   pnpm db:push
   ```
4. Aguarde completar

---

## 🎉 Pronto!

Sua aplicação está no ar! 

**Próximos passos:**
- [ ] Testar login
- [ ] Criar alguns funcionários
- [ ] Criar alguns cursos
- [ ] Configurar domínio customizado
- [ ] Configurar backups

---

## 🆘 Problemas Comuns

### Build falha
```
Solução: Verifique os logs
Render Dashboard → Logs → Procure por "error"
```

### Aplicação não inicia
```
Solução: Verifique DATABASE_URL
Copie a Connection String correta do PostgreSQL
```

### Página em branco
```
Solução: Verifique variáveis de ambiente
Certifique-se que todas as variáveis obrigatórias estão configuradas
```

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- `RENDER_DEPLOYMENT.md` - Guia completo
- `ENVIRONMENT_VARIABLES.md` - Todas as variáveis
- `GITHUB_SETUP.md` - Como exportar para GitHub

---

## 💡 Dica Pro

Após o primeiro deploy bem-sucedido, qualquer push para GitHub dispara um novo deploy automaticamente!

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Render detecta e faz o deploy automaticamente
```

---

**Sucesso! 🚀**
