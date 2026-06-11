<div align="center">
  <h1>⚡ FinanceFlow</h1>
  <p>Aplicação web completa de gerenciamento financeiro pessoal</p>

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Recharts-2-FF6384?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</div>

---

## 📸 Preview

> Dashboard com visão completa das finanças, gráficos interativos e controle total de transações.

---

## ✨ Funcionalidades

- **Dashboard** — saldo total, receitas, despesas, gráfico de barras mensal e últimas transações
- **Transações** — CRUD completo com filtros por tipo, categoria, data e busca por texto
- **Importação OFX** — lê extratos bancários e detecta categorias automaticamente por palavras-chave
- **Relatórios** — gráficos mensais (barras e linhas), pizza por categoria e comparativo mês atual vs anterior
- **Exportação CSV** — exporta todas as transações para planilha
- **Autenticação** — login e cadastro com proteção de rotas
- **Persistência** — dados salvos no LocalStorage, sem necessidade de backend
- **Responsivo** — layout adaptado para mobile, tablet e desktop
- **Dark theme** — design moderno inspirado em Nubank, Inter e Stripe

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **ReactJS 18** | Biblioteca principal — componentes e hooks |
| **Vite** | Bundler ultrarrápido para desenvolvimento |
| **React Router DOM** | Navegação SPA com rotas protegidas |
| **Context API** | Gerenciamento de estado global |
| **Tailwind CSS** | Estilização utility-first |
| **Recharts** | Gráficos interativos (Bar, Line, Pie) |
| **Axios** | Cliente HTTP (preparado para backend) |
| **Date-fns** | Manipulação e formatação de datas em pt-BR |
| **UUID** | Geração de IDs únicos |
| **React Hot Toast** | Notificações elegantes |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 20.19+ ou 22.12+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/financeflow.git

# Entre na pasta
cd financeflow

# Instale as dependências
npm install

# Rode o projeto
npm run dev
```

Acesse **http://localhost:5173**

### Login de demonstração

```
E-mail:  alex@financeflow.app
Senha:   123456
```

---

## 📁 Estrutura do projeto

```
src/
├── components/        # Componentes reutilizáveis
│   ├── Button/
│   ├── Card/
│   ├── Charts/        # BarChart, LineChart, PieChart
│   ├── Header/
│   ├── Input/
│   ├── Modal/
│   ├── Sidebar/
│   └── Table/
├── context/           # Estado global
│   ├── AuthContext    # Autenticação
│   └── FinanceContext # Transações e resumo financeiro
├── hooks/             # Hooks customizados
│   ├── useFinance     # Acesso ao contexto + filtros + gráficos
│   └── useLocalStorage
├── pages/             # Telas da aplicação
│   ├── Dashboard/
│   ├── Login/
│   ├── Register/
│   ├── Reports/
│   ├── Settings/
│   └── Transactions/
├── routes/            # Configuração de navegação + rotas protegidas
├── services/          # Axios (preparado para API real)
├── utils/             # Funções puras (formatação, cálculos, CSV)
├── constants/         # Categorias e tipos de transação
└── layouts/           # MainLayout (Sidebar + Header + Outlet)
```

---

## 🏗️ Arquitetura

O projeto segue o padrão de **separação de responsabilidades**:

```
pages/        → orquestra dados e componentes
components/   → apresentação visual, recebe dados via props
context/      → estado global e CRUD
hooks/        → lógica de negócio isolada
utils/        → funções puras sem efeitos colaterais
```

---

## 🔌 Versão Fullstack (branch `feature/backend`)

Este repositório também possui uma versão completa com backend real:

- **Node.js + Express** — API REST
- **Prisma ORM + PostgreSQL** — banco de dados relacional
- **JWT + bcrypt** — autenticação segura
- **Dados isolados por usuário** — cada conta vê apenas suas transações

Para acessar:
```bash
git checkout feature/backend
```

---

## 📄 Licença

MIT © 2025
