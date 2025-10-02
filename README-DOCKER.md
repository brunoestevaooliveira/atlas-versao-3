# 🐳 Guia de Uso do Docker - Atlas Versão 3

Este guia explica como executar o projeto Atlas usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 2.0 ou superior)
- Arquivo `.env` configurado com suas credenciais

## 🔧 Configuração Inicial

### 1. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais reais do Firebase e Mapbox.

### 2. Estrutura de Arquivos Docker

- **`Dockerfile`** - Build de produção otimizado (multi-stage)
- **`Dockerfile.dev`** - Build de desenvolvimento com hot reload
- **`docker-compose.yml`** - Orquestração de containers
- **`.dockerignore`** - Arquivos ignorados no build
- **`.env`** - Variáveis de ambiente (NÃO commitar!)

## 🚀 Comandos de Uso

### Desenvolvimento (Hot Reload)

Para rodar o ambiente de desenvolvimento com hot reload:

```bash
# Iniciar container de desenvolvimento
docker-compose up dev

# Ou em background
docker-compose up -d dev

# Ver logs
docker-compose logs -f dev

# Parar container
docker-compose down
```

**Acesse em:** http://localhost:9002

### Produção

Para rodar o ambiente de produção otimizado:

```bash
# Build e iniciar container de produção
docker-compose up --build prod

# Ou em background
docker-compose up -d --build prod

# Ver logs
docker-compose logs -f prod

# Parar container
docker-compose down
```

**Acesse em:** http://localhost:3000

## 🔨 Comandos Úteis

### Build Manual

```bash
# Build da imagem de desenvolvimento
docker build -f Dockerfile.dev -t atlas-dev .

# Build da imagem de produção
docker build -t atlas-prod .
```

### Executar Comandos Dentro do Container

```bash
# Abrir shell no container
docker-compose exec dev sh

# Instalar dependências
docker-compose exec dev npm install

# Executar testes
docker-compose exec dev npm test

# Verificar tipos TypeScript
docker-compose exec dev npm run typecheck
```

### Limpar Recursos

```bash
# Parar e remover containers
docker-compose down

# Remover containers, volumes e imagens
docker-compose down -v --rmi all

# Limpar cache do Docker
docker system prune -a
```

## 📁 Volumes

O container de desenvolvimento usa volumes para:
- **Sincronizar código**: Alterações no código local refletem imediatamente
- **Cache de node_modules**: Melhor performance
- **Cache do Next.js**: Build mais rápido

## 🔒 Segurança

### ✅ Boas Práticas Implementadas

1. **Multi-stage build**: Imagem de produção mínima e segura
2. **Usuário não-root**: Container roda com usuário `nextjs` (UID 1001)
3. **Variáveis de ambiente**: Não são commitadas no repositório
4. **Arquivo .env protegido**: Listado no `.gitignore` e `.dockerignore`
5. **Sem credenciais hardcoded**: Todas as chaves vêm de variáveis de ambiente

### ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env` no Git
- **NUNCA** exponha suas chaves de API publicamente
- Use `.env.example` apenas como template (sem credenciais reais)
- Em produção, use secrets do Docker ou variáveis do host

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Verificar processos na porta
netstat -ano | findstr :9002  # Windows
lsof -i :9002                 # Linux/Mac

# Matar processo
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### Problemas de cache

```bash
# Rebuild sem cache
docker-compose build --no-cache dev

# Limpar volumes
docker-compose down -v
docker-compose up --build dev
```

### Erro de variáveis de ambiente

1. Verifique se o arquivo `.env` existe
2. Confirme que todas as variáveis estão preenchidas
3. Reinicie o container após alterar `.env`

```bash
docker-compose down
docker-compose up dev
```

## 📊 Comparação: Desenvolvimento vs Produção

| Característica | Desenvolvimento | Produção |
|----------------|-----------------|----------|
| Porta | 9002 | 3000 |
| Hot Reload | ✅ Sim | ❌ Não |
| Volumes | ✅ Sync local | ❌ Build fixo |
| Tamanho | ~500MB | ~150MB |
| Build Time | Rápido | Otimizado |
| NODE_ENV | development | production |

## 🔄 Workflow Recomendado

### Para Desenvolvimento

```bash
# 1. Configure o .env
cp .env.example .env
# Edite .env com suas credenciais

# 2. Inicie o container
docker-compose up dev

# 3. Desenvolva normalmente
# O código será sincronizado automaticamente

# 4. Ao finalizar
docker-compose down
```

### Para Deploy

```bash
# 1. Build da imagem de produção
docker-compose build prod

# 2. Teste localmente
docker-compose up prod

# 3. Tag e push para registry
docker tag atlas-prod seu-registry/atlas:latest
docker push seu-registry/atlas:latest

# 4. Deploy no servidor
# (usando Kubernetes, Docker Swarm, etc.)
```

## 📚 Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Next.js com Docker](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose](https://docs.docker.com/compose/)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs -f dev`
2. Consulte a seção de Troubleshooting acima
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para o projeto Atlas**
