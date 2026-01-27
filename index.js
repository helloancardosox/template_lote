require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve a interface estática

const fs = require('fs');
const path = require('path');

// Configurações das APIs
// Garante que a chave não tenha 'App ' duplicado se o usuário colocou no .env
const RAW_KEY = process.env.INFOBIP_API_KEY || '6780e7b1377596c3f9bc2d224a0234a9-5867bc97-31cc-4296-99a4-b9f447ad0869';
const INFOBIP_API_KEY = RAW_KEY.startsWith('App ') ? RAW_KEY.split(' ')[1] : RAW_KEY;
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || '38x6pj.api-us.infobip.com';

const SENDERS_FILE = path.join(__dirname, 'senders.json');

// Helper para ler/escrever senders
function getSenders() {
    try {
        if (!fs.existsSync(SENDERS_FILE)) return [];
        return JSON.parse(fs.readFileSync(SENDERS_FILE, 'utf8'));
    } catch (e) { return []; }
}

function saveSender(senderData) {
    const senders = getSenders();
    // Evita duplicatas pelo número
    const index = senders.findIndex(s => s.phoneNumber === senderData.phoneNumber);
    if (index >= 0) {
        senders[index] = { ...senders[index], ...senderData };
    } else {
        senders.push(senderData);
    }
    fs.writeFileSync(SENDERS_FILE, JSON.stringify(senders, null, 2));
}

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API está funcionando' });
});

// --- Rotas de Gerenciamento de Senders ---

// Listar Senders (Mescla Local + API Infobip)
app.get('/api/senders', async (req, res) => {
    let allSenders = getSenders(); // Senders Salvos Localmente

    console.log('[DEBUG] Tentando buscar senders na API...');
    
    if (!INFOBIP_API_KEY) {
        console.error('[ERRO] INFOBIP_API_KEY não definida no .env');
        return res.json(allSenders);
    }

    try {
        // Tenta buscar da API da Infobip (Números comprados/registrados)
        const response = await axios.get(
            `${INFOBIP_BASE_URL}/numbers/1/numbers`,
            {
                headers: {
                    'Authorization': `App ${INFOBIP_API_KEY}`,
                    'Accept': 'application/json'
                }
            }
        );

        console.log('[DEBUG] Resposta API Numbers:', response.status);

        if (response.data && response.data.numbers) {
            const apiSenders = response.data.numbers
                .filter(n => n.capabilities && n.capabilities.includes('WHATSAPP'))
                .map(n => ({
                    phoneNumber: n.number,
                    displayName: n.number, 
                    status: 'VERIFIED',
                    source: 'API'
                }));

            console.log(`[DEBUG] Encontrados ${apiSenders.length} senders de WhatsApp na API.`);

            // Mesclar evitando duplicatas (Prioriza o API se existir)
            apiSenders.forEach(apiSender => {
                const existingIndex = allSenders.findIndex(s => s.phoneNumber === apiSender.phoneNumber);
                if (existingIndex === -1) {
                    allSenders.push(apiSender);
                } else {
                    allSenders[existingIndex].status = 'VERIFIED';
                    allSenders[existingIndex].source = 'API';
                }
            });
        }
    } catch (error) {
        console.error('Erro ao buscar senders da Infobip:', error.response?.status, error.message);
        
        if (error.response?.status === 401) {
            console.error('[ERRO CRÍTICO] Falha de Autenticação (401). Verifique sua API KEY no .env.');
            console.error('Sua chave atual começa com:', RAW_KEY.substring(0, 10) + '...');
        }
        if (error.response?.status === 403) {
            console.error('[ERRO] Permissão negada. Sua API KEY pode não ter permissão para listar Números.');
        }
    }
    
    res.json(allSenders);
});


