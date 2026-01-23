<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { supabase } from './lib/supabaseClient'
import { ref, onMounted } from 'vue'

const router = useRouter()
const session = ref(null)

async function signOut() {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <header v-if="session">
    <div class="wrapper">
      <div class="brand">
        Meu Morango
      </div>
      <nav>
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/clientes">Clientes</RouterLink>
        <RouterLink to="/produtos">Produtos</RouterLink>
        <RouterLink to="/vendas">Vendas</RouterLink>
        <RouterLink to="/relatorio">Relatório</RouterLink>
        <a href="#" @click.prevent="signOut" class="logout-button">Sair</a>
      </nav>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  border-bottom: 1px solid #ccc;
  background-color: white;
}
.wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  max-width: 1280px;
  margin: 0 auto;
}
.brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: hsla(160, 100%, 37%, 1);
}
nav {
  font-size: 1rem;
  text-align: right;
  padding: 1rem 0;
}
nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  color: var(--color-text);
  text-decoration: none;
}
nav a:first-of-type {
  border: 0;
}
nav a.router-link-exact-active {
  color: hsla(160, 100%, 37%, 1);
  font-weight: bold;
}
.logout-button {
  color: #e53e3e;
}
</style>

<style>
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('https://www.transparenttextures.com/patterns/strawberries.png' );
  background-repeat: repeat;
  opacity: 0.08;
  z-index: -1;
}
</style>
