<!-- frontend-vue/src/App.vue -->
<template>
  <div style="font-family: sans-serif; padding: 1rem;">
    <h1>Frontend Vue - Products</h1>

    <input
      type="text"
      placeholder="Rechercher un produit..."
      v-model="query"
      style="padding: 0.5rem; width: 100%; max-width: 400px; margin-bottom: 1rem;"
    />

    <p v-if="loading">Chargement...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>

    <div style="display: flex; gap: 1rem;">
      <!-- Liste -->
      <div style="flex: 1;">
        <div
          v-for="p in filtered"
          :key="p.id"
          @click="selected = p"
          style="border: 1px solid #ccc; padding: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;"
        >
          <strong>{{ p.name }}</strong>
          <div>Prix : {{ p.price }} €</div>
          <div>Stock : {{ p.stock }}</div>
        </div>
      </div>

      <!-- Détail -->
      <div style="flex: 1;">
        <h2>Détail</h2>
        <div v-if="selected">
          <h3>{{ selected.name }}</h3>
          <p>Prix : {{ selected.price }} €</p>
          <p>Stock : {{ selected.stock }}</p>
        </div>
        <p v-else>Cliquer sur un produit...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const API_URL = 'http://localhost:3003/api/products';

const products = ref([]);
const query = ref('');
const selected = ref(null);
const loading = ref(false);
const error = ref('');

const filtered = computed(() =>
  products.value.filter((p) =>
    p.name.toLowerCase().includes(query.value.toLowerCase())
  )
);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await fetch(API_URL);
    products.value = await res.json();
  } catch (e) {
    console.error(e);
    error.value = 'Erreur de chargement';
  } finally {
    loading.value = false;
  }
});
</script>
