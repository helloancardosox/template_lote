/**
 * Exemplo 4: Converter entre formatos Meta e Infobip
 * 
 * Este script demonstra a conversão entre os diferentes formatos
 */

const API_BASE_URL = 'http://localhost:3000';

async function convertTemplateFormats() {
  console.log('🔄 Conversão entre formatos Meta e Infobip\n');

  try {
    // Exemplo 1: Template no formato Meta
    console.log('=== Formato Meta/WhatsApp ===\n');
    
    const metaTemplate = {
      name: 'promo_special',
      language: 'pt_BR',
      category: 'MARKETING',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: '🔥 Oferta Especial'
        },
        {
          type: 'BODY',
          text: 'Olá {{1}}! Aproveite {{2}}% de desconto em toda a loja. Válido até {{3}}!',
          example: {
            body_text: [['Pedro', '50', '31/12/2024']]
          }
        },
        {
          type: 'FOOTER',
          text: 'Promoção por tempo limitado'
        },
        {
          type: 'BUTTONS',
          buttons: [
            {
              type: 'URL',
              text: 'Ver Produtos',
              url: 'https://example.com/promo'
            }
          ]
        }
      ]
    };

    console.log('Template Meta original:');
    console.log(JSON.stringify(metaTemplate, null, 2));

    // Converter Meta para Infobip
    console.log('\n🔄 Convertendo Meta → Infobip...\n');
    
    const metaToInfobipResponse = await fetch(`${API_BASE_URL}/api/templates/convert/meta-to-infobip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metaTemplate)
    });

    const metaToInfobipResult = await metaToInfobipResponse.json();
    
    console.log('Template Infobip convertido:');
    console.log(JSON.stringify(metaToInfobipResult.converted, null, 2));

    // Exemplo 2: Template no formato Infobip
    console.log('\n\n=== Formato Infobip ===\n');
    
    const infobipTemplate = {
      name: 'shipping_update',
      language: 'pt_BR',
      category: 'TRANSACTIONAL',
      structure: {
        type: 'TEXT',
        header: {
          format: 'TEXT',
          text: 'Atualização de Envio 📦'
        },
        body: {
          text: 'Pedido #{{1}} atualizado!\n\nStatus: {{2}}\nPrevisão: {{3}}',
          examples: [['54321', 'Em trânsito', '2 dias']]
        },
        footer: {
          text: 'Rastreamento disponível'
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

    console.log('Template Infobip original:');
    console.log(JSON.stringify(infobipTemplate, null, 2));

    // Converter Infobip para Meta
    console.log('\n🔄 Convertendo Infobip → Meta...\n');
    
    const infobipToMetaResponse = await fetch(`${API_BASE_URL}/api/templates/convert/infobip-to-meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(infobipTemplate)
    });

    const infobipToMetaResult = await infobipToMetaResponse.json();
    
    console.log('Template Meta convertido:');
    console.log(JSON.stringify(infobipToMetaResult.converted, null, 2));

    console.log('\n✅ Conversões realizadas com sucesso!');
    console.log('\n💡 Dica: Use essas conversões para adaptar templates entre as plataformas');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  convertTemplateFormats();
}

export default convertTemplateFormats;
