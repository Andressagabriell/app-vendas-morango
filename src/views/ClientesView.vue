<script setup>
import { ref } from 'vue'

const nome = ref('')
const telefone = ref('')

function testeBotao() {
  alert(`Botão funcionando! Nome: ${nome.value}, Telefone: ${telefone.value}`)
}
</script>

<template>
  <main>
    <h1>Teste Cadastro Cliente</h1>

    <form @submit.prevent="testeBotao" class="form-container">
      <div class="form-group">
        <label for="nome">Nome</label>
        <input id="nome" v-model="nome" type="text" required />
      </div>

      <div class="form-group">
        <label for="telefone">Telefone</label>
        <input id="telefone" v-model="telefone" type="text" required />
      </div>

      <button type="submit">Cadastrar Cliente</button>
    </form>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  max-width: 600px;
  margin: auto;
}

h1 {
  margin-bottom: 1rem;
}

.form-container {
  margin-top: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #16a34a;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
