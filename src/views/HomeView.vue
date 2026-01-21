<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const vendas = ref([])
const loading = ref(true)

const dadosGraficoVendas = computed(() => {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const data = Array(7).fill(0);

  const hoje = new Date();
  const primeiroDiaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
  primeiroDiaSemana.setHours(0, 0, 0, 0);

  for (const venda of vendas.value) {
    const dataVenda = new Date(venda.created_at);
    if (dataVenda >= primeiroDiaSemana) {
      const diaDaSemana = dataVenda.getDay();
      data[diaDaSemana] += venda.quantidade_caixas;
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
  const monitor = {};
  
  const hoje = new Date();
  const inicioSemanaAtual = new Date(new Date().setDate(hoje.getDate() - hoje.getDay()));
  inicioSemanaAtual.setHours(0, 0, 0, 0);

  const inicioSemanaAnterior = new Date(new Date().setDate(hoje.getDate() - hoje.getDay() - 7));
  inicioSemanaAnterior.setHours(0, 0, 0, 0);

  for (const venda of vendas.value) {
    if (!venda.clientes) continue;

    const clienteId = venda.clientes.id;
    if (!monitor[clienteId]) {
      monitor[clienteId] = {
        nome: venda.clientes.nome,
        semanaAtual: 0,
        semanaAnterior: 0
      };
    }

    const dataVenda = new Date(venda.created_at);
    if (dataVenda >= inicioSemanaAtual) {
      monitor[clienteId].semanaAtual += venda.quantidade_caixas;
    } else if (dataVenda >= inicioSemanaAnterior) {
      monitor[clienteId].semanaAnterior += venda.quantidade_caixas;
    }
  }
  return Object.values(monitor);
});

async function buscarVendas() {
  loading.value = true;
  const { data } = await supabase
    .from('vendas')
    .select(`
      created_at,
      quantidade_caixas,
      clientes ( id, nome )
    `)
  if (data) vendas.value = data
  loading.value = false;
}

onMounted(() => {
  buscarVendas()
})
</script>

<template>
  <main>
    <LoadingSpinner v-if="loading" />
    
    <div v-if="!loading">
      <h1>Dashboard de Vendas</h1>

      <div class="dashboard-grid">
        <div class="card">
          <h2>Vendas da Semana</h2>
          <Bar :data="dadosGraficoVendas" />
        </div>

        <div class="card">
          <h2>Monitoramento de Clientes (Semana Atual vs. Anterior)</h2>
          <ul class="monitor-list">
            <li v-for="cliente in monitoramentoClientes" :key="cliente.nome">
              <span class="cliente-nome">{{ cliente.nome }}</span>
              <div class="dados-semana">
                <span>Semana Atual: <strong>{{ cliente.semanaAtual }}</strong></span>
                <span>Semana Anterior: <strong>{{ cliente.semanaAnterior }}</strong></span>
              </div>
              <div class="indicador">
                <span v-if="cliente.semanaAtual > cliente.semanaAnterior" class="aumento">▲</span>
                <span v-else-if="cliente.semanaAtual < cliente.semanaAnterior" class="diminuicao">▼</span>
                <span v-else class="estavel">=</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main { position: relative; padding: 2rem; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-top: 2rem; }
.card { padding: 1.5rem; border: 1px solid #eee; border-radius: 8px; background-color: #fff; }
h2 { margin-bottom: 1.5rem; }
.monitor-list { list-style: none; padding: 0; }
.monitor-list li { display: flex; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0; }
.cliente-nome { flex-grow: 1; font-weight: bold; }
.dados-semana { display: flex; flex-direction: column; align-items: flex-end; margin: 0 1rem; font-size: 0.9rem; }
.indicador span { font-size: 1.5rem; width: 30px; text-align: center; }
.aumento { color: #4caf50; }
.diminuicao { color: #f44336; }
.estavel { color: #9e9e9e; }
</style>
