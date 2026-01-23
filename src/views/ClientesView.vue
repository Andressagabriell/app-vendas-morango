<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

// --- ESTADO DO FORMULÁRIO ---
const nome = ref('')
const email = ref('')
const telefone = ref('')
const endereco = ref('')

// --- ESTADO DA PÁGINA ---
const clientes = ref([])
const loading = ref(true)

// --- FUNÇÕES ---
async function buscarClientes() {
  loading.value = true
  const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
  if (data) clientes.value = data
  loading.value = false
}

async function cadastrarCliente() {
  const clienteParaInserir = { 
    nome: nome.value, 
    email: email.value, 
    telefone: telefone.value,
    endereco: endereco.value 
  };

  const { error } = await supabase.from('clientes').insert([clienteParaInserir]);
  
  if (error) {
    console.error('Erro ao cadastrar cliente:', error);
    alert(`Falha ao cadastrar: ${error.message}`);
  } else {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    endereco.value = ''
    await buscarClientes()
    alert('Cliente cadastrado com sucesso!');
  }
}

async function deletarCliente(idCliente) {
  if (!confirm('Tem certeza que deseja deletar este cliente?')) return;
  const { error } = await supabase.from('clientes').delete().eq('id', idCliente)
  if (!error) await buscarClientes()
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
      <form @submit.prevent="cadastrarCliente" class="form-container">
        <div class="form-group">
          <label for="nome">Nome:</label>
          <input type="text" id="nome" v-model="nome" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <!-- ATRIBUTO 'required' REMOVIDO DA LINHA ABAIXO -->
          <input type="email" id="email" v-model="email" />
        </div>
        <div class="form-group">
          <label for="telefone">Telefone:</label>
          <input type="tel" id="telefone" v-model="telefone" />
        </div>
        <div class="form-group">
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" v-model="endereco" />
        </div>
        <button type="submit">Cadastrar Cliente</button>
      </form>

      <div class="list-container">
        <h2>Clientes Cadastrados</h2>
        <ul>
          <li v-for="cliente in clientes" :key="cliente.id">
            <div class="cliente-info">
              <strong>{{ cliente.nome }}</strong>
              <span>{{ cliente.endereco || 'Sem endereço' }}</span>
            </div>
            <button @click="deletarCliente(cliente.id)" class="delete-button">Deletar</button>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
main { position: relative; padding: 2rem; max-width: 800px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-left: 1rem; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; }
.cliente-info { display: flex; flex-direction: column; flex-grow: 1; }
.cliente-info span { font-size: 0.9rem; color: #666; margin-top: 0.25rem; }
</style>
