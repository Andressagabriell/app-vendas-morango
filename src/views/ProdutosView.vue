<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const nome = ref('')
const categoria = ref('')
const produtos = ref([])

async function buscarProdutos() {
  const { data, error } = await supabase
    .from('produtos_v2')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error(error)
  if (data) produtos.value = data
}

async function cadastrarProduto() {
  if (!nome.value || !categoria.value) return

  const { error } = await supabase
    .from('produtos_v2')
    .insert([{ nome: nome.value, categoria: categoria.value }])

  if (error) console.error(error)
  else {
    nome.value = ''
    categoria.value = ''
    await buscarProdutos()
  }
}

async function deletarProduto(id) {
  if (!confirm('Tem certeza?')) return
  const { error } = await supabase.from('produtos_v2').delete().eq('id', id)
  if (error) console.error(error)
  await buscarProdutos()
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
        <label for="nome">Nome do Produto:</label>
        <input type="text" id="nome" v-model="nome" required />
      </div>

      <div class="form-group">
        <label for="categoria">Categoria:</label>
        <input type="text" id="categoria" v-model="categoria" required />
      </div>

      <button type="submit">Cadastrar Produto</button>
    </form>

    <div class="list-container">
      <h2>Produtos Cadastrados</h2>
      <ul>
        <li v-for="produto in produtos" :key="produto.id">
          <div>
            <strong>{{ produto.nome }}</strong>
            <span>{{ produto.categoria }}</span>
          </div>
          <button @click="deletarProduto(produto.id)">Deletar</button>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 600px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
label { margin-bottom: 0.3rem; font-weight: bold; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: #007bff; color: white; font-weight: bold; cursor: pointer; }
.list-container ul { list-style: none; padding: 0; }
.list-container li { display: flex; justify-content: space-between; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 0.5rem; }
.list-container li div { display: flex; flex-direction: column; gap: 0.2rem; }
</style>
