# 📱 Template Lote - Infobip WhatsApp Template Manager

Criação de templates WhatsApp em lote utilizando API REST da Infobip com conversão de formatos Meta/WhatsApp.

## 🚀 Recursos

- ✅ Servidor localhost para desenvolvimento
- ✅ Integração completa com API REST da Infobip
- ✅ Conversão automática entre formatos Meta e Infobip
- ✅ Criação de templates em lote
- ✅ Interface web para gerenciamento
- ✅ Validação de templates
- ✅ Envio de mensagens via templates
- ✅ Exemplos prontos para uso

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Conta Infobip com acesso à API
- Credenciais de API da Infobip

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/helloancardosox/template_lote.git
cd template_lote
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:
```env
INFOBIP_API_KEY=sua_api_key_aqui
INFOBIP_BASE_URL=https://api.infobip.com
INFOBIP_SENDER=seu_numero_sender
META_BUSINESS_ACCOUNT_ID=seu_business_account_id
META_WABA_ID=seu_waba_id
PORT=3000
NODE_ENV=development
```

## 🏃 Como Executar

### Modo Desenvolvimento (com watch)
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

## 📡 Endpoints da API

### Templates Infobip

#### Listar todos os templates
```http
GET /api/infobip/templates
```

#### Obter template específico
```http
GET /api/infobip/templates/:name
```

#### Criar template
```http
POST /api/infobip/templates
Content-Type: application/json

{
  "name": "welcome_message",
  "language": "pt_BR",
  "category": "MARKETING",
  "structure": {
    "type": "TEXT",
    "body": {
      "text": "Olá {{1}}! Bem-vindo!",
      "examples": [["João"]]
    }
  }
}
```

#### Criar templates em lote
```http
POST /api/infobip/templates/batch
Content-Type: application/json

{
  "templates": [
    { "name": "template1", ... },
    { "name": "template2", ... }
  ]
}
```

#### Deletar template
```http
DELETE /api/infobip/templates/:name
```

#### Enviar mensagem
```http
POST /api/infobip/send
Content-Type: application/json

{
  "messages": [{
    "from": "seu_numero",
    "to": "numero_destino",
    "content": {
      "templateName": "welcome_message",
      "templateData": {
        "body": {
          "placeholders": ["João"]
        }
      },
      "language": "pt_BR"
    }
  }]
}
```

### Conversão de Templates

#### Converter Meta para Infobip
```http
POST /api/templates/convert/meta-to-infobip
Content-Type: application/json

{
  "name": "template_name",
  "language": "pt_BR",
  "components": [...]
}
```

#### Converter Infobip para Meta
```http
POST /api/templates/convert/infobip-to-meta
Content-Type: application/json

{
  "name": "template_name",
  "language": "pt_BR",
  "structure": {...}
}
```

#### Validar template
```http
POST /api/templates/validate
Content-Type: application/json

{
  "name": "template_name",
  "language": "pt_BR",
  "structure": {...}
}
```

#### Criar template básico
```http
POST /api/templates/create-basic
Content-Type: application/json

{
  "name": "meu_template",
  "bodyText": "Olá {{1}}! Mensagem aqui.",
  "language": "pt_BR"
}
```

#### Obter exemplos
```http
GET /api/templates/examples
```

## 📚 Diferenças entre Meta e Infobip

### Formato Meta/WhatsApp
```json
{
  "name": "template_name",
  "language": "pt_BR",
  "category": "MARKETING",
  "components": [
    {
      "type": "BODY",
      "text": "Mensagem aqui",
      "example": {
        "body_text": [["exemplo"]]
      }
    }
  ]
}
```

### Formato Infobip
```json
{
  "name": "template_name",
  "language": "pt_BR",
  "category": "MARKETING",
  "structure": {
    "type": "TEXT",
    "body": {
      "text": "Mensagem aqui",
      "examples": [["exemplo"]]
    }
  }
}
```

## 🎯 Exemplos de Uso

### Exemplo 1: Criar Template Básico
```javascript
const response = await fetch('http://localhost:3000/api/templates/create-basic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'welcome',
    bodyText: 'Olá {{1}}! Bem-vindo à nossa plataforma!',
    language: 'pt_BR'
  })
});

const template = await response.json();
console.log(template);
```

### Exemplo 2: Criar Template Completo
```javascript
const templateData = {
  name: 'order_confirmation',
  language: 'pt_BR',
  category: 'TRANSACTIONAL',
  structure: {
    type: 'TEXT',
    header: {
      format: 'TEXT',
      text: 'Pedido Confirmado ✅'
    },
    body: {
      text: 'Seu pedido #{{1}} no valor de R$ {{2}} foi confirmado!',
      examples: [['12345', '99.90']]
    },
    footer: {
      text: 'Obrigado pela preferência!'
    },
    buttons: [
      {
        type: 'URL',
        text: 'Rastrear',
        url: 'https://example.com/track/{{1}}'
      }
    ]
  }
};

const response = await fetch('http://localhost:3000/api/infobip/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(templateData)
});
```

### Exemplo 3: Criar Múltiplos Templates
```javascript
const templates = [
  {
    name: 'template1',
    language: 'pt_BR',
    category: 'MARKETING',
    structure: {
      type: 'TEXT',
      body: { text: 'Mensagem 1' }
    }
  },
  {
    name: 'template2',
    language: 'pt_BR',
    category: 'MARKETING',
    structure: {
      type: 'TEXT',
      body: { text: 'Mensagem 2' }
    }
  }
];

const response = await fetch('http://localhost:3000/api/infobip/templates/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ templates })
});

const result = await response.json();
console.log(`Criados: ${result.summary.successful}/${result.summary.total}`);
```

## 🌐 Interface Web

Acesse `http://localhost:3000` para visualizar a interface web com:
- Dashboard de status
- Documentação de endpoints
- Exemplos prontos
- Links para recursos

## 🔐 Segurança

- Nunca commit o arquivo `.env` no repositório
- Mantenha suas credenciais seguras
- Use variáveis de ambiente em produção
- Configure CORS adequadamente para produção

## 📦 Deploy em Produção

Para deploy em servidor de produção:

1. Configure as variáveis de ambiente no servidor
2. Instale as dependências: `npm install --production`
3. Execute: `npm start`
4. Configure um gerenciador de processos (PM2, Docker, etc.)

### Exemplo com PM2:
```bash
npm install -g pm2
pm2 start server.js --name "infobip-templates"
pm2 save
pm2 startup
```

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Axios** - Cliente HTTP
- **dotenv** - Gerenciamento de variáveis de ambiente
- **Infobip API** - Integração WhatsApp

## 📝 Licença

ISC

## 👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas sobre a API Infobip, consulte a [documentação oficial](https://www.infobip.com/docs/api).
