<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const nome = ref('')
const email = ref('')
const telefone = ref('')
const endereco = ref('')

const clientes = ref([])
const loading = ref(false)

async function buscarClientes() {
  loading.value = true
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data) clientes.value = data
  loading.value = false
}

async function cadastrarCliente() {
  if (!nome.value) return

  const { error } = await supabase.from('clientes').insert([{
    nome: nome.value,
    email: email.value || null,
    telefone: telefone.value || null,
    endereco: endereco.value || null
  }])

  if (!error) {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    endereco.value = ''
    await buscarClientes()
  } else {
    alert(error.message)
  }
}

async function deletarCliente(id) {
  if (!confirm('Tem certeza?')) return

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (!error) await buscarClientes()
}

onMounted(() => {
  buscarClientes()
})
</script>

<template>
  <main>
    <h1>Cadastro de Clientes</h1>

    <div v-if="loading">Carregando...</div>

    <form
      v-if="!loading"
      @submit.prevent="cadastrarCliente"
      class="form-container"
    >
      <div class="form-group">
        <label>Nome</label>
        <input v-model="nome" required />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" />
      </div>

      <div class="form-group">
        <label>Telefone</label>
        <input v-model="telefone" />
      </div>

      <div class="form-group">
        <label>Endereço</label>
        <input v-model="endereco" />
      </div>

      <button type="submit">
        Cadastrar Cliente
      </button>
    </form>

    <div class="list-container">
      <h2>Clientes Cadastrados</h2>

      <ul>
        <li v-for="cliente in clientes" :key="cliente.id">
          <div class="cliente-info">
            <strong>{{ cliente.nome }}</strong>
            <small>{{ cliente.email || 'Sem email' }}</small>
            <span>{{ cliente.telefone || 'Sem telefone' }}</span>
            <span>{{ cliente.endereco || 'Sem endereço' }}</span>
          </div>

          <button
            class="delete-button"
            @click="deletarCliente(cliente.id)"
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
