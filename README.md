# 💸 nexoCash — Gerenciador de Despesas Compartilhadas

**Powered by Supabase**

Aplicativo móvel para gerenciamento de despesas compartilhadas, desenvolvido com **React Native (Expo)** e **Supabase**.
O **nexoCash** permite que grupos (famílias, colegas, times etc.) organizem gastos em um ambiente *multi-tenant* seguro, utilizando **Row Level Security (RLS)**.

---

## ✅ 1. Visão Geral do Projeto

O **nexoCash** permite que usuários criem ou participem de *Famílias* (*Households*).
Dentro de cada grupo, os membros podem:

* Registrar, editar e excluir despesas
* Visualizar gráficos e estatísticas
* Definir metas de orçamento
* Organizar os gastos de forma colaborativa

A segurança dos dados é garantida com **Row Level Security (RLS)** no Supabase, isolando as informações de cada família.

---

## ✅ 2. Tecnologias Utilizadas

* **React Native (Expo)**
* **Expo Router**
* **Context API (AuthContext)**
* **Supabase** (hospedado na nuvem)
* **Autenticação**
* **PostgreSQL + RLS**
* **APIs automáticas (PostgREST)**
* **react-native-chart-kit**
* **Componentes nativos** (Modal, Picker, FlatList etc.)

---

## ✅ 3. Estrutura de Pastas (Supabase + Migrações)

O projeto utiliza o **Supabase CLI** apenas para gerar e versionar migrações localmente, **sem rodar o banco local**.

```
/supabase
├── config.toml
├── migrations/
└── seed.sql (opcional)
```

> ⚠️ As migrações **não são aplicadas automaticamente** — a aplicação delas é feita manualmente no painel do Supabase.

---

## ✅ 4. Usando Supabase CLI com NPX (sem instalação global)

Para gerar migrações sem instalar o CLI globalmente:

```bash
npx supabase --help
```

Se aparecer a ajuda do CLI, está funcionando corretamente.

Caso precise inicializar a pasta (já existente, apenas como referência):

```bash
npx supabase init
```

---

## ✅ 5. Configuração do `.env` (Expo)

Na raiz do projeto, crie **ou atualize** um arquivo `.env` com as variáveis do Supabase hospedado:

```ini
EXPO_PUBLIC_SUPABASE_URL="https://SEU_PROJETO.supabase.co"
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sua-public-anon-key"
```

Essas informações estão em:
**Supabase Dashboard → Project Settings → API**

O arquivo `client.ts` deve usar essas variáveis.

---

## ✅ 6. Gerando Migrações Locais (sem aplicar automaticamente)

Quando alterar tabelas, RLS ou *policies*, gere uma migração com:

```bash
npx supabase db diff -f nome_da_migracao
```

Isso cria um arquivo `.sql` dentro de:

```bash
/supabase/migrations/
```

**Exemplo de arquivo gerado:**

```bash
supabase/migrations/20250101T120000_adicionar_tabela_expenses.sql
```

---

## ✅ 7. Aplicando Migrações no Supabase (via Painel Web)

Como o banco está hospedado:

1. Acesse o **Painel do Supabase**
2. Vá em **SQL Editor**
3. Abra o arquivo `.sql` dentro de `/supabase/migrations/`
4. Copie o conteúdo
5. Cole no editor
6. Clique em **Run**
7. Confirme no **Table Editor** se o esquema foi atualizado

> ⚠️ **Nunca use estes comandos neste projeto:**
>
> ```bash
> npx supabase db push
> npx supabase db reset
> npx supabase start
> ```
>
> Eles se aplicam apenas a ambientes locais — aqui o banco é **100% na nuvem**.

---

## ✅ 8. Executando o App

```bash
npm install
# ou
yarn install

npx expo start
```

Abra com:

* **Expo Go** (Android/iOS)
* **Emulador / Simulador**

---

## ✅ 9. Fluxo Básico de Uso

1. Login/cadastro via **AuthContext + Supabase**
2. Listagem de famílias
3. Criar ou entrar em uma família
4. Registrar despesas, metas e membros
5. Visualizar gráficos, filtros e estatísticas
6. Editar ou excluir conforme permissões
