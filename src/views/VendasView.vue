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
  const { data: clientesData, error: clientesError } = await supabase.from('clientes').select('id, nome')
  if (clientesError) console.error(clientesError)
  if (clientesData) clientes.value = clientesData

  const { data: produtosData, error: produtosError } = await supabase.from('produtos_v2').select('id, nome')
  if (produtosError) console.error(produtosError)
  if (produtosData) produtos.value = produtosData
}

async function buscarVendas() {
  const { data, error } = await supabase
    .from('vendas')
    .select('id, created_at, quantidade_caixas, clientes(id, nome), produtos_v2(id, nome)')
    .order('created_at', { ascending: false })

  if (error) console.error(error)
  if (data) vendas.value = data
}

async function registrarVenda() {
  if (!clienteSelecionado.value || !produtoSelecionado.value || quantidadeCaixas.value < 1) return

  const { error } = await supabase.from('vendas').insert([{
    cliente_id: clienteSelecionado.value,
    produto_id: produtoSelecionado.value,
    quantidade_caixas: quantidadeCaixas.value
  }])

  if (error) console.error(error)
  else {
    clienteSelecionado.value = null
    produtoSelecionado.value = null
    quantidadeCaixas.value = 1
    await buscarVendas()
  }
}

async function deletarVenda(id) {
  if (!confirm('Tem certeza?')) return
  const { error } = await supabase.from('vendas').delete().eq('id', id)
  if (error) console.error(error)
  await buscarVendas()
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
          <option value="" disabled>Selecione um cliente</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="produto">Produto:</label>
        <select id="produto" v-model="produtoSelecionado" required>
          <option value="" disabled>Selecione um produto</option>
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
          <span>Produto: <strong>{{ venda.produtos_v2?.nome || 'N/A' }}</strong></span>
          <span>Qtd: <strong>{{ venda.quantidade_caixas }}</strong></span>
          <button @click="deletarVenda(venda.id)">Deletar</button>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 700px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; }
label { margin-bottom: 0.3rem; font-weight: bold; }
input, select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: #17a2b8; color: white; font-weight: bold; cursor: pointer; }
.list-container ul { list-style: none; padding: 0; }
.list-container li { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: center; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 0.5rem; }
</style>
