<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const nome = ref('')
const categoria = ref('')
const produtos = ref([])

async function buscarProdutos() {
  const { data } = await supabase
    .from('produtos_v2')
    .select('*')
    .order('created_at', { ascending: false })

  if (data) produtos.value = data
}

async function cadastrarProduto() {
  if (!nome.value || !categoria.value) return

  const { error } = await supabase
    .from('produtos_v2')
    .insert([{ nome: nome.value, categoria: categoria.value }])

  if (!error) {
    nome.value = ''
    categoria.value = ''
    await buscarProdutos()
  }
}

async function deletarProduto(id) {
  const { error } = await supabase
    .from('produtos_v2')
    .delete()
    .eq('id', id)

  if (!error) await buscarProdutos()
}

onMounted(() => {
  buscarProdutos()
})
</script>

<template>
  <main>
    <h1>Cadastro de Produtos</h1>

    <form @submit.prevent="cadastrarProduto" class="form-container">
      <div class="form-group">
        <label>Nome do Produto</label>
        <input v-model="nome" required />
      </div>

      <div class="form-group">
        <label>Categoria</label>
        <input v-model="categoria" required />
      </div>

      <button type="submit">Cadastrar Produto</button>
    </form>

    <div class="list-container">
      <h2>Produtos Cadastrados</h2>
      <ul>
        <li v-for="produto in produtos" :key="produto.id">
          <strong>{{ produto.nome }}</strong>
          <span>{{ produto.categoria }}</span>
          <button
            class="delete-button"
            @click="deletarProduto(produto.id)"
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
  max-width: 600px;
  margin: auto;
}

.form-container {
  margin-top: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.list-container {
  margin-top: 2rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.delete-button {
  background-color: #e53e3e;
  padding: 0.4rem 0.8rem;
}
</style>
