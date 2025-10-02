# 🔐 Guia Completo de Gerenciamento de Variáveis de Ambiente no Docker

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Setup Rápido](#setup-rápido)
4. [Setup Manual](#setup-manual)
5. [Como Funciona](#como-funciona)
6. [Ambientes Diferentes](#ambientes-diferentes)
7. [Segurança](#segurança)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este projeto usa **múltiplos arquivos de ambiente** para diferentes cenários:

```
┌────────────────────────────────────────────────────┐
│  Desenvolvimento Local (seu PC)                    │
│  └─ .env                                           │
├────────────────────────────────────────────────────┤
│  Docker Produção (container/servidor)              │
│  └─ .env.docker.local                             │
├────────────────────────────────────────────────────┤
│  Templates (commitados no Git)                     │
│  ├─ .env.example (desenvolvimento)                 │
│  └─ .env.docker (docker)                          │
├────────────────────────────────────────────────────┤
│  Backup Seguro (seu PC)                           │
│  └─ .env.backup                                    │
└────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Arquivos

```bash
atlascivico/
├── .env                    # ✅ Desenvolvimento local (nunca commita)
├── .env.backup            # ✅ Backup seguro (nunca commita)
├── .env.example           # ✅ Template dev (PODE commitar)
├── .env.docker            # ✅ Template Docker (PODE commitar)
├── .env.docker.local      # ✅ Docker produção (nunca commita)
├── .gitignore             # ✅ Protege todos os arquivos sensíveis
├── docker-setup.ps1       # 🔧 Script de configuração automática
└── docker-compose.yml     # 🐳 Configuração Docker
```

### 🔒 Proteção no Git

O `.gitignore` protege automaticamente:
- ✅ `.env`
- ✅ `.env.backup`
- ✅ `.env.docker.local`
- ✅ Qualquer arquivo `.env*.local`

---

## ⚡ Setup Rápido (Recomendado)

### 1. Execute o Script Automatizado

```powershell
# Ver status dos arquivos
.\docker-setup.ps1 status

# Configurar automaticamente
.\docker-setup.ps1 setup
```

### 2. O script vai:
- ✅ Detectar arquivos `.env` existentes
- ✅ Copiar credenciais automaticamente
- ✅ Criar `.env.docker.local`
- ✅ Verificar se está tudo OK

### 3. Inicie o Docker

```powershell
docker-compose up -d prod
```

**Pronto! 🎉**

---

## 🛠️ Setup Manual

Se preferir configurar manualmente:

### Opção A: Copiar do `.env` existente

```powershell
# Copiar arquivo
Copy-Item .env .env.docker.local

# Ou
cp .env .env.docker.local
```

### Opção B: Usar o template

```powershell
# Copiar template
Copy-Item .env.docker .env.docker.local

# Editar com suas credenciais
notepad .env.docker.local
```

### Preencher as Variáveis

Abra `.env.docker.local` e preencha:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=santa-maria-ativa
NEXT_PUBLIC_FIREBASE_APP_ID=1:122210829117:web:666dda466c4197216a3b54
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=santa-maria-ativa.firebasestorage.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD4pQe9Cq9KlEqlHKBFKaBw6ZBm9WOy1MY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=santa-maria-ativa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=122210829117

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW90c29uaSIsImEiOiJjbWZva3hlY3QwNngzMmpvZmF3czl5Z2xuIn0.MD57O97tNzThIIix4oknUg

# Docker Config
NODE_ENV=production
PORT=3000
```

---

## 🔄 Como Funciona

### Desenvolvimento (`docker-compose up dev`)

```yaml
dev:
  env_file:
    - .env  # Usa o arquivo local
  environment:
    - NODE_ENV=development
```

**O que acontece:**
1. Docker lê o arquivo `.env` (seu arquivo de desenvolvimento)
2. Inicia o servidor em modo desenvolvimento
3. Hot reload funciona normalmente
4. Porta 9002

### Produção (`docker-compose up prod`)

```yaml
prod:
  env_file:
    - .env.docker.local  # Usa arquivo específico Docker
  environment:
    - NODE_ENV=production
```

**O que acontece:**
1. Docker lê o arquivo `.env.docker.local`
2. Build otimizado da aplicação
3. Servidor de produção
4. Porta 3000

---

## 🌍 Ambientes Diferentes

### 1. **Seu PC (Desenvolvimento)**

```powershell
# Usar desenvolvimento local normal
npm run dev

# OU usar Docker em modo dev
docker-compose up dev
```

**Usa:** `.env` (seu arquivo local)

### 2. **Docker Local (Testar Produção)**

```powershell
# Configurar
.\docker-setup.ps1 setup

# Iniciar
docker-compose up prod
```

**Usa:** `.env.docker.local`

### 3. **Servidor/VPS (Produção Real)**

```bash
# 1. SSH no servidor
ssh root@servidor.com

# 2. Clonar repositório
git clone https://github.com/brunoestevaooliveira/atlas-versao-3.git
cd atlas-versao-3

# 3. Criar .env.docker.local
nano .env.docker.local
# [Cola as credenciais]

# 4. Iniciar
docker-compose up -d prod
```

**Usa:** `.env.docker.local` (no servidor)

### 4. **Outro Desenvolvedor**

```powershell
# 1. Clonar repo
git clone https://github.com/brunoestevaooliveira/atlas-versao-3.git

# 2. Criar .env local
cp .env.example .env
# [Preencher com credenciais que você enviou]

# 3. Desenvolvimento normal
npm run dev

# OU com Docker
.\docker-setup.ps1 setup
docker-compose up dev
```

---

## 🔒 Segurança

### ✅ **O que ESTÁ protegido:**

```bash
.gitignore contém:
├── .env                 # ✅ Nunca vai pro Git
├── .env.backup          # ✅ Nunca vai pro Git
├── .env.docker.local    # ✅ Nunca vai pro Git
└── .env*.local          # ✅ Qualquer variação nunca vai
```

### ✅ **O que PODE ser commitado:**

```bash
├── .env.example         # ✅ Template sem valores reais
├── .env.docker          # ✅ Template Docker sem valores reais
└── docker-setup.ps1     # ✅ Script de setup
```

### 🚨 **NUNCA faça isso:**

```bash
❌ git add .env
❌ git add .env.docker.local
❌ git add .env.backup
❌ git commit -m "Add credentials"  # PERIGO!
```

### ✅ **Sempre faça isso:**

```bash
✅ Mantenha credenciais em arquivos .local
✅ Use o .gitignore (já configurado)
✅ Compartilhe credenciais por canal seguro (Signal, 1Password)
✅ Use docker-setup.ps1 para facilitar
```

---

## 🎯 Fluxo Completo: Desenvolvimento → Produção

### **Fase 1: Desenvolvimento Local**

```powershell
# 1. Você já tem o .env funcionando
npm run dev  # http://localhost:9002 ✅

# 2. Tudo funciona perfeitamente
```

### **Fase 2: Testar com Docker Localmente**

```powershell
# 1. Configurar Docker
.\docker-setup.ps1 setup
# [Escolhe copiar do .env]

# 2. Testar produção localmente
docker-compose up prod  # http://localhost:3000 ✅

# 3. Verificar se tudo funciona
```

### **Fase 3: Deploy em Servidor**

```bash
# No servidor (Linux/Ubuntu)
# 1. Clonar repo
git clone https://github.com/brunoestevaooliveira/atlas-versao-3.git
cd atlas-versao-3

# 2. Criar arquivo de produção
nano .env.docker.local
# [Cola as mesmas credenciais do seu .env]

# 3. Iniciar Docker
docker-compose up -d prod

# 4. Verificar logs
docker-compose logs -f prod

# 5. Pronto! Seu app está no ar! 🚀
```

---

## 🐛 Troubleshooting

### Problema: "Variável não encontrada"

```bash
Error: NEXT_PUBLIC_FIREBASE_API_KEY is not defined
```

**Solução:**
```powershell
# 1. Verificar arquivos
.\docker-setup.ps1 status

# 2. Se .env.docker.local não existe
.\docker-setup.ps1 setup

# 3. Reiniciar Docker
docker-compose down
docker-compose up -d prod
```

### Problema: Docker usa credenciais erradas

```powershell
# Verificar qual arquivo está sendo usado
docker-compose config

# Recriar .env.docker.local
Remove-Item .env.docker.local
.\docker-setup.ps1 setup

# Rebuild da imagem
docker-compose build --no-cache prod
docker-compose up -d prod
```

### Problema: Credenciais commitadas acidentalmente

```bash
# URGENTE: Remover do Git
git rm --cached .env
git rm --cached .env.docker.local
git commit -m "Remove sensitive files"
git push

# Trocar TODAS as chaves imediatamente!
# - Gerar novas chaves no Firebase
# - Gerar novo token do Mapbox
```

---

## 📊 Checklist de Setup

### ✅ Desenvolvimento Local
- [ ] `.env` existe e está funcionando
- [ ] `npm run dev` funciona
- [ ] Credenciais do Firebase OK
- [ ] Mapbox funcionando

### ✅ Docker Local
- [ ] `.env.docker.local` criado
- [ ] `docker-compose up dev` funciona
- [ ] `docker-compose up prod` funciona
- [ ] Portas 9002 e 3000 acessíveis

### ✅ Segurança
- [ ] `.gitignore` atualizado
- [ ] `.env.docker.local` NÃO está no Git
- [ ] `.env.backup` existe (backup)
- [ ] Credenciais nunca foram commitadas

### ✅ Documentação
- [ ] Entendi a diferença entre `.env` e `.env.docker.local`
- [ ] Sei usar `docker-setup.ps1`
- [ ] Sei fazer deploy em servidor

---

## 🚀 Comandos Rápidos

```powershell
# Status dos arquivos
.\docker-setup.ps1 status

# Configurar Docker
.\docker-setup.ps1 setup

# Desenvolvimento com Docker
docker-compose up dev

# Produção com Docker
docker-compose up -d prod

# Ver logs
docker-compose logs -f prod

# Parar tudo
docker-compose down

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d prod
```

---

## 📞 Suporte

Se tiver problemas:

1. **Verifique o status:**
   ```powershell
   .\docker-setup.ps1 status
   ```

2. **Veja os logs:**
   ```powershell
   docker-compose logs -f prod
   ```

3. **Reconfigure:**
   ```powershell
   .\docker-setup.ps1 setup
   ```

---

**Pronto! Seu Docker está configurado com gerenciamento profissional de variáveis de ambiente! 🎉**
