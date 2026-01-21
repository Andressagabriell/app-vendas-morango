<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const nome = ref('')
const email = ref('')
const telefone = ref('')
const endereco = ref('')

const clientes = ref([])
const loading = ref(true)

async function buscarClientes() {
  loading.value = true

  const { data } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (data) clientes.value = data
  loading.value = false
}

async function cadastrarCliente() {
  const { error } = await supabase.from('clientes').insert([
    {
      nome: nome.value,
      email: email.value,
      telefone: telefone.value,
      endereco: endereco.value
    }
  ])

  if (!error) {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    endereco.value = ''
    await buscarClientes()
  }
}

async function deletarCliente(idCliente) {
  if (!confirm('Tem certeza?')) return

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', idCliente)

  if (!error) {
    await buscarClientes()
  }
}

// 📍 Abre endereço no Google Maps
function abrirMapa(endereco) {
  if (!endereco) return
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
  window.open(url, '_blank')
}

// 📲 Abre WhatsApp com número do cliente
function abrirWhatsApp(telefone) {
  if (!telefone) return

  const numeroLimpo = telefone.replace(/\D/g, '')
  const url = `https://wa.me/55${numeroLimpo}` // 55 = Brasil
  window.open(url, '_blank')
}

onMounted(() => {
  buscarClientes()
})
</script>

<template>
  <main>
    <LoadingSpinner v-if="loading" />

    <h1>Cadastro de Clientes</h1>

    <div v-if="!loading">
      <form class="form-container" @submit.prevent="cadastrarCliente">

        <div class="form-group">
          <label for="nome">Nome:</label>
          <input id="nome" v-model="nome" type="text" required />
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="email" type="email" />
        </div>

        <div class="form-group">
          <label for="telefone">Telefone:</label>
          <input id="telefone" v-model="telefone" type="tel" placeholder="(11) 99999-9999" />
        </div>

        <div class="form-group">
          <label for="endereco">Endereço:</label>
          <input
            id="endereco"
            v-model="endereco"
            type="text"
            placeholder="Rua, número, bairro, cidade"
          />
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
              <span class="endereco">
                📍 {{ cliente.endereco || 'Sem endereço cadastrado' }}
              </span>

              <div class="acoes">
                <button
                  class="map-button"
                  @click="abrirMapa(cliente.endereco)"
                >
                  📍 Mapa
                </button>

                <button
                  class="whatsapp-button"
                  @click="abrirWhatsApp(cliente.telefone)"
                >
                  📲 WhatsApp
                </button>
              </div>
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
    </div>
  </main>
</template>

<style scoped>
main {
  position: relative;
  padding: 2rem;
  max-width: 750px;
  margin: 0 auto;
}

h1,
h2 {
  margin-bottom: 1.5rem;
}

.form-container,
.list-container {
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
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.delete-button {
  background-color: #e53e3e;
  color: white;
  font-size: 0.8rem;
}

.map-button {
  background-color: #3182ce;
  color: white;
}

.whatsapp-button {
  background-color: #25d366;
  color: white;
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
  gap: 0.4rem;
}

.acoes {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.endereco {
  font-size: 0.85rem;
  color: #555;
}
</style>
