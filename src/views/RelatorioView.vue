<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const vendas = ref([])

async function buscarVendas() {
  const { data } = await supabase
    .from('vendas')
    .select('*, clientes(nome), produtos_v2(nome)')
    .order('created_at', { ascending: false })

  if (data) {
    vendas.value = data
  }
}

async function alternarStatusEntrega(venda) {
  const novoStatus = !venda.entregue

  const { error } = await supabase
    .from('vendas')
    .update({ entregue: novoStatus })
    .eq('id', venda.id)

  if (!error) {
    const index = vendas.value.findIndex(
      v => v.id === venda.id
    )

    if (index !== -1) {
      vendas.value[index].entregue = novoStatus
    }
  }
}

const relatorioAgrupado = computed(() => {
  const agrupado = {}

  for (const venda of vendas.value) {
    if (!venda.clientes) continue

    const clienteId = venda.clientes.id

    if (!agrupado[clienteId]) {
      agrupado[clienteId] = {
        nomeCliente: venda.clientes.nome,
        produtos: []
      }
    }

    agrupado[clienteId].produtos.push(venda)
  }

  return Object.values(agrupado)
})

onMounted(() => {
  buscarVendas()
})
</script>

<template>
  <main>
    <h1>Relatório de Entregas</h1>

    <div class="relatorio-container">
      <div
        v-for="cliente in relatorioAgrupado"
        :key="cliente.nomeCliente"
        class="cliente-card"
      >
        <h2>{{ cliente.nomeCliente }}</h2>

        <ul>
          <li
            v-for="venda in cliente.produtos"
            :key="venda.id"
            :class="{ entregue: venda.entregue }"
          >
            <input
              type="checkbox"
              :checked="venda.entregue"
              @change="alternarStatusEntrega(venda)"
              class="checkbox-entrega"
            />

            <span class="produto-nome">
              {{ venda.produtos_v2?.nome || 'N/A' }}
            </span>

            <span class="quantidade">
              Qtd:
              {{ venda.quantidade_caixas }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.relatorio-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.cliente-card {
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
}

h2 {
  margin-bottom: 1rem;
  border-bottom: 2px solid hsla(160, 100%, 37%, 1);
  padding-bottom: 0.5rem;
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
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

li.entregue {
  background-color: #e8f5e9;
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
