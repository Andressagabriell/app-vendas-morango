<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

// --- ESTADO ---
const clientes = ref([])
const produtos = ref([])
const vendas = ref([])
const carregando = ref(false)
const editando = ref(false)
const idVendaEmEdicao = ref(null)

// --- FORMULÁRIO ---
const form = ref({
  cliente_nome: '', // Usamos o nome para a busca
  cliente_id: '',   // Guardamos o ID para o banco
  produto_id: '',
  quantidade_caixas: 1
})

// --- FUNÇÕES ---
async function carregarDados() {
  const { data: c } = await supabase.from('clientes_v2').select('id, nome').order('nome')
  if (c) clientes.value = c
  
  const { data: p } = await supabase.from('produtos_v2').select('id, nome').order('nome')
  if (p) produtos.value = p

  buscarVendas()
}

async function buscarVendas() {
  const { data } = await supabase
    .from('vendas')
    .select(`
      id, 
      quantidade_caixas, 
      cliente_id, 
      produto_id,
      clientes_v2 (nome),
      produtos_v2 (nome)
    `)
    .order('created_at', { ascending: false })
    .limit(10)
  if (data) vendas.value = data
}

// Função para vincular o ID quando o nome é selecionado na busca
function atualizarClienteId() {
  const clienteEncontrado = clientes.value.find(c => c.nome === form.value.cliente_nome)
  if (clienteEncontrado) {
    form.value.cliente_id = clienteEncontrado.id
  } else {
    form.value.cliente_id = ''
  }
}

async function salvarVenda() {
  atualizarClienteId() // Garante que o ID está certo antes de salvar

  if (!form.value.cliente_id || !form.value.produto_id) {
    return alert('Por favor, selecione um cliente da lista e um produto!')
  }
  
  carregando.value = true

  const dadosVenda = {
    cliente_id: form.value.cliente_id,
    produto_id: form.value.produto_id,
    quantidade_caixas: Number(form.value.quantidade_caixas)
  }

  if (editando.value) {
    const { error } = await supabase.from('vendas').update(dadosVenda).eq('id', idVendaEmEdicao.value)
    if (!error) {
      alert('Venda atualizada!')
      cancelarEdicao()
    } else {
      alert('Erro: ' + error.message)
    }
  } else {
    const { error } = await supabase.from('vendas').insert([{ ...dadosVenda, entregue: false }])
    if (!error) {
      alert('Venda registrada!')
      limparFormulario()
    } else {
      alert('Erro: ' + error.message)
    }
  }

  await buscarVendas()
  carregando.value = false
}

function prepararEdicao(venda) {
  editando.value = true
  idVendaEmEdicao.value = venda.id
  form.value = {
    cliente_nome: venda.clientes_v2?.nome || '',
    cliente_id: venda.cliente_id,
    produto_id: venda.produto_id,
    quantidade_caixas: venda.quantidade_caixas
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  editando.value = false
  idVendaEmEdicao.value = null
  limparFormulario()
}

function limparFormulario() {
  form.value = { cliente_nome: '', cliente_id: '', produto_id: '', quantidade_caixas: 1 }
}

async function deletarVenda(id) {
  if (!confirm('Remover esta venda?')) return
  const { error } = await supabase.from('vendas').delete().eq('id', id)
  if (!error) await buscarVendas()
}

onMounted(() => carregarDados())
</script>

<template>
  <main>
    <h1>{{ editando ? 'Editar Venda' : 'Registrar Nova Venda' }}</h1>

    <form @submit.prevent="salvarVenda" class="form-container">
      
      <!-- BUSCA DE CLIENTE COM AUTO-COMPLETAR -->
      <div class="form-group">
        <label>Cliente (Digite para buscar):</label>
        <input 
          list="lista-clientes" 
          v-model="form.cliente_nome" 
          @input="atualizarClienteId"
          placeholder="Comece a digitar o nome..."
          required
        />
        <datalist id="lista-clientes">
          <option v-for="c in clientes" :key="c.id" :value="c.nome"></option>
        </datalist>
        <small v-if="form.cliente_id" class="success-msg">✓ Cliente selecionado</small>
        <small v-else-if="form.cliente_nome" class="error-msg">⚠ Selecione um nome da lista</small>
      </div>

      <div class="form-group">
        <label>Produto:</label>
        <select v-model="form.produto_id" required>
          <option value="" disabled>Selecione o produto</option>
          <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Quantidade (Caixas):</label>
        <input type="number" v-model="form.quantidade_caixas" min="1" required />
      </div>

      <div class="botoes-form">
        <button type="submit" :disabled="carregando" :class="{ 'btn-edit': editando }">
          {{ editando ? 'Salvar Alterações' : 'Confirmar Venda' }}
        </button>
        <button v-if="editando" type="button" @click="cancelarEdicao" class="btn-cancelar">
          Cancelar
        </button>
      </div>
    </form>

    <div class="list-container">
      <h2>Últimas Vendas</h2>
      <ul>
        <li v-for="v in vendas" :key="v.id">
          <div class="info-venda">
            <strong>{{ v.clientes_v2?.nome }}</strong>
            <small>{{ v.produtos_v2?.nome }} - {{ v.quantidade_caixas }} caixas</small>
          </div>
          <div class="acoes-lista">
            <button @click="prepararEdicao(v)" class="edit-button">Editar</button>
            <button @click="deletarVenda(v.id)" class="delete-button">Deletar</button>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 600px; margin: 0 auto; }
h1, h2 { margin-bottom: 1.5rem; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; }
input, select { padding: 0.7rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }

.success-msg { color: #28a745; font-size: 0.8rem; margin-top: 0.3rem; }
.error-msg { color: #dc3545; font-size: 0.8rem; margin-top: 0.3rem; }

.botoes-form { display: flex; gap: 1rem; }
button { padding: 0.75rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; width: 100%; }
button:disabled { background-color: #ccc; }
.btn-edit { background-color: #4285f4; }
.btn-cancelar { background-color: #666; }

.acoes-lista { display: flex; gap: 0.5rem; }
.edit-button { background-color: #4285f4; padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; }

ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; background: white; }
.info-venda { display: flex; flex-direction: column; }
.info-venda strong { font-size: 1.1rem; }
.info-venda small { color: #666; }
</style>
