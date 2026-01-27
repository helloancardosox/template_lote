import express from 'express';
import { 
  metaToInfobip, 
  infobipToMeta, 
  validateInfobipTemplate,
  createBasicTemplate 
} from '../utils/templateConverter.js';

const router = express.Router();

/**
 * POST /api/templates/convert/meta-to-infobip
 * Convert Meta template format to Infobip format
 */
router.post('/convert/meta-to-infobip', (req, res) => {
  try {
    const metaTemplate = req.body;
    const infobipTemplate = metaToInfobip(metaTemplate);
    
    res.json({
      original: metaTemplate,
      converted: infobipTemplate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/templates/convert/infobip-to-meta
 * Convert Infobip template format to Meta format
 */
router.post('/convert/infobip-to-meta', (req, res) => {
  try {
    const infobipTemplate = req.body;
    const metaTemplate = infobipToMeta(infobipTemplate);
    
    res.json({
      original: infobipTemplate,
      converted: metaTemplate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/templates/validate
 * Validate template structure for Infobip
 */
router.post('/validate', (req, res) => {
  try {
    const template = req.body;
    const validation = validateInfobipTemplate(template);
    
    res.json(validation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/templates/create-basic
 * Helper to create a basic text template
 */
router.post('/create-basic', (req, res) => {
  try {
    const { name, bodyText, language } = req.body;
    
    if (!name || !bodyText) {
      return res.status(400).json({ 
        error: 'name and bodyText are required' 
      });
    }

    const template = createBasicTemplate(name, bodyText, language);
    
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/templates/examples
 * Get example templates
 */
router.get('/examples', (req, res) => {
  const examples = [
    {
      name: 'welcome_message',
      description: 'Basic welcome message',
      template: createBasicTemplate(
        'welcome_message',
        'Olá {{1}}! Bem-vindo à nossa plataforma. Estamos felizes em tê-lo conosco!',
        'pt_BR'
      )
    },
    {
      name: 'order_confirmation',
      description: 'Order confirmation template',
      template: {
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
            text: 'Olá {{1}}, seu pedido #{{2}} foi confirmado com sucesso! Total: R$ {{3}}',
            examples: [['João', '12345', '99.90']]
          },
          footer: {
            text: 'Obrigado pela preferência!'
          },
          buttons: [
            {
              type: 'URL',
              text: 'Rastrear Pedido',
              url: 'https://example.com/track/{{1}}'
            }
          ]
        }
      }
    },
    {
      name: 'appointment_reminder',
      description: 'Appointment reminder with buttons',
      template: {
        name: 'appointment_reminder',
        language: 'pt_BR',
        category: 'MARKETING',
        structure: {
          type: 'TEXT',
          body: {
            text: 'Olá {{1}}! Lembramos que você tem um agendamento em {{2}} no dia {{3}}.',
            examples: [['Maria', 'nossa clínica', '15/02/2024']]
          },
          buttons: [
            {
              type: 'QUICK_REPLY',
              text: 'Confirmar'
            },
            {
              type: 'QUICK_REPLY',
              text: 'Reagendar'
            }
          ]
        }
      }
    }
  ];

  res.json(examples);
});

export default router;
