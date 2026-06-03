# Disparo WS

App web para **disparar mensagens de WhatsApp** a partir de planilhas do
Google Drive — um contato por vez.

Fluxo: o app lê **ao vivo** os arquivos de uma pasta do Google Drive, você
escolhe a planilha, escreve a mensagem, escolhe o contato e o app abre o
**WhatsApp** (Web/Desktop) já com o número e o texto preenchidos — faltando só
clicar em *Enviar*.

> **Sem login de usuário.** O acesso ao Drive é feito apenas com uma **API
> Key**, então a pasta precisa estar compartilhada como *"Qualquer pessoa com o
> link pode ver"*.

## Stack

- TypeScript (strict) + React 18.3
- Vite
- Tailwind CSS + Radix UI + shadcn/ui + lucide-react
- TanStack React Query 5
- React Hook Form 7 + Zod 3
- React Router 6
- SheetJS (`xlsx`) para ler as planilhas

## Pré-requisitos

1. **Pasta do Drive pública (por link).** No Google Drive, clique com o botão
   direito na pasta → *Compartilhar* → "Acesso geral" → **Qualquer pessoa com o
   link** (função *Leitor*).

2. **API Key do Google Cloud:**
   - Acesse <https://console.cloud.google.com/> e crie/selecione um projeto.
   - *APIs e serviços* → *Biblioteca* → ative a **Google Drive API**.
   - *APIs e serviços* → *Credenciais* → *Criar credenciais* → **Chave de API**.
   - (Recomendado) Restrinja a chave à **Google Drive API** e, em
     *Restrições de aplicativo*, limite por *Referenciadores HTTP* aos domínios
     onde o app vai rodar (ex.: `http://localhost:5173/*`).

## Configuração

```bash
cp .env.example .env
```

Edite o `.env`:

```env
VITE_GOOGLE_API_KEY=sua_api_key
VITE_DRIVE_FOLDER_ID=1TcjOORLTuv7YGPIHdgXI9tb0xiVQP3VA
```

O `VITE_DRIVE_FOLDER_ID` é a parte da URL da pasta depois de `/folders/`.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
```

Build de produção:

```bash
npm run build
npm run preview
```

## Como usar

1. Abra o app — ele lista os arquivos da pasta configurada.
2. Clique em **Abrir** numa planilha.
3. Escreva a mensagem. Você pode usar variáveis:
   - `{{nome}}` — nome completo do contato
   - `{{primeiro_nome}}` — primeiro nome
   - `{{email}}` — e-mail
4. Encontre o contato (há busca por nome/email/telefone) e clique em
   **WhatsApp**. Uma nova aba abre o WhatsApp com tudo preenchido.

## Sobre os telefones da planilha

Os números costumam vir bagunçados (notação científica do Excel, com/sem o
`55`, vazios etc.). O app **normaliza** para o formato internacional
(`55` + DDD + número). Contatos cujo telefone não pôde ser interpretado
aparecem marcados e com o botão de envio desabilitado.

## Estrutura

```
src/
├── components/        # UI (shadcn) e componentes da tela
│   └── ui/
├── hooks/             # React Query (Drive + planilha)
├── lib/               # drive, sheet, phone, whatsapp, config, utils
├── pages/             # FilesPage, WorkspacePage
├── types/             # tipos compartilhados
├── App.tsx            # rotas
└── main.tsx           # bootstrap
```
