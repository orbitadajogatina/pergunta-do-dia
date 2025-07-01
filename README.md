<div align="center">
   <img src="/public/logo.png" width="100" height="100" />
   
   # Pergunta do Dia (v1.2.6)
   
   O **Pergunta do Dia** é um bot projetado para servidores Discord, permitindo a interação diária entre membros por meio de perguntas cuidadosamente selecionadas. Ele envia perguntas diárias para um canal designado em seu servidor Discord, fomentando conversas, debates e trocas de ideias entre os membros. É uma ferramenta ideal para fortalecer comunidades e conhecer as opiniões das pessoas de forma divertida e interativa.
</div>

## Funcionalidades

- **Envio Automático de Perguntas**: Uma pergunta nova por dia no canal designado às 12h.
- **Controle Total**: Cada pergunta deve ser previamente aprovada por um administrador.
- **Integração com APIs**: Caso as perguntas acabem, o bot vai gerar, automaticamente, perguntas com base em APIs de terceiros.
- **Configuração Simples**: Fácil de instalar e configurar em qualquer servidor.

## Pré-requisitos

1. **Node.js**: Versão 16 ou superior.
2. **npm**: Gerenciador de pacotes para instalar as dependências.
3. **Git**: Necessário para clonar e contribuir com o repositório.
4. **Conta no Discord Developer Portal**: Para criar e registrar o bot.
5. **Conta na Supabase**: O banco de dados gira todo em torno do SDK da Supabase.

## Instalação e Configuração

### 1. Criar o Bot no Discord Developer Portal

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em "New Application" e forneça um nome para o bot.
3. Vá para a aba **Bot** e clique em "Add Bot".
4. Copie o **Token** do bot, pois será usado na configuração.

### 2. Criar um Banco de Dados na Supabase

### 3. Clonar o Repositório

Use o Git para clonar o repositório do projeto:

```bash
git clone https://github.com/orbitadajogatina/pergunta-do-dia.git
cd pergunta-do-dia
```

### 4. Instalar Dependências

No diretório do projeto, instale as dependências necessárias:

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` no diretório raiz do projeto e adicione as seguintes variáveis:

```env
DISCORD_TOKEN=token-do-bot-obtido-no-portal-do-discord
DISCORD_CLIENT_ID=client-id-obtido-no-portal-do-discord
SUPABASE_TOKEN=seu-token-supabase
MANAGE_CHANNEL_ID=id-do-canal-de-gerenciamento-de-perguntas
QUESTIONS_CHANNEL_ID=id-do-canal-de-envio-de-perguntas
EMOJI_GUILD_ID=id-do-servidor-para-salvar-emojis-personalizados
USERS_ROLE_ID=id-do-cargo-para-mencionar-usuários
ADMIN_GUILD_ID=id-do-servidor-de-gerenciamento-de-perguntas
ADMIN_ROLE_ID=id-do-cargo-de-gerenciamento-de-perguntas
BACKUP_CHANNEL_ID=id-do-canal-de-backup-do-banco-de-dados
SUPER_ADMIN_ID=id-do-administrador-principal
SUPER_ADMIN_NAME=nome-do-administrador-principal
```

> Mais dúvidas use de base o arquivo [`.env.example`](/.env.example)

## **Executando o Bot**

Após configurar as variáveis de ambiente:

1. Compile e execute o bot com o comando:

   ```bash
   npm start
   ```

2. Verifique no Discord se o bot está online e conectado ao servidor.

## **API do Bot**

O bot possui uma API para gerenciar perguntas e outras funcionalidades. Consulte a [documentação oficial da API](https://rbitadajogatina.mintlify.app/introduction) para mais detalhes.

## Solução de Problemas

### Problema 1: Bot não conecta ao Discord

- Verifique se o token no `.env` está correto.
- Confirme que o bot foi adicionado ao servidor com as permissões corretas.

### Problema 2: Dependências não instalam

- Certifique-se de que o Node.js e o npm estão atualizados.
- Use `npm install --force` para forçar a instalação.
