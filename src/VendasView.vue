<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const clientes = ref([])
const produtos = ref([])
const vendas = ref([])
const clienteSelecionado = ref(null)
const produtoSelecionado = ref(null)
const quantidadeCaixas = ref(1)

async function buscarDadosIniciais() {
  const { data: clientesData } = await supabase.from('clientes').select('id, nome')
  if (clientesData) clientes.value = clientesData

  const { data: produtosData } = await supabase.from('produtos_v2').select('id, nome') // MODIFICADO
  if (produtosData) produtos.value = produtosData
}

async function buscarVendas() {
  const { data } = await supabase.from('vendas').select(`id, created_at, quantidade_caixas, clientes ( nome ), produtos_v2 ( nome )`) // MODIFICADO
    .order('created_at', { ascending: false })
  if (data) vendas.value = data
}

async function registrarVenda() {
  const { error } = await supabase.from('vendas').insert([{ 
    cliente_id: clienteSelecionado.value, 
    produto_id: produtoSelecionado.value,
    quantidade_caixas: quantidadeCaixas.value
  }])
  if (!error) {
    clienteSelecionado.value = null
    produtoSelecionado.value = null
    quantidadeCaixas.value = 1
    await buscarVendas()
  }
}

async function deletarVenda(idVenda) {
  const { error } = await supabase.from('vendas').delete().eq('id', idVenda)
  if (!error) await buscarVendas()
}

onMounted(() => {
  buscarDadosIniciais()
  buscarVendas()
})
</script>

<template>
  <main>
    <h1>Registro de Vendas</h1>
    <form @submit.prevent="registrarVenda" class="form-container">
      <div class="form-group">
        <label for="cliente">Cliente:</label>
        <select id="cliente" v-model="clienteSelecionado" required>
          <option :value="null" disabled>Selecione um cliente</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="produto">Produto:</label>
        <select id="produto" v-model="produtoSelecionado" required>
          <option :value="null" disabled>Selecione um produto</option>
          <option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="quantidade">Quantidade de Caixas:</label>
        <input type="number" id="quantidade" v-model="quantidadeCaixas" min="1" required />
      </div>
      <button type="submit">Registrar Venda</button>
    </form>
    <div class="list-container">
      <h2>Vendas Recentes</h2>
      <ul>
        <li v-for="venda in vendas" :key="venda.id">
          <span>Cliente: <strong>{{ venda.clientes.nome }}</strong></span>
          <span>Produto: <strong>{{ venda.produtos_v2.nome }}</strong></span> <!-- MODIFICADO -->
          <span>Caixas: <strong>{{ venda.quantidade_caixas }}</strong></span>
          <button @click="deletarVenda(venda.id)" class="delete-button">Deletar</button>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 700px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; }
input, select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; font-size: 1rem; }
ul { list-style: none; padding: 0; }
li { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; }
.delete-button:hover { background-color: #c53030; }
</style>
