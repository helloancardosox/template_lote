# 📚 Exemplos de Uso

Este diretório contém exemplos práticos de como usar a API Infobip Template Manager.

## 🚀 Executando os Exemplos

Antes de executar os exemplos, certifique-se de que:

1. O servidor está rodando: `npm start` (em outro terminal)
2. O servidor está acessível em `http://localhost:3000`

### Executar um exemplo:

```bash
node examples/1-create-basic-template.js
```

## 📋 Lista de Exemplos

### 1. Criar Template Básico
**Arquivo:** `1-create-basic-template.js`

Demonstra como:
- Criar um template simples com texto
- Usar o endpoint helper `/api/templates/create-basic`
- Validar o template criado

```bash
node examples/1-create-basic-template.js
```

### 2. Criar Template Completo
**Arquivo:** `2-create-complete-template.js`

Demonstra como:
- Criar um template com header, body, footer e botões
- Validar o template antes de enviar
- Preparar template para envio ao Infobip

```bash
node examples/2-create-complete-template.js
```

### 3. Criar Templates em Lote
**Arquivo:** `3-create-batch-templates.js`

Demonstra como:
- Criar múltiplos templates de uma vez
- Usar o endpoint `/api/infobip/templates/batch`
- Processar resultados em lote

```bash
node examples/3-create-batch-templates.js
```

### 4. Converter Formatos
**Arquivo:** `4-convert-formats.js`

Demonstra como:
- Converter template Meta/WhatsApp para formato Infobip
- Converter template Infobip para formato Meta/WhatsApp
- Entender as diferenças entre os formatos

```bash
node examples/4-convert-formats.js
```

## 🔑 Configuração para Produção

Para usar os exemplos com a API real da Infobip:

1. Configure o arquivo `.env` na raiz do projeto:
   ```env
   INFOBIP_API_KEY=sua_chave_api
   INFOBIP_BASE_URL=https://api.infobip.com
   INFOBIP_SENDER=seu_numero_sender
   ```

2. Descomente o código de chamada à API nos exemplos

3. Execute novamente os exemplos

## 💡 Dicas

- **Teste local primeiro**: Execute os exemplos sem configurar a API para ver a estrutura dos templates
- **Valide sempre**: Use o endpoint de validação antes de criar templates na Infobip
- **Lote com cuidado**: Use um delay entre requests em lote para evitar rate limiting
- **Logs detalhados**: Os exemplos incluem logs detalhados para facilitar o debug

## 🎯 Casos de Uso Comuns

### Mensagem de Boas-vindas
```javascript
{
  name: 'welcome',
  bodyText: 'Olá {{1}}! Bem-vindo à {{2}}!',
  language: 'pt_BR'
}
```

### Confirmação de Pedido
```javascript
{
  name: 'order_confirm',
  category: 'TRANSACTIONAL',
  structure: {
    header: { text: 'Pedido Confirmado ✅' },
    body: { text: 'Pedido #{{1}} confirmado! Total: R$ {{2}}' }
  }
}
```

### Lembrete de Agendamento
```javascript
{
  name: 'appointment',
  category: 'UTILITY',
  structure: {
    body: { text: 'Lembrete: consulta dia {{1}} às {{2}}' },
    buttons: [
      { type: 'QUICK_REPLY', text: 'Confirmar' },
      { type: 'QUICK_REPLY', text: 'Reagendar' }
    ]
  }
}
```

## 🔗 Recursos Adicionais

- [Documentação da API Infobip](https://www.infobip.com/docs/api)
- [Guia de Templates WhatsApp](https://www.infobip.com/docs/whatsapp/message-types#create-template-message)
- [README Principal](../README.md)
