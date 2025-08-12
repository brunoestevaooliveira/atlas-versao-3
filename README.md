# Atlas Cívico v3

Uma plataforma moderna para visualização e análise de dados cívicos, desenvolvida com as mais recentes tecnologias web.

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
