/**
 * Exemplo 1: Criar um template básico
 * 
 * Este script demonstra como criar um template simples usando a API local
 */

const API_BASE_URL = 'http://localhost:3000';

async function createBasicTemplate() {
  console.log('📝 Criando template básico...\n');

  try {
    // Criar um template básico usando o helper
    const response = await fetch(`${API_BASE_URL}/api/templates/create-basic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'welcome_basic',
        bodyText: 'Olá {{1}}! Bem-vindo à nossa plataforma. Estamos felizes em tê-lo conosco!',
        language: 'pt_BR'
      })
    });

    const template = await response.json();
    
    console.log('✅ Template criado com sucesso:');
    console.log(JSON.stringify(template, null, 2));

    // Validar o template
    console.log('\n🔍 Validando template...\n');
    const validationResponse = await fetch(`${API_BASE_URL}/api/templates/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    });

    const validation = await validationResponse.json();
    
    if (validation.isValid) {
      console.log('✅ Template válido!');
    } else {
      console.log('❌ Template inválido:');
      console.log(validation.errors);
    }

    return template;
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createBasicTemplate();
}

export default createBasicTemplate;
