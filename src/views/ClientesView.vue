<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const nome = ref('')
const email = ref('')
const telefone = ref('')
const endereco = ref('')

const clientes = ref([])

async function buscarClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data) {
    clientes.value = data
  }
}

async function cadastrarCliente() {
  if (!nome.value || !telefone.value) return

  const { error } = await supabase
    .from('clientes')
    .insert([{
      nome: nome.value,
      email: email.value,
      telefone: telefone.value,
      endereco: endereco.value
    }])

  if (!error) {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    endereco.value = ''
    await buscarClientes()
  }
}

async function deletarCliente(id) {
  const confirmar = confirm('Tem certeza?')
  if (!confirmar) return

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (!error) {
    await buscarClientes()
  }
}

onMounted(() => {
  buscarClientes()
})
</script>

<template>
  <main>
    <h1>Cadastro de Clientes</h1>

    <form @submit.prevent="cadastrarCliente" class="form-container">
      <div class="form-group">
        <label>Nome</label>
        <input v-model="nome" type="text" required />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" />
      </div>

      <div class="form-group">
        <label>Telefone</label>
        <input v-model="telefone" type="text" required />
      </div>

      <div class="form-group">
        <label>Endereço</label>
        <input v-model="endereco" type="text" />
      </div>

      <button type="submit">Cadastrar Cliente</button>
    </form>

    <div class="list-container" v-if="clientes.length">
      <h2>Clientes Cadastrados</h2>
      <ul>
        <li v-for="cliente in clientes" :key="cliente.id">
          <strong>{{ cliente.nome }}</strong>
          <small>{{ cliente.email || 'Sem email' }}</small>
          <span>{{ cliente.telefone }}</span>
          <span>📍 {{ cliente.endereco || 'Sem endereço' }}</span>
          <button @click="deletarCliente(cliente.id)" class="delete-button">Deletar</button>
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

h1, h2 {
  margin-bottom: 1rem;
}

.form-container {
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #16a34a;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button {
  background-color: #dc2626;
  padding: 0.5rem 0.75rem;
  margin-left: 1rem;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
