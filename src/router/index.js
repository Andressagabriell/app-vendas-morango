import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

// Importa todas as Views com os nomes corretos
import HomeView from '../views/HomeView.vue'
import ClientesView from '../views/ClientesView.vue'
import ProdutosView from '../views/ProdutosView.vue'
import VendasView from '../views/VendasView.vue'
import RelatorioView from '../views/RelatorioView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/clientes', name: 'clientes', component: ClientesView, meta: { requiresAuth: true } },
    { path: '/produtos', name: 'produtos', component: ProdutosView, meta: { requiresAuth: true } },
    { path: '/vendas', name: 'vendas', component: VendasView, meta: { requiresAuth: true } },
    { path: '/relatorio', name: 'relatorio', component: RelatorioView, meta: { requiresAuth: true } }
  ]
})

// Lógica de proteção de rotas
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !session) {
    next({ name: 'login' });
  } else if (!requiresAuth && session && to.name === 'login') {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router
