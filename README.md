# 🗺️ Atlas Cívico - Plataforma de Participação Cidadã

![Atlas Cívico - Interface Principal](docs/images/atlas-civico-preview.png)

<div align="center">

**Uma plataforma moderna para mapear e resolver problemas urbanos em sua comunidade**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Ver Demo](#) • [📖 Documentação](#documentação) • [🐛 Reportar Bug](https://github.com/brunoestevaooliveira/atlas-versao-3/issues)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias-utilizadas)
- [Tutorial Completo para Iniciantes](#-tutorial-completo-para-iniciantes)
  - [1. Instalando o Node.js](#1️⃣-passo-1-instalar-o-nodejs)
  - [2. Instalando o Git](#2️⃣-passo-2-instalar-o-git)
  - [3. Baixando o Projeto](#3️⃣-passo-3-baixar-o-projeto)
  - [4. Configurando o Firebase](#4️⃣-passo-4-configurar-o-firebase)
  - [5. Iniciando o Projeto](#5️⃣-passo-5-iniciar-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação Adicional](#-documentação-adicional)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 📌 Sobre o Projeto

O **Atlas Cívico** é uma plataforma web desenvolvida para transformar a participação cidadã através da tecnologia. Com ela, você pode:

🗺️ **Mapear problemas urbanos** - Identifique e registre ocorrências como buracos, falta de iluminação, acúmulo de lixo e mais.

📊 **Visualizar dados em tempo real** - Acompanhe estatísticas e gráficos sobre os problemas reportados.

👥 **Engajar a comunidade** - Apoie reportes de outros cidadãos e comente sobre as ocorrências.

🎯 **Facilitar gestão pública** - Dashboard exclusivo para administradores analisarem e priorizarem soluções.

> **💡 Desenvolvido como TCC**, este projeto aplica as tecnologias web mais modernas para resolver um problema real de participação cívica na cidade de Santa Maria-DF.

---

## ✨ Funcionalidades

### Para Cidadãos
- ✅ Cadastro e login seguro com Firebase Authentication
- ✅ Mapa interativo para visualizar ocorrências
- ✅ Reportar novos problemas com foto e localização
- ✅ Apoiar (dar "like") em reportes existentes
- ✅ Comentar e acompanhar o status das ocorrências
- ✅ Tema claro/escuro
- ✅ Interface responsiva (funciona em celular, tablet e desktop)

### Para Administradores
- ✅ Dashboard com estatísticas em tempo real
- ✅ Gráficos de análise de dados
- ✅ Gerenciamento de ocorrências
- ✅ Alteração de status dos problemas reportados
- ✅ Visão geral da situação urbana

---

## 🚀 Tecnologias Utilizadas

### Frontend
| Tecnologia | Descrição |
|------------|-----------|
| ![Next.js](https://img.shields.io/badge/-Next.js-black?logo=next.js&style=flat-square) | Framework React para aplicações modernas |
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square) | Biblioteca para interfaces de usuário |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) | JavaScript com tipagem estática |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square) | Framework CSS utilitário |
| ![shadcn/ui](https://img.shields.io/badge/-shadcn/ui-000000?logo=shadcnui&logoColor=white&style=flat-square) | Componentes de UI acessíveis |

### Backend & Serviços
| Tecnologia | Descrição |
|------------|-----------|
| ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase&logoColor=black&style=flat-square) | Autenticação e banco de dados |
| ![Firestore](https://img.shields.io/badge/-Firestore-FFCA28?logo=firebase&logoColor=black&style=flat-square) | Banco de dados NoSQL em tempo real |

### Mapas & Visualização
| Tecnologia | Descrição |
|------------|-----------|
| ![Leaflet](https://img.shields.io/badge/-Leaflet-199900?logo=leaflet&logoColor=white&style=flat-square) | Biblioteca para mapas interativos |
| ![Recharts](https://img.shields.io/badge/-Recharts-8884d8?style=flat-square) | Gráficos e dashboards |

### Formulários & Validação
| Tecnologia | Descrição |
|------------|-----------|
| ![React Hook Form](https://img.shields.io/badge/-React%20Hook%20Form-EC5990?logo=reacthookform&logoColor=white&style=flat-square) | Gerenciamento de formulários |
| ![Zod](https://img.shields.io/badge/-Zod-3E67B1?logo=zod&logoColor=white&style=flat-square) | Validação de schemas TypeScript |

---

## 🎓 Tutorial Completo para Iniciantes

> **👋 Nunca programou antes? Sem problemas!** Este tutorial vai te guiar passo a passo, desde a instalação das ferramentas até ter o projeto rodando no seu computador.

---

### 1️⃣ **PASSO 1: Instalar o Node.js**

O Node.js é necessário para rodar o projeto. Ele é como o "motor" que faz tudo funcionar.

#### **Windows:**

1. **Acesse**: https://nodejs.org/
2. **Baixe** a versão **LTS** (recomendada - botão verde)
3. **Execute** o instalador baixado (`.msi`)
4. **Clique** em "Next" até finalizar (deixe todas as opções padrão)
5. **Verifique** se instalou corretamente:
   - Abra o **Prompt de Comando** (tecla Windows + R, digite `cmd`, Enter)
   - Digite: `node --version`
   - Deve aparecer algo como: `v20.x.x` ✅

#### **Mac:**

1. **Acesse**: https://nodejs.org/
2. **Baixe** a versão **LTS**
3. **Execute** o instalador `.pkg`
4. **Verifique** no Terminal: `node --version`

#### **Linux (Ubuntu/Debian):**

```bash
# Instale via terminal
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifique
node --version
```

---

### 2️⃣ **PASSO 2: Instalar o Git**

O Git é necessário para baixar o código do projeto do GitHub.

#### **Windows:**

1. **Acesse**: https://git-scm.com/download/win
2. **Baixe** o instalador
3. **Execute** e clique em "Next" até finalizar (deixe opções padrão)
4. **Verifique**: 
   - Abra o **Prompt de Comando**
   - Digite: `git --version`
   - Deve aparecer: `git version 2.x.x` ✅

#### **Mac:**

```bash
# Instale via Homebrew
brew install git

# Ou baixe em: https://git-scm.com/download/mac
```

#### **Linux:**

```bash
sudo apt-get install git
```

---

### 3️⃣ **PASSO 3: Baixar o Projeto**

Agora vamos baixar o código do Atlas Cívico para o seu computador.

#### **Opção A: Usando o Terminal/Prompt (Recomendado)**

1. **Abra** o Prompt de Comando (Windows) ou Terminal (Mac/Linux)

2. **Navegue** até a pasta onde quer salvar o projeto:
   ```bash
   # Exemplo: salvar na pasta Documentos
   cd Documentos
   ```

3. **Baixe** o projeto:
   ```bash
   git clone https://github.com/brunoestevaooliveira/atlas-versao-3.git
   ```

4. **Entre** na pasta do projeto:
   ```bash
   cd atlas-versao-3
   ```

#### **Opção B: Baixando o ZIP (Mais fácil para iniciantes)**

1. **Acesse**: https://github.com/brunoestevaooliveira/atlas-versao-3
2. **Clique** no botão verde `Code` (canto superior direito)
3. **Clique** em `Download ZIP`
4. **Extraia** o arquivo ZIP para uma pasta de sua escolha
5. **Abra** o Prompt de Comando/Terminal e navegue até a pasta:
   ```bash
   cd caminho/para/atlas-versao-3
   ```

---

### 4️⃣ **PASSO 4: Configurar o Firebase**

O Firebase é usado para autenticação e banco de dados. Você precisa criar uma conta e pegar suas chaves.

#### **4.1 - Criar Conta no Firebase**

1. **Acesse**: https://console.firebase.google.com/
2. **Faça login** com sua conta Google
3. **Clique** em "Adicionar projeto"
4. **Dê um nome** ao projeto (ex: "atlas-civico-seu-nome")
5. **Desabilite** o Google Analytics (não é necessário)
6. **Clique** em "Criar projeto"

#### **4.2 - Configurar Autenticação**

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Ative o método **"E-mail/senha"**
4. Clique em **"Salvar"**

#### **4.3 - Configurar Firestore (Banco de Dados)**

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (por enquanto)
4. Escolha a localização mais próxima (ex: `southamerica-east1`)
5. Clique em **"Ativar"**

#### **4.4 - Pegar as Chaves do Firebase**

1. Clique no **ícone de engrenagem** (⚙️) no canto superior esquerdo
2. Clique em **"Configurações do projeto"**
3. Role até a seção **"Seus apps"**
4. Clique no ícone **`</>`** (Web)
5. Dê um apelido (ex: "atlas-civico-web")
6. **NÃO marque** "Firebase Hosting"
7. Clique em **"Registrar app"**
8. **COPIE** o objeto `firebaseConfig` que aparece

Vai parecer com isso:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### **4.5 - Configurar as Variáveis de Ambiente**

1. **Abra** a pasta do projeto no Windows Explorer ou Finder
2. **Localize** o arquivo `.env.example`
3. **Copie** esse arquivo e **renomeie** a cópia para `.env`
4. **Abra** o arquivo `.env` com um editor de texto (Bloco de Notas, VS Code, etc.)
5. **Preencha** com os valores do seu Firebase:

```env
# Credenciais do Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789

# Chave de API do Mapbox (use a fornecida ou crie a sua)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW90c29uaSIsImEiOiJjbWZva3hlY3QwNngzMmpvZmF3czl5Z2xuIn0.MD57O97tNzThIIix4oknUg
```

6. **Salve** o arquivo

> **⚠️ IMPORTANTE:** O arquivo `.env` contém suas chaves privadas. NUNCA compartilhe esse arquivo publicamente!

---

### 5️⃣ **PASSO 5: Iniciar o Projeto**

Agora vamos instalar as dependências e rodar o projeto!

#### **5.1 - Instalar Dependências**

No terminal/prompt (dentro da pasta do projeto), execute:

```bash
npm install
```

> **⏳ Aguarde**: Esse processo pode demorar alguns minutos. O npm está baixando todas as bibliotecas necessárias (são muitas!).

Você vai ver muitas linhas no terminal. Quando terminar, verá algo como:
```
added 1234 packages in 2m
```

#### **5.2 - Iniciar o Servidor de Desenvolvimento**

Ainda no terminal, execute:

```bash
npm run dev
```

Você verá algo como:
```
▲ Next.js 15.3.3
- Local:        http://localhost:9002
- Network:      http://192.168.1.7:9002

✓ Ready in 1.2s
```

#### **5.3 - Abrir no Navegador**

1. **Abra** seu navegador (Chrome, Firefox, Edge, Safari)
2. **Acesse**: http://localhost:9002
3. **Pronto!** O Atlas Cívico está rodando! 🎉

---

### 🎉 **Parabéns! Você conseguiu!**

Se tudo deu certo, você verá a tela de login do Atlas Cívico. Agora você pode:

1. **Criar uma conta** clicando em "Cadastrar"
2. **Fazer login** com seu e-mail e senha
3. **Explorar o mapa** e reportar ocorrências
4. **Testar** todas as funcionalidades

---

### ⚠️ **Problemas Comuns e Soluções**

<details>
<summary><b>❌ Erro: "node não é reconhecido como comando"</b></summary>

**Solução:**
- Feche e abra novamente o Prompt de Comando/Terminal
- Se o erro persistir, reinstale o Node.js e marque a opção "Add to PATH"
</details>

<details>
<summary><b>❌ Erro: "A variável de ambiente NEXT_PUBLIC_FIREBASE_API_KEY não está configurada"</b></summary>

**Solução:**
- Verifique se criou o arquivo `.env` (sem extensão `.txt`)
- Verifique se as chaves estão corretas e sem espaços extras
- Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)
</details>

<details>
<summary><b>❌ Erro: "Port 9002 is already in use"</b></summary>

**Solução:**
- Outra instância do projeto já está rodando
- Feche o outro terminal ou use `Ctrl+C` para parar
- Ou mude a porta no arquivo `package.json`: `"dev": "next dev -p 3000"`
</details>

<details>
<summary><b>❌ Erro: "Firebase: Error (auth/invalid-api-key)"</b></summary>

**Solução:**
- Sua chave do Firebase está incorreta
- Volte ao console do Firebase e copie novamente
- Certifique-se de não ter espaços ou caracteres extras
</details>

<details>
<summary><b>❌ O mapa não aparece</b></summary>

**Solução:**
- Verifique se a variável `NEXT_PUBLIC_MAPBOX_TOKEN` está configurada no `.env`
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página (F5 ou Ctrl+R)
</details>

---

### 🛑 **Como Parar o Servidor**

Para parar o servidor de desenvolvimento:
- Vá até o terminal onde o projeto está rodando
- Pressione `Ctrl + C`
- Digite `S` se perguntar e pressione Enter

Para iniciar novamente:
```bash
npm run dev
```

---

## 📁 Estrutura do Projeto

```
atlas-civico/
├── 📂 src/                    # Código-fonte da aplicação
│   ├── 📂 app/               # Rotas e páginas (Next.js App Router)
│   │   ├── 📂 (public)/     # Páginas públicas (login, registro)
│   │   ├── 📂 (app)/        # Páginas protegidas (mapa, perfil)
│   │   ├── 📂 admin/        # Dashboard administrativo
│   │   ├── layout.tsx       # Layout principal da aplicação
│   │   └── page.tsx         # Página inicial (/)
│   │
│   ├── 📂 components/        # Componentes React reutilizáveis
│   │   ├── 📂 ui/           # Componentes de UI (shadcn/ui)
│   │   ├── 📂 charts/       # Gráficos do dashboard
│   │   ├── header.tsx       # Cabeçalho da aplicação
│   │   ├── map.tsx          # Mapa interativo (Leaflet)
│   │   └── ...              # Outros componentes
│   │
│   ├── 📂 context/           # Contextos React (estado global)
│   │   └── auth-context.tsx # Contexto de autenticação
│   │
│   ├── 📂 hooks/             # Hooks customizados
│   │   └── use-toast.ts     # Hook para notificações
│   │
│   ├── 📂 lib/               # Utilitários e configurações
│   │   ├── firebase.ts      # Configuração do Firebase
│   │   ├── utils.ts         # Funções auxiliares
│   │   └── types.ts         # Tipos TypeScript
│   │
│   └── 📂 services/          # Lógica de negócio e API
│       └── occurrence-service.ts  # Serviço de ocorrências
│
├── 📂 public/                # Arquivos estáticos (imagens, ícones)
├── 📂 docs/                  # Documentação adicional
│   ├── 📂 images/           # Imagens da documentação
│   ├── DOCKER-SETUP.md      # Guia de Docker
│   ├── PERFORMANCE.md       # Otimizações de performance
│   └── SECURITY-ENV.md      # Segurança de credenciais
│
├── 📄 .env                   # Variáveis de ambiente (NÃO COMMITADO)
├── 📄 .env.example          # Template de variáveis de ambiente
├── 📄 .gitignore            # Arquivos ignorados pelo Git
├── 📄 package.json          # Dependências do projeto
├── 📄 next.config.ts        # Configuração do Next.js
├── 📄 tailwind.config.ts    # Configuração do Tailwind CSS
├── 📄 tsconfig.json         # Configuração do TypeScript
└── 📄 README.md             # Este arquivo
```

### 🔍 **Principais Arquivos e O Que Eles Fazem**

| Arquivo | Descrição |
|---------|-----------|
| `src/app/layout.tsx` | Define a estrutura HTML base e provedores de contexto |
| `src/app/page.tsx` | Página inicial com o mapa interativo |
| `src/lib/firebase.ts` | Configuração e inicialização do Firebase |
| `src/context/auth-context.tsx` | Gerencia o estado de autenticação do usuário |
| `src/components/map.tsx` | Componente do mapa com Leaflet |
| `src/services/occurrence-service.ts` | Funções para criar, ler, atualizar e deletar ocorrências |
| `.env` | Suas chaves privadas (Firebase, Mapbox) |
| `package.json` | Lista todas as dependências do projeto |
| `next.config.ts` | Configurações do Next.js (build, otimizações) |

---

## 📚 Documentação Adicional

Documentos técnicos para desenvolvedores:

- 📘 **[Guia de Docker](docs/DOCKER-SETUP-SUMMARY.md)** - Como usar Docker para desenvolvimento e produção
- 📗 **[Guia de Performance](docs/PERFORMANCE.md)** - Otimizações implementadas no projeto
- 📕 **[Segurança de Credenciais](docs/SECURITY-ENV.md)** - Boas práticas para gerenciar variáveis de ambiente
- 📙 **[Gestão de Variáveis com Docker](docs/DOCKER-ENV-GUIDE.md)** - Guia avançado de configuração

---

## 🐳 Executar com Docker (Opcional)

Se você já tem o Docker instalado, pode rodar o projeto em container:

```bash
# Desenvolvimento
docker-compose up dev

# Produção
docker-compose up -d prod
```

> **📖 Para mais detalhes**, veja o [Guia Completo de Docker](docs/DOCKER-SETUP-SUMMARY.md)

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Se você quer melhorar o Atlas Cívico:

1. Faça um **Fork** do projeto
2. Crie uma **Branch** para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Faça **Commit** das mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça **Push** para a Branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um **Pull Request**

### 📋 **Diretrizes de Contribuição**

- Siga os padrões de código do projeto (ESLint/Prettier)
- Escreva mensagens de commit claras e descritivas
- Teste suas mudanças antes de fazer o pull request
- Documente novas funcionalidades no README

---

## 📝 Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e está disponível para uso educacional.

Para uso comercial ou redistribuição, entre em contato com os autores.

---

## 👨‍💻 Autores

**Bruno Estevão Oliveira**
- GitHub: [@brunoestevaooliveira](https://github.com/brunoestevaooliveira)
- LinkedIn: [Bruno Estevão](https://www.linkedin.com/in/bruno-estevao/)

---

## 🙏 Agradecimentos

- Comunidade de Santa Maria-DF por inspirar este projeto
- Professores e orientadores do curso
- Comunidade open-source pelas ferramentas incríveis
- Todos que contribuíram com feedback e testes

---

## 📞 Suporte

Está com problemas? Tem dúvidas?

- 🐛 **Bugs**: [Abra uma issue](https://github.com/brunoestevaooliveira/atlas-versao-3/issues)
- 💬 **Dúvidas**: [Discussões do GitHub](https://github.com/brunoestevaooliveira/atlas-versao-3/discussions)
- 📧 **E-mail**: [bruno@exemplo.com](mailto:bruno@exemplo.com)

---

<div align="center">

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**

Feito com ❤️ e ☕ para a comunidade de Santa Maria-DF

</div>
