<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const vendas = ref([])
const carregando = ref(false)

async function buscarVendas() {
  carregando.value = true
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      id,
      quantidade_caixas,
      entregue,
      tipo_pagamento,
      created_at,
      clientes_v2 (nome, telefone, endereco),
      produtos_v2 (nome)
    `)
    .order('created_at', { ascending: false })

  if (data) vendas.value = data
  carregando.value = false
}

async function alternarEntrega(venda) {
  const novoStatus = !venda.entregue
  const { error } = await supabase
    .from('vendas')
    .update({ entregue: novoStatus })
    .eq('id', venda.id)
  
  if (!error) venda.entregue = novoStatus
}

async function mudarPagamento(venda, novoTipo) {
  const { error } = await supabase
    .from('vendas')
    .update({ tipo_pagamento: novoTipo })
    .eq('id', venda.id)
  
  if (!error) venda.tipo_pagamento = novoTipo
}

// Funções de integração
function abrirWhatsApp(telefone, nome) {
  if (!telefone) return alert('Telefone não cadastrado')
  const msg = encodeURIComponent(`Olá ${nome}, estou saindo para entregar seu pedido!`)
  window.open(`https://wa.me/55${telefone.replace(/\D/g, '' )}?text=${msg}`, '_blank')
}

function abrirGoogleMaps(endereco) {
  if (!endereco) return alert('Endereço não cadastrado')
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco )}`, '_blank')
}

function abrirWaze(endereco) {
  if (!endereco) return alert('Endereço não cadastrado')
  window.open(`https://waze.com/ul?q=${encodeURIComponent(endereco )}&navigate=yes`, '_blank')
}

onMounted(() => buscarVendas())
</script>

<template>
  <main>
    <h1>Relatório de Entregas</h1>

    <div v-if="carregando" class="loading">Carregando entregas...</div>

    <div v-else class="list-container">
      <div v-for="venda in vendas" :key="venda.id" class="card-entrega" :class="{ 'entregue': venda.entregue }">
        <div class="info">
          <div class="header-card">
            <strong>{{ venda.clientes_v2?.nome }}</strong>
            <div class="status-checks">
              <!-- Checkbox de Entrega -->
              <label class="check-label">
                <input type="checkbox" :checked="venda.entregue" @change="alternarEntrega(venda)" />
                <span>Entregue</span>
              </label>
            </div>
          </div>
          
          <p>{{ venda.produtos_v2?.nome }} - {{ venda.quantidade_caixas }} caixas</p>
          <small>{{ venda.clientes_v2?.endereco }}</small>

          <!-- SELETOR DE PAGAMENTO -->
          <div class="pagamento-container">
            <span class="label-pagto">Pagamento:</span>
            <div class="opcoes-pagto">
              <label :class="{ 'ativo': venda.tipo_pagamento === 'A Vista' }">
                <input type="radio" :name="'pagto-' + venda.id" value="A Vista" 
                       :checked="venda.tipo_pagamento === 'A Vista'" 
                       @change="mudarPagamento(venda, 'A Vista')" />
                À Vista
              </label>
              <label :class="{ 'ativo': venda.tipo_pagamento === 'A Prazo' }">
                <input type="radio" :name="'pagto-' + venda.id" value="A Prazo" 
                       :checked="venda.tipo_pagamento === 'A Prazo'" 
                       @change="mudarPagamento(venda, 'A Prazo')" />
                A Prazo
              </label>
            </div>
          </div>
        </div>

        <div class="acoes">
          <button @click="abrirWhatsApp(venda.clientes_v2?.telefone, venda.clientes_v2?.nome)" class="btn-whats">WhatsApp</button>
          <button @click="abrirGoogleMaps(venda.clientes_v2?.endereco)" class="btn-maps">Maps</button>
          <button @click="abrirWaze(venda.clientes_v2?.endereco)" class="btn-waze">Waze</button>
        </div>
      </div>

      <div v-if="vendas.length === 0" class="empty">Nenhuma entrega pendente.</div>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; }
h1 { margin-bottom: 2rem; color: #333; }
.loading, .empty { text-align: center; padding: 2rem; color: #666; }

.card-entrega {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.card-entrega.entregue { background-color: #f0fdf4; border-color: #bbf7d0; }

.header-card { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.header-card strong { font-size: 1.2rem; color: #222; }

.status-checks { display: flex; gap: 1rem; }
.check-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
.check-label input { width: 20px; height: 20px; }

/* Estilo do Pagamento */
.pagamento-container { margin-top: 1rem; padding-top: 0.8rem; border-top: 1px dashed #eee; display: flex; align-items: center; gap: 1rem; }
.label-pagto { font-weight: bold; font-size: 0.9rem; color: #555; }
.opcoes-pagto { display: flex; gap: 0.5rem; }
.opcoes-pagto label {
  padding: 0.3rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9f9f9;
}
.opcoes-pagto label.ativo {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: hsla(160, 100%, 37%, 1);
}
.opcoes-pagto input { display: none; }

.acoes { display: flex; gap: 0.5rem; margin-top: 1rem; }
.acoes button { flex: 1; padding: 0.6rem; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; font-size: 0.8rem; }
.btn-whats { background-color: #25d366; }
.btn-maps { background-color: #4285f4; }
.btn-waze { background-color: #333; }

p { margin: 0.2rem 0; color: #333; }
small { color: #666; display: block; margin-top: 0.2rem; font-style: italic; }
</style>
