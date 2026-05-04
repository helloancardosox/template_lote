# Template Lote - Infobip

Aplicacao web com backend Express para criar templates de WhatsApp em lote na Infobip.

O projeto tem endpoints HTTP proprios, usados pela tela, e tambem chama as APIs da Infobip por baixo dos panos. O fluxo direto pela Meta/Graph API esta desativado no codigo atual.

## Configuração

### Instalar dependências
```terminal
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
INFOBIP_API_KEY=SEU_TOKEN_AQUI
INFOBIP_BASE_URL=seu-subdominio.api-us.infobip.com
PORT=3001
```

Os senders nao ficam no `.env`. A tela carrega os remetentes dinamicamente da conta Infobip/WhatsApp e o template so pode ser criado depois que um sender for selecionado.

## Executar

### Desenvolvimento
```terminal
npm run dev
```

### Produção
```terminal
npm start
```

## Ngrok (túnel público)

Se o `ngrok` não abre e aparece `ERR_NGROK_4018`, isso significa que você precisa de uma conta verificada e configurar o `authtoken`.

### 1) Configurar authtoken (uma vez)

- Crie/valide sua conta no painel do ngrok.
- Copie o token em: https://dashboard.ngrok.com/get-started/your-authtoken
- No PowerShell, rode:

```terminal
ngrok config add-authtoken SEU_TOKEN_AQUI
```

Observação: prefira esse comando (ele salva no config do usuário). Evite colocar o token dentro do repositório.

### 2) Subir o servidor e o tunel

#### Jeito 1 (2 terminais)

1. Terminal 1 (subir servidor):

```terminal
npm run dev
```

2. Terminal 2 (subir ngrok para a porta 3001):

```terminal
ngrok http 3001 --pooling-enabled
```

No plano Free, ao abrir a URL no navegador, pode aparecer uma tela de aviso do ngrok pedindo para clicar em “Visit Site”.

1. Suba o servidor:

```terminal
npm run dev
```

2. Em outro terminal, suba o ngrok usando a config local deste projeto:

```terminal
ngrok start --all --config=ngrok-local.yml
```

O túnel aponta para a porta `3001` (ajuste `PORT` no `.env` e/ou o `addr` em `ngrok-local.yml` se mudar a porta).

Dica: a UI local do ngrok costuma ser `http://127.0.0.1:4040`; se essa porta estiver ocupada, ele troca para `4041`, `4042`, etc.

## Endpoints

Esses endpoints sao do backend local deste projeto.

### Health Check
```
GET /health
```

### Listar Senders
```
GET /api/senders
```

### Criar Templates em Lote (Infobip)
```
POST /api/templates/infobip
Content-Type: application/json

{
  "sender": "SEU_NUMERO_WHATSAPP_SENDER", // Obrigatorio: selecionado da lista dinamica
  "templates": [
    {
      "name": "campanha_promocional",
      "language": "pt_BR",
      "category": "UTILITY",
      "structure": {
        "body": {
          "text": "Olá {{1}}, confira nossas ofertas!",
          "examples": ["Cliente"]
        },
        "type": "TEXT" 
      } 
    }
  ]
}
```

