# Atlas Cívico v3

Uma plataforma moderna para visualização e análise de dados cívicos, desenvolvida com as mais recentes tecnologias web.

## 📸 Preview da Aplicação

<img width="1857" height="932" alt="Atlas Cívico v3 - Interface Principal" src="https://github.com/user-attachments/assets/562bee56-3cd2-427a-bbd9-4ed6593ec853" />

*Interface principal do Atlas Cívico v3 mostrando o mapa interativo de Santa Maria-DF com ocorrências reportadas pela comunidade*

## 🎯 Conceito do Projeto

**Atlas Cívico v3** (anteriormente "Santa Maria Ativa") é uma plataforma web interativa para engajamento cívico e transparência urbana.

### ✨ Funcionalidades Principais:
- 🗺️ **Mapa Interativo**: Visualização de pontos de interesse e questões urbanas reportadas
- 📋 **Relatório de Questões**: Sistema para cidadãos reportarem problemas urbanos com descrições e fotos
- 📊 **Acompanhamento de Solicitações**: Ferramenta para rastrear o status das questões reportadas
- 🔍 **Busca de Dados Cívicos**: Funcionalidade de pesquisa para explorar dados públicos
- 🤖 **Categorização com IA**: Ferramenta de IA para sugerir categorias automaticamente
- 👤 **Sistema de Autenticação**: Login seguro via Firebase Auth
- 📱 **Design Responsivo**: Interface adaptada para desktop, tablet e mobile
- 🎨 **Modo Escuro/Claro**: Alternância de temas para melhor experiência

### 🎨 Design System:
- **Cor Primária**: Verde esmeralda (#28A745) - simboliza comunidade e crescimento
- **Cor de Fundo**: Cinza claro (#E9ECEF) - fundo neutro e limpo
- **Cor de Destaque**: Verde vibrante (#34C924) - elementos interativos
- **Tipografia**: 'PT Sans' - fonte humanista para comunicação clara

## 🚀 Tecnologias Utilizadas

### Frontend Core
- **[Next.js 15](https://nextjs.org/)** - Framework React para produção
  - *Por que?* Oferece renderização server-side, otimização automática, roteamento intuitivo e excelente performance
- **[React 18](https://react.dev/)** - Biblioteca para interfaces de usuário
  - *Por que?* Ecossistema maduro, componentes reutilizáveis e excelente experiência de desenvolvimento
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
  - *Por que?* Maior segurança no código, melhor IntelliSense e detecção precoce de erros

### Estilização & UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
  - *Por que?* Desenvolvimento rápido, design consistente e fácil manutenção
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis e não estilizados
  - *Por que?* Acessibilidade nativa, componentes robustos e totalmente customizáveis
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones moderna
  - *Por que?* Ícones consistentes, leves e facilmente customizáveis

### Mapas & Visualização
- **[Leaflet](https://leafletjs.com/)** + **[React Leaflet](https://react-leaflet.js.org/)** - Mapas interativos
  - *Por que?* Biblioteca de mapas leve, flexível e com amplo suporte da comunidade
- **[Recharts](https://recharts.org/)** - Gráficos e visualizações
  - *Por que?* Integração nativa com React, gráficos responsivos e altamente customizáveis

### Backend & Dados
- **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service
  - *Por que?* Configuração rápida, real-time database, autenticação integrada e hosting
- **[Google AI Genkit](https://firebase.google.com/docs/genkit)** - Integração com IA
  - *Por que?* Facilita integração com modelos de IA do Google para análises avançadas

### Formulários & Validação
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
  - *Por que?* Performance superior, validação flexível e menor re-renderização
- **[Zod](https://zod.dev/)** - Schema validation
  - *Por que?* Type-safe validation, integração com TypeScript e APIs simples

### Desenvolvimento
- **[Turbopack](https://turbo.build/pack)** - Bundler ultrarrápido
  - *Por que?* Build times muito menores comparado ao Webpack tradicional

## 🏃‍♂️ Como Executar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start
```

### 🐳 Docker

#### Opção 1: Docker Compose (Recomendado)

```bash
# Desenvolvimento com hot-reload
npm run docker:dev

# Produção
npm run docker:prod

# Parar containers
npm run docker:stop

# Limpar containers e volumes
npm run docker:clean
```

#### Opção 2: Docker Manual

```bash
# Build da imagem
npm run docker:build

# Executar container
npm run docker:run
```

#### Comandos Docker Diretos

```bash
# Desenvolvimento
docker-compose up atlas-dev

# Produção
docker-compose up atlas-app

# Background
docker-compose up -d atlas-dev

# Ver logs
docker-compose logs -f atlas-dev

# Parar tudo
docker-compose down
```

## 📁 Estrutura do Projeto

```
src/
├── app/          # App Router do Next.js
├── components/   # Componentes React reutilizáveis
├── hooks/        # Custom hooks
├── lib/          # Utilitários e configurações
└── ai/           # Integração com IA
```

Para começar, explore o arquivo `src/app/page.tsx`.
