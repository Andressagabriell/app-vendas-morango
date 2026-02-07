<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

// --- ESTADO ---
const clientes = ref([])
const produtos = ref([])
const vendas = ref([])
const carregando = ref(false)
const editando = ref(false)
const idVendaEmEdicao = ref(null)
const buscaCliente = ref('') // Para a barra de busca

// --- FORMULÁRIO ---
const form = ref({
  cliente_id: '',
  produto_id: '',
  quantidade_caixas: 1
})

// --- LÓGICA DE BUSCA ---
const clientesFiltrados = computed(() => {
  if (!buscaCliente.value) return clientes.value
  return clientes.value.filter(c => 
    c.nome.toLowerCase().includes(buscaCliente.value.toLowerCase())
  )
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

async function salvarVenda() {
  if (!form.value.cliente_id || !form.value.produto_id) return alert('Selecione o cliente e o produto!')
  carregando.value = true

  const dados = {
    cliente_id: form.value.cliente_id,
    produto_id: form.value.produto_id,
    quantidade_caixas: Number(form.value.quantidade_caixas)
  }

  if (editando.value) {
    const { error } = await supabase.from('vendas').update(dados).eq('id', idVendaEmEdicao.value)
    if (!error) {
      alert('Venda atualizada!')
      cancelarEdicao()
    }
  } else {
    const { error } = await supabase.from('vendas').insert([{ ...dados, entregue: false }])
    if (!error) {
      alert('Venda registrada!')
      limparFormulario()
    }
  }

  await buscarVendas()
  carregando.value = false
}

function prepararEdicao(venda) {
  editando.value = true
  idVendaEmEdicao.value = venda.id
  form.value = {
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
  form.value = { cliente_id: '', produto_id: '', quantidade_caixas: 1 }
  buscaCliente.value = ''
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
      <!-- BARRA DE BUSCA (Estilizada) -->
      <div class="form-group">
        <label>Buscar Cliente:</label>
        <input 
          type="text" 
          v-model="buscaCliente" 
          placeholder="Digite o nome para filtrar..." 
          class="search-input"
        />
      </div>

      <div class="form-group">
        <label>Selecionar Cliente:</label>
        <select v-model="form.cliente_id" required>
          <option value="" disabled>Selecione o cliente</option>
          <option v-for="c in clientesFiltrados" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
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
/* RESTAURANDO O VISUAL PADRÃO QUE VOCÊ GOSTA */
main { padding: 2rem; max-width: 600px; margin: 0 auto; font-family: sans-serif; }
h1, h2 { margin-bottom: 1.5rem; color: #333; }
.form-container, .list-container { margin-top: 2rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
label { margin-bottom: 0.5rem; font-weight: bold; color: #444; }
input, select { padding: 0.7rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }

/* Estilo da barra de busca */
.search-input { background-color: #f0fdf4; border: 1px dashed hsla(160, 100%, 37%, 1); margin-bottom: 0.5rem; }

.botoes-form { display: flex; gap: 1rem; }
button { padding: 0.8rem; border: none; border-radius: 4px; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; width: 100%; font-size: 1rem; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
.btn-edit { background-color: #4285f4; }
.btn-cancelar { background-color: #666; }

.acoes-lista { display: flex; gap: 0.5rem; }
.edit-button { background-color: #4285f4; padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; }
.delete-button { background-color: #e53e3e; padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto; }

ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; background: white; }
.info-venda { display: flex; flex-direction: column; }
.info-venda strong { font-size: 1.1rem; color: #222; }
.info-venda small { color: #666; margin-top: 0.2rem; }
</style>