// Endpoint para buscar todos os números WhatsApp disponíveis na conta Infobip
app.get('/api/available-senders', async (req, res) => {
    try {
        // Busca todos os números comprados/registrados na conta
        const response = await axios.get(`${INFOBIP_BASE_URL}/numbers/1/numbers`, {
            headers: {
                'Authorization': `App ${INFOBIP_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        // Filtra para manter apenas os que têm 'WHATSAPP' nas capabilities
        const numbers = response.data.numbers || [];
        const whatsappSenders = numbers
            .filter(n => n.capabilities && n.capabilities.includes('WHATSAPP'))
            .map(n => ({
                number: n.numberKey,
                country: n.country,
                type: n.type
            }));

        res.json(whatsappSenders);
    } catch (error) {
        console.error('Erro ao buscar números da Infobip:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro ao buscar senders da Infobip' });
    }
});

// Passo 1: Registrar Sender (Envia SMS/Voz com PIN)
app.post('/api/senders/register', async (req, res) => {
    try {
        const { wabaId, phoneNumber, displayName, type = 'EXTERNAL_SMS' } = req.body;

        if (!wabaId || !phoneNumber) {
            return res.status(400).json({ error: 'WABA ID e Número são obrigatórios' });
        }

        // Endpoint Infobip: Trigger Registration
        const response = await axios.post(
            `${INFOBIP_BASE_URL}/whatsapp/1/embedded-signup/registrations/business-account/${wabaId}/senders`,
            {
                countryCode: phoneNumber.substring(0, 2), // Assume 5511... -> 55
                phoneNumber: phoneNumber.substring(2),    // Resto do número
                displayName: displayName,
                type: type,
                locale: 'pt_BR'
            },
            {
                headers: { 'Authorization': `App ${INFOBIP_API_KEY}`, 'Content-Type': 'application/json' }
            }
        );

        // Salva status pendente localmente
        saveSender({ 
            phoneNumber, 
            wabaId, 
            displayName, 
            status: 'PENDING_VERIFICATION' 
        });

        res.json({ success: true, message: 'Código de verificação enviado', data: response.data });

    } catch (error) {
        console.error('Erro ao registrar sender:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Passo 2: Validar o Sender com o PIN
app.post('/api/senders/verify', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;

        if (!code || !phoneNumber) {
            return res.status(400).json({ error: 'Código e Número são obrigatórios' });
        }

        // Endpoint Infobip: Verify Code
        const response = await axios.post(
            `${INFOBIP_BASE_URL}/whatsapp/1/embedded-signup/registrations/senders/${phoneNumber}/verification`,
            { code: code },
            {
                headers: { 'Authorization': `App ${INFOBIP_API_KEY}`, 'Content-Type': 'application/json' }
            }
        );

        // Atualiza status local
        saveSender({ 
            phoneNumber, 
            status: 'VERIFIED' 
        });

        res.json({ success: true, message: 'Sender verificado com sucesso!', data: response.data });

    } catch (error) {
        console.error('Erro ao verificar sender:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});


// Rota para criar template em lote (Infobip)
app.post('/api/templates/infobip', async (req, res) => {
  try {
    const { templates, sender, copies } = req.body;
    
    // Usa o sender do corpo da requisição ou fallback (não recomendado fallback agora)
    if (!sender) {
        return res.status(400).json({ error: 'Você deve selecionar um Sender' });
    }

    if (!templates || !Array.isArray(templates)) {
      return res.status(400).json({ error: 'Templates deve ser um array' });
    }

    let templatesToProcess = [];

    // Lógica de Cópias
    const copyCount = parseInt(copies) || 1;

    if (copyCount > 1) {
        // Expande os templates baseados na quantidade
        templates.forEach(tpl => {
            const baseName = tpl.name;
            for (let i = 1; i <= copyCount; i++) {
                // Cria cópia profunda do objeto template
                const newTpl = JSON.parse(JSON.stringify(tpl));
                // Adiciona sufixo ao nome: ex nome_template_1, nome_template_2
                // Verifica se já tem underscore no fim para evitar duplo
                newTpl.name = `${baseName}_${i}`.toLowerCase().replace(/\s+/g, '_');
                templatesToProcess.push(newTpl);
            }
        });
    } else {
        templatesToProcess = templates;
    }

    const results = [];
    
    console.log(`Iniciando criação de ${templatesToProcess.length} templates para o sender ${sender}...`);

    for (const template of templatesToProcess) {
      try {
        // Validação básica do nome
        if (template.name) {
             template.name = template.name.toLowerCase().replace(/\s+/g, '_');
        }

        const response = await axios.post(
          `${INFOBIP_BASE_URL}/whatsapp/2/senders/${sender}/templates`,
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

