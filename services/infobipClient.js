import axios from 'axios';

class InfobipClient {
  constructor() {
    this.apiKey = process.env.INFOBIP_API_KEY;
    this.baseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    this.sender = process.env.INFOBIP_SENDER;

    if (!this.apiKey) {
      console.warn('⚠️  INFOBIP_API_KEY not configured. Please set it in .env file');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `App ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Create a WhatsApp template via Infobip
   * @param {Object} templateData - Template data in Infobip format
   * @returns {Promise<Object>} - Response from Infobip API
   */
  async createTemplate(templateData) {
    try {
      const response = await this.client.post('/whatsapp/1/senders/{sender}/templates', templateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating template:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Get all templates from Infobip
   * @returns {Promise<Object>} - List of templates
   */
  async getTemplates() {
    try {
      const response = await this.client.get('/whatsapp/1/senders/{sender}/templates');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Get a specific template by name
   * @param {string} templateName - Name of the template
   * @returns {Promise<Object>} - Template data
   */
  async getTemplateByName(templateName) {
    try {
      const response = await this.client.get(`/whatsapp/1/senders/{sender}/templates/${templateName}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching template:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Delete a template
   * @param {string} templateName - Name of the template to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteTemplate(templateName) {
    try {
      const response = await this.client.delete(`/whatsapp/1/senders/{sender}/templates/${templateName}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting template:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Send a WhatsApp message using a template
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} - Send result
   */
  async sendTemplateMessage(messageData) {
    try {
      const response = await this.client.post('/whatsapp/1/message/template', messageData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Create multiple templates in batch
   * @param {Array} templates - Array of template data
   * @returns {Promise<Array>} - Results for each template
   */
  async createTemplatesBatch(templates) {
    const results = [];
    for (const template of templates) {
      const result = await this.createTemplate(template);
      results.push({
        templateName: template.name,
        ...result
      });
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return results;
  }
}

export default new InfobipClient();
