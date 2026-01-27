/**
 * Exemplo 2: Criar template completo com header, footer e botões
 * 
 * Este script demonstra como criar um template mais elaborado
 */

const API_BASE_URL = 'http://localhost:3000';

async function createCompleteTemplate() {
  console.log('📝 Criando template completo...\n');

  try {
    const templateData = {
      name: 'order_confirmation_complete',
      language: 'pt_BR',
      category: 'TRANSACTIONAL',
      structure: {
        type: 'TEXT',
        header: {
          format: 'TEXT',
          text: 'Pedido Confirmado ✅'
        },
        body: {
          text: 'Olá {{1}}!\n\nSeu pedido #{{2}} foi confirmado com sucesso!\n\nValor total: R$ {{3}}\nPrevisão de entrega: {{4}}',
          examples: [['João Silva', '12345', '99.90', '3-5 dias úteis']]
        },
        footer: {
          text: 'Obrigado pela preferência! 💚'
        },
        buttons: [
          {
            type: 'URL',
            text: 'Rastrear Pedido',
            url: 'https://example.com/track/{{1}}'
          },
          {
            type: 'PHONE_NUMBER',
            text: 'Falar com Suporte',
            phoneNumber: '+5511999999999'
          }
        ]
      }
    };

    // Validar antes de criar
    console.log('🔍 Validando template...\n');
    const validationResponse = await fetch(`${API_BASE_URL}/api/templates/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    const validation = await validationResponse.json();
    
    if (!validation.isValid) {
      console.log('❌ Template inválido:');
      console.log(validation.errors);
      return;
    }

    console.log('✅ Template válido!\n');

    // Criar o template
    console.log('📤 Enviando para Infobip...\n');
    console.log('Template a ser criado:');
    console.log(JSON.stringify(templateData, null, 2));

    // Nota: Esta chamada falhará se o .env não estiver configurado
    // mas o template está validado e pronto para ser usado
    
    console.log('\n⚠️  Para criar no Infobip, configure o .env com suas credenciais');
    console.log('    e descomente o código abaixo:\n');
    
    /*
    const response = await fetch(`${API_BASE_URL}/api/infobip/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    const result = await response.json();
    console.log('\n✅ Template criado no Infobip:');
    console.log(JSON.stringify(result, null, 2));
    */

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createCompleteTemplate();
}

export default createCompleteTemplate;
