<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

// --- ESTADO DA PÁGINA ---
const clientes = ref([])
const produtos = ref([])
const vendas = ref([])
const loading = ref(true)

// --- ESTADO DO FORMULÁRIO ---
const clienteSelecionado = ref(null)
const produtoSelecionado = ref(null)
const quantidadeCaixas = ref(1)

// --- FUNÇÕES DE DADOS ---

async function buscarDadosIniciais() {
  loading.value = true

  try {
    // Busca clientes
    const { data: clientesData, error: clientesError } = await supabase
      .from('clientes_v2')
      .select('id, nome')

    if (clientesError) throw clientesError
    clientes.value = clientesData || []

    // Busca produtos
    const { data: produtosData, error: produtosError } = await supabase
      .from('produtos_v2')
      .select('id, nome')

    if (produtosError) throw produtosError
    produtos.value = produtosData || []

    // Busca vendas
    await buscarVendas()
  } catch (err) {
    console.error('Erro ao buscar dados iniciais:', err)
    alert('Erro ao carregar dados da página. Veja o console.')
  } finally {
    loading.value = false
  }
}

async function buscarVendas() {
  try {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        id,
        quantidade_caixas,
        created_at,
        cliente:clientes_v2(nome),
        produto:produtos_v2(nome)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    vendas.value = data || []
  } catch (err) {
    console.error('Erro ao buscar vendas:', err)
  }
}

async function registrarVenda() {
  console.log('Cliente:', clienteSelecionado.value)
  console.log('Produto:', produtoSelecionado.value)
  console.log('Quantidade:', quantidadeCaixas.value)

  if (!clienteSelecionado.value || !produtoSelecionado.value) {
    alert('Por favor, selecione um cliente e um produto.')
    return
  }

  try {
    const { error } = await supabase.from('vendas').insert([
      {
        cliente_id: clienteSelecionado.value,
        produto_id: produtoSelecionado.value,
        quantidade_caixas: quantidadeCaixas.value
      }
    ])

    if (error) throw error

    // Limpa formulário
    clienteSelecionado.value = null
    produtoSelecionado.value = null
    quantidadeCaixas.value = 1

    await buscarVendas()
    alert('Venda registrada com sucesso! ✅')
  } catch (err) {
    console.error('Erro ao registrar venda:', err)
    alert(`Falha ao registrar venda: ${err.message}`)
  }
}

async function deletarVenda(idVenda) {
  if (!confirm('Tem certeza que deseja deletar esta venda?')) return

  try {
    const { error } = await supabase
      .from('vendas')
      .delete()
      .eq('id', idVenda)

    if (error) throw error

    await buscarVendas()
  } catch (err) {
    console.error('Erro ao deletar venda:', err)
    alert('Erro ao deletar venda. Veja o console.')
  }
}

// --- CICLO DE VIDA ---
onMounted(() => {
  buscarDadosIniciais()
})
</script>

<template>
  <main>
    <LoadingSpinner v-if="loading" />

    <div v-else>
      <h1>Registro de Vendas</h1>

      <form @submit.prevent="registrarVenda" class="form-container">
        <div class="form-group">
          <label for="cliente">Cliente:</label>
          <select
            id="cliente"
            v-model.number="clienteSelecionado"
            required
          >
            <option :value="null" disabled>Selecione um cliente</option>
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
          <label for="produto">Produto:</label>
          <select
            id="produto"
            v-model.number="produtoSelecionado"
            required
          >
            <option :value="null" disabled>Selecione um produto</option>
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
          <label for="quantidade">Quantidade de Caixas:</label>
          <input
            type="number"
            id="quantidade"
            v-model.number="quantidadeCaixas"
            min="1"
            required
          />
        </div>

        <button type="submit">Registrar Venda</button>
      </form>

      <div class="list-container">
        <h2>Vendas Recentes</h2>

        <ul v-if="vendas.length">
          <li v-for="venda in vendas" :key="venda.id">
            <span>
              Cliente:
              <strong>{{ venda.cliente?.nome || 'N/A' }}</strong>
            </span>

            <span>
              Produto:
              <strong>{{ venda.produto?.nome || 'N/A' }}</strong>
            </span>

            <span>
              Caixas:
              <strong>{{ venda.quantidade_caixas }}</strong>
            </span>

            <button
              @click="deletarVenda(venda.id)"
              class="delete-button"
            >
              Deletar
            </button>
          </li>
        </ul>

        <p v-else>Nenhuma venda registrada ainda.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1,
h2 {
  margin-bottom: 1.5rem;
}

.form-container,
.list-container {
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

input,
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
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
