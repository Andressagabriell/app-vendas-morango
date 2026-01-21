require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log("--- INICIANDO SCRIPT DE TESTE ---");

    console.log("Limpando tabelas...");
    await supabase.from('vendas').delete().neq('id', 0);
    await supabase.from('clientes').delete().neq('id', 0);
    await supabase.from('produtos_v2').delete().neq('id', 0); // MODIFICADO
    console.log("Tabelas limpas com sucesso.");

    console.log("Criando clientes...");
    const { data: clientes } = await supabase.from('clientes').insert([
      { nome: 'Ana Silva' }, { nome: 'Bruno Costa' }, { nome: 'Carla Dias' }, { nome: 'Daniel Faria' }, { nome: 'Elisa Borges' },
    ]).select();
    console.log(`${clientes.length} clientes criados com sucesso.`);

    console.log("Criando produtos...");
    const { data: produtos } = await supabase.from('produtos_v2').insert([ // MODIFICADO
      { nome: 'Produto B1', categoria: 'B1' }, { nome: 'Produto B2', categoria: 'B2' }, { nome: 'Produto B3', categoria: 'B3' },
    ]).select();
    console.log(`${produtos.length} produtos criados com sucesso.`);

    console.log("Gerando 20 registros de vendas...");
    const vendasParaInserir = [];
    for (let i = 0; i < 20; i++) {
      const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
      const produtoAleatorio = produtos[Math.floor(Math.random() * produtos.length)];
      const diasAtras = Math.floor(Math.random() * 15);
      const dataVenda = new Date();
      dataVenda.setDate(dataVenda.getDate() - diasAtras);

      vendasParaInserir.push({
        cliente_id: clienteAleatorio.id,
        produto_id: produtoAleatorio.id,
        quantidade_caixas: Math.floor(Math.random() * 20) + 1,
        created_at: dataVenda.toISOString(),
        entregue: Math.random() > 0.5,
      });
    }
    
    await supabase.from('vendas').insert(vendasParaInserir);
    console.log("20 vendas criadas com sucesso.");
    console.log("--- SCRIPT CONCLUÍDO COM SUCESSO ---");

  } catch (error) {
    console.error("### ERRO DURANTE A EXECUÇÃO DO SCRIPT ###", error);
  }
}

seedDatabase();
