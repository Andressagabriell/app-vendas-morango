
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

  if (error) console.error(error)
  if (data) clientes.value = data
  loading.value = false
}

async function cadastrarCliente() {
  if (!nome.value) return
  loading.value = true

  const { error } = await supabase
    .from('clientes')
    .insert([{
      nome: nome.value,
      email: email.value,
      telefone: telefone.value,
      endereco: endereco.value
    }])

  if (error) {
    console.error(error)
  } else {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    endereco.value = ''
    await buscarClientes()
  }

  loading.value = false
}

async function deletarCliente(id) {
  if (!confirm('Tem certeza?')) return
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) console.error(error)
  await buscarClientes()
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
        <label for="nome">Nome:</label>
        <input type="text" id="nome" v-model="nome" required />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" />
      </div>

      <div class="form-group">
        <label for="telefone">Telefone:</label>
        <input type="tel" id="telefone" v-model="telefone" />
      </div>

      <div class="form-group">
        <label for="endereco">Endereço:</label>
        <input type="text" id="endereco" v-model="endereco" placeholder="Rua, número, bairro, cidade" />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Cadastrar Cliente' }}
      </button>
    </form>

    <div class="list-container">
      <h2>Clientes Cadastrados</h2>
      <ul>
        <li v-for="cliente in clientes" :key="cliente.id">
          <div>
            <strong>{{ cliente.nome }}</strong>
            <span>{{ cliente.email || 'Sem email' }}</span>
            <span>{{ cliente.telefone || 'Sem telefone' }}</span>
            <span>{{ cliente.endereco || 'Sem endereço' }}</span>
          </div>
          <button @click="deletarCliente(cliente.id)">Deletar</button>
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
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: #28a745; color: white; font-weight: bold; cursor: pointer; }
button:disabled { background-color: #6c757d; cursor: not-allowed; }
.list-container ul { list-style: none; padding: 0; }
.list-container li { display: flex; justify-content: space-between; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 0.5rem; }
.list-container li div { display: flex; flex-direction: column; gap: 0.2rem; }
</style>
