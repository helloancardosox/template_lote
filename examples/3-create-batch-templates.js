/**
 * Exemplo 3: Criar múltiplos templates em lote
 * 
 * Este script demonstra como criar vários templates de uma vez
 */

const API_BASE_URL = 'http://localhost:3000';

async function createBatchTemplates() {
  console.log('📝 Criando templates em lote...\n');

  try {
    const templates = [
      {
        name: 'appointment_reminder',
        language: 'pt_BR',
        category: 'UTILITY',
        structure: {
          type: 'TEXT',
          body: {
            text: 'Olá {{1}}! Lembramos que você tem um agendamento em {{2}} no dia {{3}} às {{4}}.',
            examples: [['Maria', 'nossa clínica', '15/02/2024', '14:00']]
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
      },
      {
        name: 'delivery_notification',
        language: 'pt_BR',
        category: 'TRANSACTIONAL',
        structure: {
          type: 'TEXT',
          header: {
            format: 'TEXT',
            text: 'Pedido em Rota 🚚'
          },
          body: {
            text: 'Seu pedido #{{1}} saiu para entrega! O entregador {{2}} está a caminho.',
            examples: [['12345', 'João']]
          },
          footer: {
            text: 'Acompanhe em tempo real'
          }
        }
      },
      {
        name: 'payment_received',
        language: 'pt_BR',
        category: 'TRANSACTIONAL',
        structure: {
          type: 'TEXT',
          body: {
            text: 'Pagamento confirmado! ✅\n\nRecebemos seu pagamento de R$ {{1}} referente ao pedido #{{2}}.\n\nObrigado!',
            examples: [['150.00', '98765']]
          }
        }
      },
      {
        name: 'birthday_message',
        language: 'pt_BR',
        category: 'MARKETING',
        structure: {
          type: 'TEXT',
          header: {
            format: 'TEXT',
            text: '🎉 Feliz Aniversário!'
          },
          body: {
            text: 'Parabéns, {{1}}! 🎂\n\nQue seu dia seja repleto de alegrias! Use o cupom {{2}} e ganhe {{3}}% de desconto.',
            examples: [['Carlos', 'ANIVER2024', '20']]
          },
          buttons: [
            {
              type: 'URL',
              text: 'Ver Ofertas',
              url: 'https://example.com/ofertas'
            }
          ]
        }
      },
      {
        name: 'survey_request',
        language: 'pt_BR',
        category: 'MARKETING',
        structure: {
          type: 'TEXT',
          body: {
            text: 'Olá {{1}}! Sua opinião é muito importante para nós. Poderia avaliar nossa {{2}}?',
            examples: [['Ana', 'atendimento']]
          },
          buttons: [
            {
              type: 'QUICK_REPLY',
              text: '⭐ Excelente'
            },
            {
              type: 'QUICK_REPLY',
              text: '👍 Bom'
            },
            {
              type: 'QUICK_REPLY',
              text: '👎 Ruim'
            }
          ]
        }
      }
    ];

    console.log(`📦 Preparando ${templates.length} templates...\n`);

    // Mostrar os templates que serão criados
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.category})`);
    });

    console.log('\n⚠️  Para criar em lote no Infobip, configure o .env com suas credenciais');
    console.log('    e descomente o código abaixo:\n');

    /*
    const response = await fetch(`${API_BASE_URL}/api/infobip/templates/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ templates })
    });

    const result = await response.json();
    
    console.log('\n📊 Resultado:');
    console.log(`✅ Sucesso: ${result.summary.successful}/${result.summary.total}`);
    console.log(`❌ Falhas: ${result.summary.failed}/${result.summary.total}`);
    
    console.log('\nDetalhes:');
    result.results.forEach((res, index) => {
      const status = res.success ? '✅' : '❌';
      console.log(`${status} ${res.templateName}`);
      if (!res.success) {
        console.log(`   Erro: ${res.error.message}`);
      }
    });
    */

    // Por enquanto, apenas mostra os templates validados
    console.log('\n✅ Templates preparados e prontos para criação!');
    console.log('\nPrimeiro template de exemplo:');
    console.log(JSON.stringify(templates[0], null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createBatchTemplates();
}

export default createBatchTemplates;
