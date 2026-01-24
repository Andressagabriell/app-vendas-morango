<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

// --- ESTADO DA PÁGINA ---
const produtos = ref([])
const loading = ref(true)

// --- ESTADO DO FORMULÁRIO ---
// Agora temos apenas um campo para o nome do produto, que será B1, B2 ou B3
const nomeProdutoSelecionado = ref('B1') // Define 'B1' como valor inicial

// --- FUNÇÕES DE DADOS ---

async function buscarProdutos() {
  loading.value = true
  const { data } = await supabase.from('produtos_v2').select('*').order('created_at', { ascending: false })
  if (data) produtos.value = data
  loading.value = false
}

async function cadastrarProduto() {
  // O nome e a categoria agora são o mesmo valor selecionado (B1, B2 ou B3)
  const nomeDoProduto = nomeProdutoSelecionado.value
  const categoriaDoProduto = nomeProdutoSelecionado.value

  const { error } = await supabase.from('produtos_v2').insert([{ 
    nome: nomeDoProduto, 
    categoria: categoriaDoProduto 
  }])

  if (error) {
    console.error("Erro ao cadastrar produto:", error)
    alert(`Falha ao cadastrar produto: ${error.message}`)
  } else {
    await buscarProdutos()
    alert(`Produto ${nomeDoProduto} cadastrado com sucesso!`)
  }
}

async function deletarProduto(idProduto) {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return
  const { error } = await supabase.from('produtos_v2').delete().eq('id', idProduto)
  if (!error) await buscarProdutos()
}

// Busca os produtos iniciais quando a página é montada
onMounted(() => {
  buscarProdutos()
})
</script>

<template>
  <main>
    <LoadingSpinner v-if="loading" />
    <div v-if="!loading">
      <h1>Cadastro de Produtos</h1>
      
      <!-- Formulário modificado para usar um menu de seleção (dropdown) -->
      <form @submit.prevent="cadastrarProduto" class="form-container">
        <div class="form-group">
          <label for="produto-nome">Produto:</label>
          <select id="produto-nome" v-model="nomeProdutoSelecionado">
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
          </select>
        </div>
        <button type="submit">Cadastrar Produto</button>
      </form>

      <div class="list-container">
        <h2>Produtos Cadastrados</h2>
        <ul>
          <!-- A lista agora mostra o nome, que já é a categoria -->
          <li v-for="produto in produtos" :key="produto.id">
            <strong>{{ produto.nome }}</strong>
            <button @click="deletarProduto(produto.id)" class="delete-button">Deletar</button>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 600px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; }
input, select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-left: 1rem; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; }
li strong { flex-grow: 1; }
</style>
