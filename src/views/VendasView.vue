<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.js'

// --- ESTADO DO FORMULÁRIO ---
const clientes = ref([])
const produtos = ref([])
const clienteId = ref('')
const produtoId = ref('')
const quantidade = ref(1)
const carregando = ref(false)

// --- BUSCAR DADOS DO SUPABASE ---
async function carregarDados() {
  console.log('Carregando clientes e produtos...')
  
  // Busca clientes (Garante que pega o UUID da coluna 'id')
  const { data: c, error: errC } = await supabase
    .from('clientes_v2')
    .select('id, nome')
    .order('nome')
  
  if (errC) console.error('Erro ao buscar clientes:', errC)
  else clientes.value = c

  // Busca produtos (Garante que pega o UUID da coluna 'id')
  const { data: p, error: errP } = await supabase
    .from('produtos_v2')
    .select('id, nome')
    .order('nome')
    
  if (errP) console.error('Erro ao buscar produtos:', errP)
  else produtos.value = p
}

// --- REGISTRAR A VENDA ---
async function registrarVenda() {
  // Validação básica
  if (!clienteId.value || !produtoId.value) {
    alert('Por favor, selecione um cliente e um produto.')
    return
  }

  carregando.value = true
  
  // Log para você ver no console (F12) o que está sendo enviado
  console.log('Enviando para o banco:', {
    cliente_id: clienteId.value,
    produto_id: produtoId.value,
    quantidade: quantidade.value
  })

  const { error } = await supabase.from('vendas').insert([
    {
      cliente_id: clienteId.value,
      produto_id: produtoId.value,
      quantidade_caixas: Number(quantidade.value),
      entregue: false
    }
  ])

  carregando.value = false

  if (error) {
    console.error('Erro detalhado:', error)
    alert('Falha ao registrar venda: ' + error.message)
  } else {
    alert('Venda registrada com sucesso!')
    // Limpa os campos após o sucesso
    clienteId.value = ''
    produtoId.value = ''
    quantidade.value = 1
  }
}

// Carrega os dados assim que a página abre
onMounted(() => {
  carregarDados()
})
</script>

<template>
  <main class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-red-600">Nova Venda</h1>

    <form @submit.prevent="registrarVenda" class="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
      
      <!-- Seleção de Cliente -->
      <div>
        <label class="block font-bold mb-1 text-gray-700">Cliente:</label>
        <select v-model="clienteId" required class="w-full p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="" disabled>Selecione o cliente</option>
          <!-- O segredo está aqui: :value="c.id" garante que enviamos o UUID -->
          <option v-for="c in clientes" :key="c.id" :value="c.id">
            {{ c.nome }}
          </option>
        </select>
      </div>

      <!-- Seleção de Produto -->
      <div>
        <label class="block font-bold mb-1 text-gray-700">Produto:</label>
        <select v-model="produtoId" required class="w-full p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="" disabled>Selecione o produto</option>
          <!-- O segredo está aqui: :value="p.id" garante que enviamos o UUID -->
          <option v-for="p in produtos" :key="p.id" :value="p.id">
            {{ p.nome }}
          </option>
        </select>
      </div>

      <!-- Quantidade -->
      <div>
        <label class="block font-bold mb-1 text-gray-700">Quantidade (Caixas):</label>
        <input 
          type="number" 
          v-model="quantidade" 
          min="1" 
          required 
          class="w-full p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <!-- Botão de Envio -->
      <button 
        type="submit" 
        :disabled="carregando" 
        class="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ carregando ? 'Processando...' : 'Confirmar Venda' }}
      </button>

    </form>
  </main>
</template>

<style scoped>
/* Estilos simples para melhorar a aparência */
select, input {
  transition: border-color 0.2s;
}
</style>
