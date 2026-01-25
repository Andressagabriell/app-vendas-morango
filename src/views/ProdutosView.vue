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
  <main class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-red-600">Cadastro de Produtos</h1>
    
    <form @submit.prevent="cadastrarProduto" class="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
      <div class="mb-4">
        <label class="block font-bold mb-2">Selecione o Produto:</label>
        <select v-model="produtoSelecionado" class="w-full p-3 border rounded border-gray-300 text-lg focus:ring-2 focus:ring-red-500">
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="B3">B3</option>
        </select>
      </div>
      <button type="submit" :disabled="carregando" class="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">
        {{ carregando ? 'Salvando...' : 'Cadastrar Produto' }}
      </button>
    </form>

    <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <h2 class="text-xl font-bold p-4 border-b bg-gray-50">Produtos Ativos</h2>
      <ul class="divide-y divide-gray-200">
        <li v-for="p in produtos" :key="p.id" class="p-4 flex justify-between items-center">
          <span class="text-xl font-bold text-gray-800">{{ p.nome }}</span>
          <button @click="deletarProduto(p.id)" class="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition">
            Deletar
          </button>
        </li>
        <li v-if="produtos.length === 0" class="p-8 text-center text-gray-500">Nenhum produto cadastrado.</li>
      </ul>
    </div>
  </main>
</template>
