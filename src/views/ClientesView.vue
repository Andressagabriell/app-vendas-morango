<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const nome = ref('')
const email = ref('')
const telefone = ref('')

const clientes = ref([])

async function buscarClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error(error)
  if (data) clientes.value = data
}

async function cadastrarCliente() {
  if (!nome.value) return

  const { error } = await supabase
    .from('clientes')
    .insert([{
      nome: nome.value,
      email: email.value,
      telefone: telefone.value
    }])

  if (error) console.error(error)
  else {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    await buscarClientes()
  }
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

      <button type="submit">Cadastrar Cliente</button>
    </form>

    <div class="list-container">
      <h2>Clientes Cadastrados</h2>
      <ul>
        <li v-for="cliente in clientes" :key="cliente.id">
          <div>
            <strong>{{ cliente.nome }}</strong>
            <span>{{ cliente.email || 'Sem email' }}</span>
            <span>{{ cliente.telefone || 'Sem telefone' }}</span>
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
.list-container ul { list-style: none; padding: 0; }
.list-container li { display: flex; justify-content: space-between; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 0.5rem; }
.list-container li div { display: flex; flex-direction: column; gap: 0.2rem; }
</style>
