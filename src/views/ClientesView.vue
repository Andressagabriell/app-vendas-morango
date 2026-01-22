<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

// Formulário
const nome = ref('')
const email = ref('')
const telefone = ref('')
const endereco = ref('')

// Estado da página
const clientes = ref([])
const loading = ref(false)

// Buscar clientes
async function buscarClientes() {
  loading.value = true

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    alert('Erro ao buscar clientes: ' + error.message)
    console.error(error)
  } else {
    clientes.value = data || []
  }

  loading.value = false
}

// Cadastrar cliente
async function cadastrarCliente() {
  const { error } = await supabase.from('clientes').insert([{
    nome: nome.value.trim(),
    email: email.value.trim(),
    telefone: telefone.value.trim(),
    endereco: endereco.value.trim()
  }])

  if (error) {
    alert('Erro ao cadastrar cliente: ' + error.message)
    console.error(error)
    return
  }

  // Limpa formulário
  nome.value = ''
  email.value = ''
  telefone.value = ''
  endereco.value = ''

  await buscarClientes()
}

// Deletar cliente
async function deletarCliente(idCliente) {
  if (!confirm('Tem certeza que deseja deletar este cliente?')) return

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', idCliente)

  if (error) {
    alert('Erro ao deletar cliente: ' + error.message)
    console.error(error)
  } else {
    await buscarClientes()
  }
}

// Inicialização
onMounted(() => {
  buscarClientes()
})
</script>

<template>
  <main>
    <LoadingSpinner v-if="loading" />

    <h1>Cadastro de Clientes</h1>

    <div v-if="!loading">
      <form @submit.prevent="() => { alert('Botão funcionando'); cadastrarCliente() }" class="form-container">
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
          <input
            type="text"
            id="endereco"
            v-model="endereco"
            placeholder="Rua, número, bairro, cidade"
          />
        </div>

        <button type="submit">Cadastrar Cliente</button>
      </form>

      <div class="list-container">
        <h2>Clientes Cadastrados</h2>

        <ul>
          <li v-for="cliente in clientes" :key="cliente.id">
            <div class="cliente-info">
              <strong>{{ cliente.nome }}</strong>
              <small>{{ cliente.email || 'Sem email' }}</small>
              <span>{{ cliente.telefone || 'Sem telefone' }}</span>
              <span class="endereco">
                📍 {{ cliente.endereco || 'Sem endereço cadastrado' }}
              </span>
            </div>

            <button
              @click="deletarCliente(cliente.id)"
              class="delete-button"
            >
              Deletar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
}

h1, h2 {
  margin-bottom: 1.5rem;
}

.form-container, .list-container {
  margin-top: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  margin-bottom: 0.5rem;
  font-weight: bold;
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
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.delete-button {
  background-color: #e53e3e;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  margin-left: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.cliente-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.endereco {
  font-size: 0.85rem;
  color: #555;
}
</style>
