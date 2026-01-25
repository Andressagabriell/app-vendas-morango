<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const produtos = ref([])
const produtoSelecionado = ref('B1')
const carregando = ref(false)

async function buscarProdutos() {
  const { data } = await supabase.from('produtos_v2').select('*').order('nome')
  if (data) produtos.value = data
}

async function cadastrarProduto() {
  carregando.value = true
  const { error } = await supabase.from('produtos_v2').insert([
    { nome: produtoSelecionado.value, categoria: produtoSelecionado.value }
  ])
  carregando.value = false
  
  if (!error) {
    await buscarProdutos()
    alert('Produto ' + produtoSelecionado.value + ' cadastrado!')
  } else {
    alert('Erro: ' + error.message)
  }
}

async function deletarProduto(id) {
  if (!confirm('Deseja remover este produto?')) return
  const { error } = await supabase.from('produtos_v2').delete().eq('id', id)
  if (!error) await buscarProdutos()
}

onMounted(() => buscarProdutos())
</script>

<template>
  <main>
    <h1>Cadastro de Produtos</h1>
    
    <form @submit.prevent="cadastrarProduto" class="form-container">
      <div class="form-group">
        <label for="produto">Selecione o Produto (B1, B2 ou B3):</label>
        <select id="produto" v-model="produtoSelecionado" required>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="B3">B3</option>
        </select>
      </div>
      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Cadastrando...' : 'Cadastrar Produto' }}
      </button>
    </form>

    <div class="list-container">
      <h2>Produtos Cadastrados</h2>
      <ul>
        <li v-for="p in produtos" :key="p.id">
          <strong>{{ p.nome }}</strong>
          <button @click="deletarProduto(p.id)" class="delete-button">Deletar</button>
        </li>
        <li v-if="produtos.length === 0" style="justify-content: center; color: #666;">
          Nenhum produto cadastrado.
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 600px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; }
input, select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; width: 100%; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-left: 1rem; width: auto; }
.delete-button:hover { background-color: #c53030; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; }
li strong { flex-grow: 1; font-size: 1.1rem; }
</style>
