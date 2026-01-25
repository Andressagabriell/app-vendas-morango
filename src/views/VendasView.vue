<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const clientes = ref([])
const produtos = ref([])
const clienteId = ref('')
const produtoId = ref('')
const quantidade = ref(1)
const carregando = ref(false)

async function carregarDados() {
  const { data: c } = await supabase.from('clientes_v2').select('id, nome').order('nome')
  if (c) clientes.value = c
  const { data: p } = await supabase.from('produtos_v2').select('id, nome').order('nome')
  if (p) produtos.value = p
}

async function registrarVenda() {
  if (!clienteId.value || !produtoId.value) {
    alert('Selecione o cliente e o produto!')
    return
  }

  carregando.value = true
  const { error } = await supabase.from('vendas').insert([
    {
      cliente_id: clienteId.value,
      produto_id: produtoId.value,
      quantidade_caixas: Number(quantidade.value),
      entregue: false
    }
  ])
  carregando.value = false

  if (error) {
    alert('Erro ao registrar venda: ' + error.message)
  } else {
    alert('Venda registrada com sucesso!')
    clienteId.value = ''
    produtoId.value = ''
    quantidade.value = 1
  }
}

onMounted(() => carregarDados())
</script>

<template>
  <main>
    <h1>Registrar Nova Venda</h1>

    <form @submit.prevent="registrarVenda" class="form-container">
      <div class="form-group">
        <label for="cliente">Cliente:</label>
        <select id="cliente" v-model="clienteId" required>
          <option value="" disabled>Selecione o cliente</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="produto">Produto:</label>
        <select id="produto" v-model="produtoId" required>
          <option value="" disabled>Selecione o produto</option>
          <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="quantidade">Quantidade (Caixas):</label>
        <input type="number" id="quantidade" v-model="quantidade" min="1" required />
      </div>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Registrando...' : 'Confirmar Venda' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 600px; margin: 0 auto; }
h1 { margin-bottom: 1.5rem; }
.form-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; }
input, select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; width: 100%; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
</style>
