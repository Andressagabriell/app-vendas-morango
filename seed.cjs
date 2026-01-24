require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('--- INICIANDO SCRIPT DE TESTE ---');

  try {
    // 1. LIMPEZA FORÇADA DAS TABELAS
    console.log('Limpando tabelas com TRUNCATE...');
    // A função 'truncate' zera a tabela completamente.
    // O 'CASCADE' garante que as dependências (vendas) sejam limpas primeiro.
    const { error: truncateError } = await supabase.rpc('truncate_tables', {
      tables: ['clientes_v2', 'produtos_v2', 'vendas']
    });
    if (truncateError) throw truncateError;
    console.log('Tabelas limpas com sucesso.');

    // 2. Inserir clientes
    console.log('Inserindo 5 clientes...');
    const { error: insertClientesError } = await supabase
      .from('clientes_v2')
      .insert([
        { nome: 'Ana Silva', email: 'ana.silva@example.com', telefone: '11987654321', endereco: 'Rua das Flores, 123, São Paulo, SP' },
        { nome: 'Bruno Costa', email: 'bruno.costa@example.com', telefone: '21987654321', endereco: 'Avenida Atlântica, 456, Rio de Janeiro, RJ' },
        { nome: 'Carla Dias', email: 'carla.dias@example.com', telefone: '31987654321', endereco: 'Praça da Liberdade, 789, Belo Horizonte, MG' },
        { nome: 'Daniel Faria', email: 'daniel.faria@example.com', telefone: '41987654321', endereco: 'Rua XV de Novembro, 101, Curitiba, PR' },
        { nome: 'Elisa Rocha', email: 'elisa.rocha@example.com', telefone: '51987654321', endereco: 'Avenida Borges de Medeiros, 202, Porto Alegre, RS' },
      ]);
    if (insertClientesError) throw insertClientesError;

    // 3. Buscar os 5 clientes que acabamos de inserir
    const { data: clientes, error: selectClientesError } = await supabase.from('clientes_v2').select('id');
    if (selectClientesError) throw selectClientesError;
    if (!clientes || clientes.length !== 5) throw new Error(`A busca por clientes retornou ${clientes?.length} em vez de 5.`);
    console.log(`${clientes.length} clientes encontrados com sucesso.`);

    // 4. Inserir produtos
    console.log('Inserindo 3 produtos...');
    const { error: insertProdutosError } = await supabase
      .from('produtos_v2')
      .insert([
        { nome: 'Morango Especial', categoria: 'B1' },
        { nome: 'Morango Premium', categoria: 'B2' },
        { nome: 'Morango Orgânico', categoria: 'B3' },
      ]);
    if (insertProdutosError) throw insertProdutosError;

    // 5. Buscar os 3 produtos que acabamos de inserir
    const { data: produtos, error: selectProdutosError } = await supabase.from('produtos_v2').select('id');
    if (selectProdutosError) throw selectProdutosError;
    if (!produtos || produtos.length !== 3) throw new Error(`A busca por produtos retornou ${produtos?.length} em vez de 3.`);
    console.log(`${produtos.length} produtos encontrados com sucesso.`);

    // 6. Gerar vendas usando os UUIDs reais
    console.log('Gerando 20 registros de vendas...');
    const vendasParaInserir = [];
    for (let i = 0; i < 20; i++) {
      const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
      const produtoAleatorio = produtos[Math.floor(Math.random() * produtos.length)];
      const dataVenda = new Date();
      dataVenda.setDate(dataVenda.getDate() - Math.floor(Math.random() * 14));

      vendasParaInserir.push({
        cliente_id: clienteAleatorio.id,
        produto_id: produtoAleatorio.id,
        quantidade_caixas: Math.floor(Math.random() * 5) + 1,
        created_at: dataVenda.toISOString(),
      });
    }

    const { error: vendasError } = await supabase.from('vendas').insert(vendasParaInserir);
    if (vendasError) throw vendasError;
    console.log(`${vendasParaInserir.length} vendas criadas com sucesso.`);

    console.log('--- SCRIPT CONCLUÍDO COM SUCESSO ---');

  } catch (error) {
    console.error('### ERRO DURANTE A EXECUÇÃO DO SCRIPT ###');
    console.error(error);
  }
}

seedDatabase();
