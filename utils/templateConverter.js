/**
 * Convert Meta/WhatsApp template format to Infobip format
 * Note: Infobip and Meta have different template structures
 */
export function metaToInfobip(metaTemplate) {
  // Meta template structure differs from Infobip
  // This converter helps bridge the gap
  
  const infobipTemplate = {
    name: metaTemplate.name,
    language: metaTemplate.language || 'pt_BR',
    category: metaTemplate.category || 'MARKETING',
    structure: {
      type: 'TEXT',
      header: null,
      body: null,
      footer: null,
      buttons: []
    }
  };

  // Convert components
  if (metaTemplate.components) {
    metaTemplate.components.forEach(component => {
      switch (component.type) {
        case 'HEADER':
          infobipTemplate.structure.header = {
            format: component.format || 'TEXT',
            text: component.text || '',
            example: component.example
          };
          break;
        
        case 'BODY':
          infobipTemplate.structure.body = {
            text: component.text || '',
            examples: component.example?.body_text || []
          };
          break;
        
        case 'FOOTER':
          infobipTemplate.structure.footer = {
            text: component.text || ''
          };
          break;
        
        case 'BUTTONS':
          infobipTemplate.structure.buttons = component.buttons?.map(btn => ({
            type: btn.type,
            text: btn.text,
            url: btn.url,
            phoneNumber: btn.phone_number
          })) || [];
          break;
      }
    });
  }

  return infobipTemplate;
}

/**
 * Convert Infobip template format to Meta/WhatsApp format
 */
export function infobipToMeta(infobipTemplate) {
  const metaTemplate = {
    name: infobipTemplate.name,
    language: infobipTemplate.language,
    category: infobipTemplate.category,
    components: []
  };

  const structure = infobipTemplate.structure;

  // Convert header
  if (structure.header) {
    metaTemplate.components.push({
      type: 'HEADER',
      format: structure.header.format,
      text: structure.header.text,
      example: structure.header.example
    });
  }

  // Convert body
  if (structure.body) {
    metaTemplate.components.push({
      type: 'BODY',
      text: structure.body.text,
      example: {
        body_text: structure.body.examples || []
      }
    });
  }

  // Convert footer
  if (structure.footer) {
    metaTemplate.components.push({
      type: 'FOOTER',
      text: structure.footer.text
    });
  }

  // Convert buttons
  if (structure.buttons && structure.buttons.length > 0) {
    metaTemplate.components.push({
      type: 'BUTTONS',
      buttons: structure.buttons.map(btn => ({
        type: btn.type,
        text: btn.text,
        url: btn.url,
        phone_number: btn.phoneNumber
      }))
    });
  }

  return metaTemplate;
}

/**
 * Validate template structure for Infobip
 */
export function validateInfobipTemplate(template) {
  const errors = [];

  if (!template.name) {
    errors.push('Template name is required');
  }

  if (!template.language) {
    errors.push('Template language is required');
  }

  if (!template.category) {
    errors.push('Template category is required');
  }

  if (!template.structure || !template.structure.body || !template.structure.body.text) {
    errors.push('Template body text is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create a basic text template
 */
export function createBasicTemplate(name, bodyText, language = 'pt_BR') {
  return {
    name,
    language,
    category: 'MARKETING',
    structure: {
      type: 'TEXT',
      body: {
        text: bodyText,
        examples: []
      }
    }
  };
}
