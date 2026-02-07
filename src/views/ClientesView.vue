<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

// --- ESTADO ---
const clientes = ref([])
const carregando = ref(false)
const editando = ref(false)
const idClienteEmEdicao = ref(null)

// --- FORMULÁRIO ---
const form = ref({
  nome: '',
  email: '',
  telefone: '',
  endereco: ''
})

// --- FUNÇÕES ---
async function buscarClientes() {
  const { data } = await supabase.from('clientes_v2').select('*').order('nome')
  if (data) clientes.value = data
}

async function salvarCliente() {
  if (!form.value.nome) return alert('O nome é obrigatório!')
  carregando.value = true

  if (editando.value) {
    // ATUALIZAR CLIENTE EXISTENTE
    const { error } = await supabase
      .from('clientes_v2')
      .update({
        nome: form.value.nome,
        email: form.value.email,
        telefone: form.value.telefone,
        endereco: form.value.endereco
      })
      .eq('id', idClienteEmEdicao.value)

    if (!error) {
      alert('Cliente atualizado com sucesso!')
      cancelarEdicao()
    } else {
      alert('Erro ao atualizar: ' + error.message)
    }
  } else {
    // CADASTRAR NOVO CLIENTE
    const { error } = await supabase.from('clientes_v2').insert([form.value])
    if (!error) {
      alert('Cliente cadastrado com sucesso!')
      limparFormulario()
    } else {
      alert('Erro ao cadastrar: ' + error.message)
    }
  }

  await buscarClientes()
  carregando.value = false
}

function prepararEdicao(cliente) {
  editando.value = true
  idClienteEmEdicao.value = cliente.id
  form.value = { ...cliente }
  // Rola a página para o topo para facilitar a edição
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  editando.value = false
  idClienteEmEdicao.value = null
  limparFormulario()
}

function limparFormulario() {
  form.value = { nome: '', email: '', telefone: '', endereco: '' }
}

async function deletarCliente(id) {
  if (!confirm('Tem certeza que deseja remover este cliente?')) return
  const { error } = await supabase.from('clientes_v2').delete().eq('id', id)
  if (!error) await buscarClientes()
}

onMounted(() => buscarClientes())
</script>

<template>
  <main>
    <h1>{{ editando ? 'Editar Cliente' : 'Cadastro de Clientes' }}</h1>
    
    <form @submit.prevent="salvarCliente" class="form-container">
      <div class="form-group">
        <label>Nome:</label>
        <input type="text" v-model="form.nome" required placeholder="Nome completo" />
      </div>
      
      <div class="form-group">
        <label>Telefone:</label>
        <input type="text" v-model="form.telefone" placeholder="(00) 00000-0000" />
      </div>

      <div class="form-group">
        <label>E-mail:</label>
        <input type="email" v-model="form.email" placeholder="exemplo@email.com" />
      </div>

      <div class="form-group">
        <label>Endereço:</label>
        <input type="text" v-model="form.endereco" placeholder="Rua, número, bairro..." />
      </div>

      <div class="botoes-form">
        <button type="submit" :disabled="carregando" :class="{ 'btn-edit': editando }">
          {{ editando ? 'Salvar Alterações' : 'Cadastrar Cliente' }}
        </button>
        <button v-if="editando" type="button" @click="cancelarEdicao" class="btn-cancelar">
          Cancelar
        </button>
      </div>
    </form>

    <div class="list-container">
      <h2>Clientes Cadastrados</h2>
      <ul>
        <li v-for="c in clientes" :key="c.id">
          <div class="info-cliente">
            <strong>{{ c.nome }}</strong>
            <small>{{ c.telefone }}</small>
          </div>
          <div class="acoes-lista">
            <button @click="prepararEdicao(c)" class="edit-button">Editar</button>
            <button @click="deletarCliente(c.id)" class="delete-button">Deletar</button>
          </div>
        </li>
        <li v-if="clientes.length === 0" class="empty">Nenhum cliente cadastrado.</li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 600px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.3rem; font-weight: bold; }
input { padding: 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }

.botoes-form { display: flex; gap: 1rem; }
button { padding: 0.8rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; width: 100%; font-size: 1rem; }
.btn-edit { background-color: #4285f4; }
.btn-cancelar { background-color: #666; }

.acoes-lista { display: flex; gap: 0.5rem; }
.edit-button { background-color: #4285f4; padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; }

ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; background: white; }
.info-cliente { display: flex; flex-direction: column; }
.info-cliente strong { font-size: 1.1rem; }
.info-cliente small { color: #666; }
.empty { justify-content: center; color: #999; font-style: italic; }
</style>
