# 🚀 Guia de Início Rápido

Este guia vai te ajudar a começar a usar o Infobip Template Manager em minutos!

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Credenciais da API Infobip (opcional para testes locais)

## ⚡ Instalação Rápida

### 1️⃣ Clone e Instale

```bash
# Clone o repositório
git clone https://github.com/helloancardosox/template_lote.git
cd template_lote

# Instale as dependências
npm install
```

### 2️⃣ Inicie o Servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# OU modo produção
npm start
```

O servidor iniciará em `http://localhost:3000` 🎉

### 3️⃣ Acesse a Interface

Abra seu navegador em: `http://localhost:3000`

Você verá a interface web com documentação e status do servidor.

## 🧪 Testando Sem Credenciais

Você pode testar todas as funcionalidades localmente sem configurar a API Infobip!

### Testar Conversão de Formatos

```bash
curl -X POST http://localhost:3000/api/templates/convert/meta-to-infobip \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_template",
    "language": "pt_BR",
    "components": [
      {
        "type": "BODY",
        "text": "Olá {{1}}! Teste de conversão."
      }
    ]
  }'
```

### Criar Template Básico

```bash
curl -X POST http://localhost:3000/api/templates/create-basic \
  -H "Content-Type: application/json" \
  -d '{
    "name": "meu_primeiro_template",
    "bodyText": "Olá {{1}}! Bem-vindo!",
    "language": "pt_BR"
  }'
```

### Ver Exemplos de Templates

```bash
curl http://localhost:3000/api/templates/examples
```

### Validar Template

```bash
curl -X POST http://localhost:3000/api/templates/validate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test",
    "language": "pt_BR",
    "category": "MARKETING",
    "structure": {
      "type": "TEXT",
      "body": {
        "text": "Mensagem de teste"
      }
    }
  }'
```

## 🔐 Configurando Credenciais Infobip (Opcional)

Para usar a API real da Infobip:

### 1️⃣ Crie o arquivo .env

```bash
cp .env.example .env
```

### 2️⃣ Edite o .env com suas credenciais

```env
INFOBIP_API_KEY=sua_chave_api_aqui
INFOBIP_BASE_URL=https://api.infobip.com
INFOBIP_SENDER=seu_numero_sender
META_BUSINESS_ACCOUNT_ID=seu_business_account_id
META_WABA_ID=seu_waba_id
```

### 3️⃣ Reinicie o servidor

```bash
npm start
```

## 📚 Executando Exemplos

Explore os exemplos prontos:

```bash
# Exemplo 1: Template básico
node examples/1-create-basic-template.js

# Exemplo 2: Template completo
node examples/2-create-complete-template.js

# Exemplo 3: Templates em lote
node examples/3-create-batch-templates.js

# Exemplo 4: Conversão de formatos
node examples/4-convert-formats.js
```

## 🎯 Primeiros Passos

### Criar Seu Primeiro Template

1. **Via Interface Web:**
   - Acesse `http://localhost:3000`
   - Clique em "Ver Exemplos de Templates"
   - Copie um exemplo e adapte

2. **Via API:**
   ```javascript
   const response = await fetch('http://localhost:3000/api/templates/create-basic', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'meu_template',
       bodyText: 'Olá! Esta é minha primeira mensagem.',
       language: 'pt_BR'
     })
   });
   const template = await response.json();
   console.log(template);
   ```

3. **Via cURL:**
   ```bash
   curl -X POST http://localhost:3000/api/templates/create-basic \
     -H "Content-Type: application/json" \
     -d '{"name":"meu_template","bodyText":"Olá!","language":"pt_BR"}'
   ```

## 🔥 Recursos Populares

### ✅ Verificar Status do Servidor
```bash
curl http://localhost:3000/health
```

### ✅ Listar Templates (requer credenciais)
```bash
curl http://localhost:3000/api/infobip/templates
```

### ✅ Criar Template (requer credenciais)
```bash
curl -X POST http://localhost:3000/api/infobip/templates \
  -H "Content-Type: application/json" \
  -d @seu-template.json
```

## 🆘 Problemas Comuns

### Porta 3000 em uso?
```bash
# Use outra porta
PORT=3001 npm start
```

### Erro de módulo não encontrado?
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### API não responde?
1. Verifique se o servidor está rodando
2. Confirme a URL: `http://localhost:3000`
3. Verifique logs do servidor no terminal

## 📖 Próximos Passos

1. ✅ Explorar a [documentação completa](README.md)
2. ✅ Testar os [exemplos](examples/README.md)
3. ✅ Criar seus próprios templates
4. ✅ Integrar com sua aplicação
5. ✅ Deploy em produção

## 💡 Dicas

- 🔍 Use o endpoint `/api/templates/examples` para ver templates prontos
- 🧪 Teste localmente antes de enviar para Infobip
- 📝 Valide sempre seus templates antes de criar
- 🔄 Use a conversão de formatos quando necessário
- 📚 Consulte os exemplos para casos de uso comuns

## 🎓 Tutorial em Vídeo

[Em breve] Link para tutorial em vídeo

## 🤝 Precisa de Ajuda?

- 📖 Leia a [documentação completa](README.md)
- 💬 Abra uma issue no GitHub
- 📧 Entre em contato com o suporte

---

**Pronto para começar? Execute `npm start` e acesse `http://localhost:3000`!** 🚀
