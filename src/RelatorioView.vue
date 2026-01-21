<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const vendas = ref([])

// Busca todas as vendas com os dados relacionados
async function buscarVendas() {
  const { data } = await supabase
    .from('vendas')
    .select(`
      id,
      created_at,
      quantidade_caixas,
      entregue,
      clientes ( id, nome ),
      produtos ( id, nome )
    `)
    .order('created_at', { ascending: false })
  
  if (data) vendas.value = data
}

// Função para marcar uma venda como entregue/não entregue
async function alternarStatusEntrega(venda) {
  const novoStatus = !venda.entregue
  const { error } = await supabase
    .from('vendas')
    .update({ entregue: novoStatus })
    .eq('id', venda.id)

  if (error) {
    alert('Falha ao atualizar o status da entrega.')
  } else {
    // Atualiza o status localmente para uma resposta visual instantânea
    venda.entregue = novoStatus
  }
}

// Agrupa as vendas por cliente usando uma propriedade computada
const relatorioAgrupado = computed(() => {
  const agrupado = {}
  for (const venda of vendas.value) {
    if (!venda.clientes) continue; // Pula vendas sem cliente (dados corrompidos)
    
    const clienteId = venda.clientes.id
    if (!agrupado[clienteId]) {
      agrupado[clienteId] = {
        nomeCliente: venda.clientes.nome,
        produtos: []
      }
    }
    agrupado[clienteId].produtos.push(venda)
  }
  return agrupado
})

onMounted(() => {
  buscarVendas()
})
</script>

<template>
  <main>
    <h1>Relatório de Entregas</h1>
    <p>Agrupamento de produtos por cliente para entrega.</p>

    <div class="relatorio-container">
      <div v-for="(grupo, clienteId) in relatorioAgrupado" :key="clienteId" class="cliente-grupo">
        <h2>{{ grupo.nomeCliente }}</h2>
        <ul>
          <li v-for="venda in grupo.produtos" :key="venda.id" :class="{ 'entregue': venda.entregue }">
            <input 
              type="checkbox" 
              :checked="venda.entregue"
              @change="alternarStatusEntrega(venda)"
              class="checkbox-entrega"
            />
            <span class="produto-nome">{{ venda.produtos.nome }}</span>
            <span class="quantidade">Qtd: {{ venda.quantidade_caixas }} caixas</span>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.relatorio-container {
  margin-top: 2rem;
}
.cliente-grupo {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}
h2 {
  border-bottom: 2px solid hsla(160, 100%, 37%, 1);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #fff;
  transition: background-color 0.3s;
}
li.entregue {
  background-color: #e8f5e9; /* Verde claro */
}
li.entregue .produto-nome {
  text-decoration: line-through;
  color: #888;
}
.checkbox-entrega {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.produto-nome {
  flex-grow: 1;
  font-weight: bold;
}
.quantidade {
  font-style: italic;
  color: #555;
}
</style>
