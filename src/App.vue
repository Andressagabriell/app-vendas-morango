<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { supabase } from './lib/supabaseClient'
import { ref, onMounted } from 'vue'

const router = useRouter()
const session = ref(null)

async function signOut() {
  await supabase.auth.signOut()
  // Redireciona para a página de login após o logout
  router.push('/login')
}

onMounted(() => {
  // Verifica a sessão quando o app carrega
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  // Fica "ouvindo" por mudanças no estado de autenticação (login/logout)
  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <!-- O header só aparece se o usuário estiver logado -->
  <header v-if="session">
    <div class="wrapper">
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
header { line-height: 1.5; max-height: 100vh; border-bottom: 1px solid #ccc; }
nav { width: 100%; font-size: 1rem; text-align: center; padding: 1rem 0; }
nav a { display: inline-block; padding: 0 1rem; border-left: 1px solid var(--color-border); color: var(--color-text); text-decoration: none; }
nav a:first-of-type { border: 0; }
nav a.router-link-exact-active { color: hsla(160, 100%, 37%, 1); font-weight: bold; }
.logout-button { color: #e53e3e; }
</style>
