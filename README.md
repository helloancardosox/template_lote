# Template Lote - Infobip & Meta

Criação de template em lote utilizando API REST - Infobip e Meta

## Configuração

### Instalar dependências
```bash
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
INFOBIP_API_KEY=SEU_TOKEN_AQUI
INFOBIP_BASE_URL=seu-subdominio.api-us.infobip.com
INFOBIP_SENDER=SEU_NUMERO_WHATSAPP_SENDER
PORT=3001
```

## Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Ngrok (túnel público)

Se o `ngrok` não abre e aparece `ERR_NGROK_4018`, isso significa que você precisa de uma conta verificada e configurar o `authtoken`.

### 1) Configurar authtoken (uma vez)

- Crie/valide sua conta no painel do ngrok.
- Copie o token em: https://dashboard.ngrok.com/get-started/your-authtoken
- No PowerShell, rode:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

Observação: prefira esse comando (ele salva no config do usuário). Evite colocar o token dentro do repositório.

### 2) Subir a API e o túnel

#### Jeito 1 (2 terminais)

1. Terminal 1 (subir servidor):

```bash
npm run dev
```

2. Terminal 2 (subir ngrok para a porta 3001):

```bash
ngrok http 3001 --pooling-enabled
```

No plano Free, ao abrir a URL no navegador, pode aparecer uma tela de aviso do ngrok pedindo para clicar em “Visit Site”.

1. Suba o servidor:

```bash
npm run dev
```

2. Em outro terminal, suba o ngrok usando a config local deste projeto:

```bash
ngrok start --all --config=ngrok-local.yml
```

O túnel aponta para a porta `3001` (ajuste `PORT` no `.env` e/ou o `addr` em `ngrok-local.yml` se mudar a porta).

Dica: a UI local do ngrok costuma ser `http://127.0.0.1:4040`; se essa porta estiver ocupada, ele troca para `4041`, `4042`, etc.

## Endpoints

### Health Check
```
GET /health
```

### Criar Templates em Lote (Infobip)
```
POST /api/templates/infobip
Content-Type: application/json

{
  "sender": "SEU_NUMERO_WHATSAPP_SENDER", // Opcional se estiver no .env
  "templates": [
    {
      "name": "template_promo_verao",
      "language": "pt_BR",
      "category": "MARKETING",
      "structure": {
        "body": {
          "text": "Olá {{1}}, confira nossas ofertas!",
          "examples": ["Cliente"]
        },
        "type": "TEXT" 
      }
    },
    {
      "name": "template_aviso",
      "language": "pt_BR",
      "category": "UTILITY",
      "structure": {
         "body": { "text": "Seu pedido saiu para entrega." }
      }
    }
  ]
}
```


### Criar Templates Meta
```
POST /api/templates/meta
Content-Type: application/json

{
  "templates": [
    {
      "name": "template_name",
      "language": "pt_BR",
      "category": "UTILITY",
      "components": [...]
    }
  ]
}
```
