<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const vendas = ref([])
const carregando = ref(false)

async function buscarVendas() {
  carregando.value = true
  // Busca vendas com dados do cliente e produto
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      *,
      clientes_v2 (nome, telefone, endereco),
      produtos_v2 (nome)
    `)
    .order('created_at', { ascending: false })

  if (data) vendas.value = data
  carregando.value = false
}

async function alternarEntrega(venda) {
  const { error } = await supabase
    .from('vendas')
    .update({ entregue: !venda.entregue })
    .eq('id', venda.id)
  
  if (!error) venda.entregue = !venda.entregue
}

// --- FUNÇÕES DE INTEGRAÇÃO ---

function abrirWhatsApp(telefone, nome) {
  const mensagem = encodeURIComponent(`Olá ${nome}, estou saindo para entregar seu pedido de morangos!`)
  window.open(`https://wa.me/55${telefone.replace(/\D/g, '' )}?text=${mensagem}`, '_blank')
}

function abrirGoogleMaps(endereco) {
  if (!endereco) return alert('Endereço não cadastrado')
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco )}`
  window.open(url, '_blank')
}

function abrirWaze(endereco) {
  if (!endereco) return alert('Endereço não cadastrado')
  const url = `https://waze.com/ul?q=${encodeURIComponent(endereco )}&navigate=yes`
  window.open(url, '_blank')
}

onMounted(() => buscarVendas())
</script>

<template>
  <main class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-red-600">Relatório de Entregas</h1>

    <div v-if="carregando" class="text-center p-10">Carregando entregas...</div>

    <div v-else class="space-y-4">
      <div v-for="venda in vendas" :key="venda.id" 
           :class="['p-4 rounded-lg border shadow-sm transition', venda.entregue ? 'bg-gray-100 border-gray-300' : 'bg-white border-red-200']">
        
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-bold text-lg">{{ venda.clientes_v2?.nome }}</h3>
            <p class="text-sm text-gray-600">{{ venda.produtos_v2?.nome }} - {{ venda.quantidade_caixas }} caixas</p>
            <p class="text-xs text-gray-500 mt-1 italic">{{ venda.clientes_v2?.endereco }}</p>
          </div>
          <input type="checkbox" :checked="venda.entregue" @change="alternarEntrega(venda)" class="w-6 h-6 accent-green-600" />
        </div>

        <!-- Botões de Ação -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button @click="abrirWhatsApp(venda.clientes_v2?.telefone, venda.clientes_v2?.nome)" 
                  class="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm font-bold flex items-center justify-center gap-1 hover:bg-green-600">
            WhatsApp
          </button>
          
          <button @click="abrirGoogleMaps(venda.clientes_v2?.endereco)" 
                  class="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm font-bold flex items-center justify-center gap-1 hover:bg-blue-600">
            Maps
          </button>

          <button @click="abrirWaze(venda.clientes_v2?.endereco)" 
                  class="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-sm font-bold flex items-center justify-center gap-1 hover:bg-black">
            Waze
          </button>
        </div>
      </div>

      <div v-if="vendas.length === 0" class="text-center p-10 text-gray-500">
        Nenhuma venda registrada para entrega.
      </div>
    </div>
  </main>
</template>
