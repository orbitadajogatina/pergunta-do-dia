# Pergunta do Dia Bot(v1.1.1)

O **Pergunta do Dia Bot** é um bot projetado para servidores Discord, permitindo a interação diária entre membros por meio de perguntas cuidadosamente selecionadas. Este guia detalhado abrange desde como configurar o bot até colaborar com seu código via forks e contribuições

## Descrição Geral

O **Pergunta do Dia Bot** envia perguntas diárias para um canal designado em seu servidor Discord, fomentando conversas, debates e trocas de ideias entre os membros. É uma ferramenta ideal para fortalecer comunidades e conhecer as opiniões das pessoas de forma divertida e interativa.

## Funcionalidades

- **Envio Automático de Perguntas**: Uma pergunta nova por dia no canal designado.
- **Personalização por Administradores**: Possibilidade de curar ou sugerir tópicos.
- **Integração com APIs**: Permite a obtenção de perguntas diversificadas.
- **Configuração Simples**: Fácil de instalar e configurar em qualquer servidor.

## Pré-requisitos

1. **Node.js**: Versão 16 ou superior.
2. **NPM**: Gerenciador de pacotes para instalar as dependências.
3. **Git**: Necessário para clonar e contribuir com o repositório.
4. **Conta no Discord Developer Portal**: Para criar e registrar o bot.

## Instalação e Configuração

### 1. Criar o Bot no Discord Developer Portal

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em "New Application" e forneça um nome para o bot.
3. Vá para a aba **Bot** e clique em "Add Bot".
4. Copie o **Token** do bot, pois será usado na configuração.

### 2. Clonar o Repositório

Use o Git para clonar o repositório do projeto:

```bash
git clone https://github.com/orbitadajogatina/pergunta-do-dia.git
cd pergunta-do-dia
```

### 3. Instalar Dependências

No diretório do projeto, instale as dependências necessárias:

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` no diretório raiz do projeto e adicione as seguintes variáveis:

```env
DISCORD_TOKEN=seu-token-do-discord
DISCORD_CLIENT_ID=seu-client-id
SUPABASE_TOKEN=seu-token-supabase
MANAGE_CHANNEL_ID=id-do-canal-de-gerenciamento
QUESTIONS_CHANNEL_ID=id-do-canal-de-perguntas
EMOJI_GUILD_ID=id-do-servidor-de-emojis
ROLE_ID=id-do-cargo-para-usuários
ADMIN_GUILD_ID=id-do-servidor-administrativo
ADMIN_ROLE_ID=id-do-cargo-administrativo
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

O bot possui uma API para gerenciar perguntas e outras funcionalidades. Consulte a [documentação oficial da API](https://orbitadajogatina.mintlify.app/introduction) para mais detalhes.

## Solução de Problemas

### Problema 1: Bot não conecta ao Discord

- Verifique se o token no `.env` está correto.
- Confirme que o bot foi adicionado ao servidor com as permissões corretas.

### Problema 2: Dependências não instalam

- Certifique-se de que o Node.js e o NPM estão atualizados.
- Use `npm install --force` para forçar a instalação.
