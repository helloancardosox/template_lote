require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve a interface estática

// Configurações das APIs
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
const INFOBIP_SENDER = process.env.INFOBIP_SENDER; // Número do remetente (apenas números)

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API está funcionando' });
});

// Rota para criar template em lote (Infobip)
app.post('/api/templates/infobip', async (req, res) => {
  try {
    const { templates, sender } = req.body;
    
    // Usa o sender do corpo da requisição ou do .env
    const senderNumber = sender || INFOBIP_SENDER;

    if (!senderNumber) {
        return res.status(400).json({ error: 'Sender number é obrigatório (no .env ou no body)' });
    }

    if (!templates || !Array.isArray(templates)) {
      return res.status(400).json({ error: 'Templates deve ser um array' });
    }

    const results = [];
    
    console.log(`Iniciando criação de ${templates.length} templates para o sender ${senderNumber}...`);

    for (const template of templates) {
      try {
        // Validação básica do nome (Infobip exige minúsculas e underscores)
        if (template.name) {
             template.name = template.name.toLowerCase().replace(/\s+/g, '_');
        }

        const response = await axios.post(
          `${INFOBIP_BASE_URL}/whatsapp/2/senders/${senderNumber}/templates`,
          template,
          {
            headers: {
              'Authorization': `App ${INFOBIP_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        console.log(`Template criado: ${template.name}`);
        results.push({ name: template.name, success: true, data: response.data });
      } catch (error) {
        console.error(`Erro ao criar template ${template.name}:`, error.response?.data || error.message);
        results.push({ 
            name: template.name, 
            success: false, 
            error: error.response?.data || error.message 
        });
      }
    }

    res.json({ processed: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
// Rota antiga da Meta (Desativada para evitar erros de variáveis não definidas)
// Caso precise usar diretamente a API da Meta/Graph API no futuro, descomente e configure META_ACCESS_TOKEN
app.post('/api/templates/meta', async (req, res) => {
    // ...
});
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

