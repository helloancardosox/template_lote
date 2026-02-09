require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');

// ...existing code...

const cors = require('cors');

const app = express();
// Necessário quando está atrás de proxy/túnel (ex: ngrok) para `req.protocol` refletir `x-forwarded-proto`
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public'))); // Serve a interface estática
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
        cb(null, `${Date.now()}_${base}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', 'image/jpg'].includes(file.mimetype);
        if (!ok) return cb(new Error('Apenas imagens JPG s??o permitidas'));
        cb(null, true);
    }
});

// --- Log em tempo real (SSE) ---
const logClients = new Set();

function broadcastLog(payload) {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of logClients) {
        client.write(data);
    }
}



// Configurações das APIs
// Garante que a chave não tenha 'App ' duplicado se o usuário colocou no .env
const RAW_KEY = process.env.INFOBIP_API_KEY || '';
const INFOBIP_API_KEY = RAW_KEY.startsWith('App ') ? RAW_KEY.split(' ')[1] : RAW_KEY;
// Garante que a URL base tenha https://
let rawBaseUrl = process.env.INFOBIP_BASE_URL || '38x6pj.api-us.infobip.com';
if (!rawBaseUrl.startsWith('http')) rawBaseUrl = 'https://' + rawBaseUrl;
const INFOBIP_BASE_URL = rawBaseUrl.replace(/\/$/, ''); // remove barra final se houver

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

// Stream de logs (Server-Sent Events)
app.get('/api/logs/stream', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        if (res.flushHeaders) res.flushHeaders();

        res.write(`data: ${JSON.stringify({ type: 'info', message: 'Conectado ao log em tempo real.' })}\n\n`);
        logClients.add(res);

        req.on('close', () => {
                logClients.delete(res);
        });
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
                headers: {
                    'Authorization': `App ${INFOBIP_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
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
                headers: {
                    'Authorization': `App ${INFOBIP_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
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
app.post('/api/templates/infobip', upload.single('headerImage'), async (req, res) => {
  try {
    const sender = req.body.sender;
    const copies = req.body.copies;

    // Usa o sender do corpo da requisi??o ou fallback (n?o recomendado fallback agora)
    if (!sender) {
        return res.status(400).json({ error: 'Voc? deve selecionar um Sender' });
    }

    let templates = req.body.templates;
    if (typeof templates === 'string') {
        try {
            templates = JSON.parse(templates);
        } catch (e) {
            return res.status(400).json({ error: 'Campo templates inv?lido (JSON esperado)' });
        }
    }

    // Fallback para payloads enviados como campos individuais (FormData antigo)
    if (!templates || !Array.isArray(templates)) {
        const { name, language, category, structure } = req.body;
        if (name && language && category && structure) {
            let parsedStructure = structure;
            if (typeof structure === 'string') {
                try {
                    parsedStructure = JSON.parse(structure);
                } catch (e) {
                    return res.status(400).json({ error: 'Campo structure inv?lido (JSON esperado)' });
                }
            }
            templates = [{ name, language, category, structure: parsedStructure }];
        }
    }

    if (!templates || !Array.isArray(templates)) {
      return res.status(400).json({ error: 'Templates deve ser um array' });
    }

    let headerImageUrl = null;
    if (req.file) {
        const inferredBaseUrl = `${req.protocol}://${req.get('host')}`;
        const configuredBaseUrl = process.env.PUBLIC_BASE_URL;
        // Se estiver atrás de um host público (ex: ngrok), prioriza o host real da requisição.
        // PUBLIC_BASE_URL fica útil só como override quando o host não é público (ex: localhost).
        const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(req.get('host') || '');
        const baseUrl = (!configuredBaseUrl || !isLocalHost) ? inferredBaseUrl : configuredBaseUrl;
        headerImageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    if (headerImageUrl) {
        broadcastLog({ type: 'info', message: `Imagem enviada: ${headerImageUrl}` });
        templates = templates.map(tpl => {
            const newTpl = JSON.parse(JSON.stringify(tpl));
            const structure = newTpl.structure || {};
            structure.header = { format: 'IMAGE', example: headerImageUrl };
            newTpl.structure = structure;
            return newTpl;
        });
    }

    let templatesToProcess = [];

    // L?gica de C?pias
    const copyCount = parseInt(copies) || 1;

    if (copyCount > 1) {
        // Expande os templates baseados na quantidade
        templates.forEach(tpl => {
            const baseName = tpl.name;
            for (let i = 1; i <= copyCount; i++) {
                // Cria c?pia profunda do objeto template
                const newTpl = JSON.parse(JSON.stringify(tpl));
                // Adiciona sufixo ao nome: ex nome_template_1, nome_template_2
                // Verifica se j? tem underscore no fim para evitar duplo
                newTpl.name = `${baseName}_${i}`.toLowerCase().replace(/\s+/g, '_');
                templatesToProcess.push(newTpl);
            }
        });
    } else {
        templatesToProcess = templates;
    }

    const results = [];
    
    console.log(`Iniciando cria??o de ${templatesToProcess.length} templates para o sender ${sender}...`);
    broadcastLog({
        type: 'info',
        message: `Iniciando criacao de ${templatesToProcess.length} templates para o sender ${sender}...`
    });

    for (const template of templatesToProcess) {
      try {
        // Valida??o b?sica do nome
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
                broadcastLog({ type: 'success', message: `Template criado: ${template.name}` });
        results.push({ name: template.name, success: true, data: response.data });
      } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        const headers = error.response?.headers;
        console.error(`Erro ao criar template ${template.name}:`, {
            status,
            data,
            headers,
            message: error.message
        });
                broadcastLog({
                        type: 'error',
                        message: `Erro ao criar template ${template.name}: ${data ? JSON.stringify(data) : error.message}`
                });
        results.push({ 
            name: template.name, 
            success: false, 
            error: data || error.message 
        });
      }
    }

    res.json({ processed: results.length, results, headerImageUrl });
  } catch (error) {
        broadcastLog({ type: 'error', message: `Erro ao processar fila: ${error.message}` });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

