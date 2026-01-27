import express from 'express';
import infobipClient from '../services/infobipClient.js';

const router = express.Router();

/**
 * GET /api/infobip/templates
 * Get all templates from Infobip
 */
router.get('/templates', async (req, res) => {
  try {
    const result = await infobipClient.getTemplates();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json(result.error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/infobip/templates/:name
 * Get a specific template by name
 */
router.get('/templates/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await infobipClient.getTemplateByName(name);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json(result.error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/infobip/templates
 * Create a new template in Infobip
 */
router.post('/templates', async (req, res) => {
  try {
    const templateData = req.body;
    const result = await infobipClient.createTemplate(templateData);
    
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json(result.error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/infobip/templates/batch
 * Create multiple templates in batch
 */
router.post('/templates/batch', async (req, res) => {
  try {
    const { templates } = req.body;
    
    if (!Array.isArray(templates)) {
      return res.status(400).json({ 
        error: 'templates must be an array' 
      });
    }

    const results = await infobipClient.createTemplatesBatch(templates);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      summary: {
        total: results.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/infobip/templates/:name
 * Delete a template
 */
router.delete('/templates/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await infobipClient.deleteTemplate(name);
    
    if (result.success) {
      res.json({ message: 'Template deleted successfully', data: result.data });
    } else {
      res.status(400).json(result.error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/infobip/send
 * Send a WhatsApp message using a template
 */
router.post('/send', async (req, res) => {
  try {
    const messageData = req.body;
    const result = await infobipClient.sendTemplateMessage(messageData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json(result.error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
