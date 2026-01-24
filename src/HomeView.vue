<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const loading = ref(true)
const vendas = ref([])

const chartData = computed(() => {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const data = Array(7).fill(0)
  const hoje = new Date()
  const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()))

  for (const venda of vendas.value) {
    const dataVenda = new Date(venda.created_at)
    if (dataVenda >= inicioSemana) {
      data[dataVenda.getDay()] += venda.quantidade_caixas
    }
  }
  return {
    labels,
    datasets: [{ 
      label: 'Caixas Vendidas na Semana',
      backgroundColor: '#42b883',
      data 
    }]
  }
})

const monitoramentoClientes = computed(() => {
  const hoje = new Date()
  const inicioSemanaAtual = new Date(new Date().setDate(hoje.getDate() - hoje.getDay()))
  const inicioSemanaAnterior = new Date(new Date().setDate(hoje.getDate() - hoje.getDay() - 7))

  const consumo = {}

  for (const venda of vendas.value) {
    if (!venda.clientes) continue;
    const dataVenda = new Date(venda.created_at)
    const clienteNome = venda.clientes.nome
    
    if (!consumo[clienteNome]) {
      consumo[clienteNome] = { semanaAtual: 0, semanaAnterior: 0 }
    }

    if (dataVenda >= inicioSemanaAtual) {
      consumo[clienteNome].semanaAtual += venda.quantidade_caixas
    } else if (dataVenda >= inicioSemanaAnterior) {
      consumo[clienteNome].semanaAnterior += venda.quantidade_caixas
    }
  }
  return Object.entries(consumo).map(([nome, dados]) => ({ nome, ...dados }))
})

async function fetchData() {
  loading.value = true
  // CORRIGIDO: Busca o nome do cliente da nova tabela 'clientes_v2'
  const { data: vendasData } = await supabase
    .from('vendas')
    .select('*, clientes:clientes_v2(nome), quantidade_caixas, created_at')
  
  if (vendasData) vendas.value = vendasData
  loading.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <main>
    <LoadingSpinner v-if="loading" />
    <div v-if="!loading">
      <h1>Dashboard de Vendas</h1>
      <div class="dashboard-grid">
        <div class="chart-container card">
          <h2>Vendas da Semana</h2>
          <Bar :data="chartData" />
        </div>
        <div class="monitor-container card">
          <h2>Monitoramento de Clientes</h2>
          <ul>
            <li v-for="cliente in monitoramentoClientes" :key="cliente.nome">
              <span class="cliente-nome">{{ cliente.nome }}</span>
              <div class="dados-semana">
                <span>Semana Atual: {{ cliente.semanaAtual }}</span>
                <span>Semana Anterior: {{ cliente.semanaAnterior }}</span>
              </div>
              <div class="indicador">
                <span v-if="cliente.semanaAtual > cliente.semanaAnterior" class="aumento">▲</span>
                <span v-else-if="cliente.semanaAtual < cliente.semanaAnterior" class="diminuicao">▼</span>
                <span v-else class="estavel">▬</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main { padding: 2rem; }
h1, h2 { margin-bottom: 1.5rem; }
.dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
ul { list-style: none; padding: 0; }
li { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0; }
.cliente-nome { flex-grow: 1; font-weight: bold; }
.dados-semana { display: flex; flex-direction: column; align-items: flex-end; margin: 0 1rem; font-size: 0.9rem; }
.indicador span { font-size: 1.5rem; width: 30px; text-align: center; }
.aumento { color: #4caf50; }
.diminuicao { color: #f44336; }
.estavel { color: #9e9e9e; }
</style>
