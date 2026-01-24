<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const clientes = ref([])
const produtos = ref([])
const vendas = ref([])

const clienteSelecionado = ref('')
const produtoSelecionado = ref('')
const quantidadeCaixas = ref(1)

const loading = ref(false)

async function buscarDadosIniciais() {
  const { data: clientesData, error: errClientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .order('nome')

  if (!errClientes && clientesData) clientes.value = clientesData

  const { data: produtosData, error: errProdutos } = await supabase
    .from('produtos_v2')
    .select('id, nome')
    .order('nome')

  if (!errProdutos && produtosData) produtos.value = produtosData
}

async function buscarVendas() {
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      id,
      created_at,
      quantidade_caixas,
      clientes ( nome ),
      produtos_v2 ( nome )
    `)
    .order('created_at', { ascending: false })

  if (!error && data) vendas.value = data
}

async function registrarVenda() {
  if (!clienteSelecionado.value || !produtoSelecionado.value || !quantidadeCaixas.value) {
    alert('Preencha todos os campos')
    return
  }

  loading.value = true

  const { error } = await supabase.from('vendas').insert([{
    cliente_id: clienteSelecionado.value,
    produto_id: produtoSelecionado.value,
    quantidade_caixas: Number(quantidadeCaixas.value)
  }])

  loading.value = false

  if (error) {
    alert(error.message)
    return
  }

  clienteSelecionado.value = ''
  produtoSelecionado.value = ''
  quantidadeCaixas.value = 1

  await buscarVendas()
}

async function deletarVenda(idVenda) {
  if (!confirm('Tem certeza?')) return

  const { error } = await supabase
    .from('vendas')
    .delete()
    .eq('id', idVenda)

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
        <label>Cliente</label>
        <select v-model="clienteSelecionado" required>
          <option value="" disabled>Selecione um cliente</option>
          <option
            v-for="cliente in clientes"
            :key="cliente.id"
            :value="cliente.id"
          >
            {{ cliente.nome }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Produto</label>
        <select v-model="produtoSelecionado" required>
          <option value="" disabled>Selecione um produto</option>
          <option
            v-for="produto in produtos"
            :key="produto.id"
            :value="produto.id"
          >
            {{ produto.nome }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Quantidade de Caixas</label>
        <input
          type="number"
          v-model="quantidadeCaixas"
          min="1"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Salvando...' : 'Registrar Venda' }}
      </button>
    </form>

    <div class="list-container">
      <h2>Vendas Recentes</h2>
      <ul>
        <li v-for="venda in vendas" :key="venda.id">
          <span>Cliente: <strong>{{ venda.clientes?.nome }}</strong></span>
          <span>Produto: <strong>{{ venda.produtos_v2?.nome }}</strong></span>
          <span>Caixas: <strong>{{ venda.quantidade_caixas }}</strong></span>
          <button
            class="delete-button"
            @click="deletarVenda(venda.id)"
          >
            Deletar
          </button>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
}

h1, h2 {
  margin-bottom: 1.5rem;
}

.form-container, .list-container {
  margin-top: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.delete-button {
  background-color: #e53e3e;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.delete-button:hover {
  background-color: #c53030;
}
</style>
