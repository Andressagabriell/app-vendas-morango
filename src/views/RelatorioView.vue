<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

const vendas = ref([])

// --- FUNÇÕES DE GERAÇÃO DE LINKS ---

// Gera um link para o Google Maps ou Waze com base no endereço
function gerarLinkMapa(tipo, endereco) {
  if (!endereco) return '#'; // Retorna um link morto se não houver endereço
  const enderecoFormatado = encodeURIComponent(endereco); // Formata o endereço para URL
  if (tipo === 'google') {
    return `https://www.google.com/maps/search/?api=1&query=${enderecoFormatado}`;
  }
  if (tipo === 'waze' ) {
    return `https://waze.com/ul?q=${enderecoFormatado}&navigate=yes`;
  }
}

// Gera um link para iniciar uma conversa no WhatsApp
function gerarLinkWhatsApp(telefone ) {
  if (!telefone) return '#';
  // Remove caracteres não numéricos do telefone
  const numeroLimpo = telefone.replace(/\D/g, '');
  // Adiciona o código do país (55 para o Brasil) se não estiver presente
  const numeroFinal = numeroLimpo.length > 11 ? numeroLimpo : `55${numeroLimpo}`;
  return `https://wa.me/${numeroFinal}`;
}


// --- FUNÇÕES DE DADOS ---

async function buscarVendas( ) {
  // ATUALIZADO: Agora busca também o endereço e telefone do cliente
  const { data } = await supabase
    .from('vendas')
    .select(`*, clientes:clientes_v2(nome, endereco, telefone), produtos_v2(nome)`)
    .order('created_at', { ascending: false })
  if (data) vendas.value = data
}

async function alternarStatusEntrega(venda) {
  const novoStatus = !venda.entregue
  const { error } = await supabase
    .from('vendas')
    .update({ entregue: novoStatus })
    .eq('id', venda.id)
  
  if (!error) {
    const index = vendas.value.findIndex(v => v.id === venda.id)
    if (index !== -1) {
      vendas.value[index].entregue = novoStatus
    }
  }
}

const relatorioAgrupado = computed(() => {
  const agrupado = {}
  for (const venda of vendas.value) {
    if (!venda.clientes) continue;
    const clienteNome = venda.clientes.nome;
    if (!agrupado[clienteNome]) {
      agrupado[clienteNome] = {
        nomeCliente: venda.clientes.nome,
        endereco: venda.clientes.endereco, // Armazena o endereço
        telefone: venda.clientes.telefone, // Armazena o telefone
        produtos: []
      }
    }
    agrupado[clienteNome].produtos.push(venda)
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
      <div v-for="cliente in relatorioAgrupado" :key="cliente.nomeCliente" class="cliente-card">
        <div class="card-header">
          <h2>{{ cliente.nomeCliente }}</h2>
          <!-- BOTÕES DE AÇÃO ADICIONADOS AQUI -->
          <div class="action-buttons">
            <a :href="gerarLinkWhatsApp(cliente.telefone)" target="_blank" class="btn whatsapp" title="WhatsApp">💬</a>
            <a :href="gerarLinkMapa('google', cliente.endereco)" target="_blank" class="btn google" title="Google Maps">📍</a>
            <a :href="gerarLinkMapa('waze', cliente.endereco)" target="_blank" class="btn waze" title="Waze">🚗</a>
          </div>
        </div>
        <p class="endereco-texto">{{ cliente.endereco || 'Endereço não cadastrado' }}</p>
        
        <ul>
          <li v-for="venda in cliente.produtos" :key="venda.id" :class="{ 'entregue': venda.entregue }">
            <input 
              type="checkbox" 
              :checked="venda.entregue" 
              @change="alternarStatusEntrega(venda)"
              class="checkbox-entrega"
            />
            <span class="produto-nome">{{ venda.produtos_v2?.nome || 'N/A' }}</span>
            <span class="quantidade">Qtd: {{ venda.quantidade_caixas }}</span>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ESTILOS ATUALIZADOS */
main { padding: 2rem; }
h1 { text-align: center; margin-bottom: 2rem; }
.relatorio-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
.cliente-card { padding: 1.5rem; border: 1px solid #eee; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid hsla(160, 100%, 37%, 1);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

h2 { margin: 0; }

.endereco-texto {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  min-height: 1.2em; /* Garante altura mínima mesmo sem endereço */
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 50%;
  text-decoration: none;
  color: white;
  width: 36px;
  height: 36px;
  text-align: center;
  line-height: 1.3;
  font-size: 1.2rem;
}

.whatsapp { background-color: #25D366; }
.google { background-color: #4285F4; }
.waze { background-color: #33ccff; }

ul { list-style: none; padding: 0; }
li { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 4px; margin-bottom: 0.5rem; background-color: #f9f9f9; }
li.entregue { background-color: #e8f5e9; }
li.entregue .produto-nome { text-decoration: line-through; color: #888; }
.checkbox-entrega { width: 20px; height: 20px; cursor: pointer; }
.produto-nome { flex-grow: 1; font-weight: bold; }
.quantidade { font-style: italic; color: #555; }
</style>
