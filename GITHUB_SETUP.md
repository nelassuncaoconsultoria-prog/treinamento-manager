# Exportar para GitHub - Guia Completo

## 📋 Pré-requisitos

1. Conta no GitHub (https://github.com)
2. Git instalado localmente
3. Código do TreinaManager pronto

---

## 🚀 Passo a Passo

### Opção 1: Usar Manus Management UI (Recomendado)

Se você está usando o Manus, a forma mais fácil é:

1. Acesse o Management UI do seu projeto
2. Vá para "Settings" → "GitHub"
3. Clique em "Export to GitHub"
4. Selecione o proprietário (sua conta)
5. Digite o nome do repositório: `treinamento-manager`
6. Clique em "Export"
7. Aguarde o upload completar

**Pronto!** Seu repositório está no GitHub.

---

### Opção 2: Exportar Manualmente via Git

Se preferir fazer manualmente:

#### 1. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha:
   - **Repository name**: `treinamento-manager`
   - **Description**: `Sistema de Gerenciamento de Treinamentos Corporativos`
   - **Visibility**: `Public` (ou `Private` se preferir)
   - **Initialize with**: Deixe em branco
3. Clique em "Create repository"

#### 2. Copiar o Código Localmente

```bash
# Copie o projeto para sua máquina
cp -r /home/ubuntu/treinamento-manager ~/treinamento-manager
cd ~/treinamento-manager
```

#### 3. Inicializar Git

```bash
# Inicialize o repositório
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: TreinaManager ready for Render"

# Renomeie a branch para main (se necessário)
git branch -M main

# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/treinamento-manager.git

# Faça o push
git push -u origin main
```

#### 4. Verificar no GitHub

1. Acesse https://github.com/seu-usuario/treinamento-manager
2. Verifique se todos os arquivos estão lá
3. Confirme que o `render.yaml` está presente

---

## 📦 Arquivos Importantes para o Render

Certifique-se que estes arquivos estão no repositório:

```
✅ render.yaml                    - Configuração do Render
✅ package.json                   - Dependências e scripts
✅ pnpm-lock.yaml                 - Lock file do pnpm
✅ server/_core/index.ts          - Servidor principal
✅ drizzle/schema.ts              - Schema do banco de dados
✅ .gitignore                      - Arquivos a ignorar
✅ RENDER_DEPLOYMENT.md           - Guia de deployment
✅ ENVIRONMENT_VARIABLES.md       - Variáveis de ambiente
```

---

## 🔐 Segurança - O que NÃO fazer

❌ **NUNCA** commit:
- `.env` ou `.env.local`
- Chaves privadas (JWT_SECRET, API keys)
- Credenciais do Google Drive
- Senhas do banco de dados

✅ **SEMPRE** use:
- Environment Variables do Render
- `.gitignore` para excluir arquivos sensíveis
- Secrets do GitHub para CI/CD

---

## 🔄 Conectar Render com GitHub

Após exportar para GitHub:

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Selecione "Deploy an existing repository from GitHub"
4. Conecte sua conta GitHub
5. Selecione `treinamento-manager`
6. Configure:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
7. Clique em "Create Web Service"

---

## 📝 Commits Futuros

Após o setup inicial, você pode fazer commits normalmente:

```bash
# Faça alterações no código
nano client/src/pages/Home.tsx

# Stage das alterações
git add .

# Commit
git commit -m "feat: adicionar nova funcionalidade"

# Push para GitHub
git push origin main
```

**Render detectará automaticamente** e fará o redeploy!

---

## 🚀 Deploy Automático

Após conectar GitHub com Render:

1. Qualquer push para `main` dispara um build
2. Render executa `pnpm install && pnpm build`
3. Aplicação é atualizada automaticamente
4. Você recebe notificações de sucesso/erro

---

## 🆘 Troubleshooting

### "Repository not found"
```bash
# Verifique a URL remota
git remote -v

# Se estiver errada, corrija
git remote set-url origin https://github.com/seu-usuario/treinamento-manager.git
```

### "Permission denied (publickey)"
```bash
# Configure SSH keys no GitHub
ssh-keygen -t ed25519 -C "seu-email@example.com"
cat ~/.ssh/id_ed25519.pub

# Copie a chave e adicione em GitHub → Settings → SSH Keys
```

### "Render não vê o repositório"
1. Verifique se o repositório é público
2. Reconecte a conta GitHub em Render
3. Autorize o Render no GitHub

---

## 💡 Dicas

1. **Commits frequentes**: Faça commits pequenos e descritivos
2. **Mensagens claras**: Use `feat:`, `fix:`, `docs:` no início
3. **Branches**: Crie branches para features grandes
4. **Pull Requests**: Use PRs para revisar código antes de merge
5. **Tags**: Use tags para marcar versões (v1.0.0, v1.1.0, etc)

---

## 📚 Próximos Passos

1. ✅ Exportar para GitHub
2. ✅ Conectar com Render
3. ✅ Configurar variáveis de ambiente
4. ✅ Fazer deploy inicial
5. ✅ Testar aplicação
6. ✅ Configurar domínio customizado

---

## 📞 Suporte

- GitHub Docs: https://docs.github.com
- Render Docs: https://render.com/docs
- Git Docs: https://git-scm.com/doc
