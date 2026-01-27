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
INFOBIP_API_KEY=6780e7b1377596c3f9bc2d224a0234a9-5867bc97-31cc-4296-99a4-b9f447ad0869
INFOBIP_BASE_URL=38x6pj.api-us.infobip.com
INFOBIP_SENDER=seu_numero_whatsapp_sender (ex: 5511999999999)
PORT=3000
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
  "sender": "5511999999999", // Opcional se estiver no .env
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
