<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import axios from 'axios'; // Import axios for making HTTP requests

// Define a reactive variable to store the message from the backend
const backendMessage = ref<string>('Loading message from backend...');

// Define an asynchronous function to fetch data from the backend
const fetchBackendData = async () => {
  try {
    // Make a GET request to the backend API endpoint
    // Note: This URL should point to your backend API address
    const response = await axios.get('http://localhost:3000/api');
    // Update the reactive variable with the message from the response data
    backendMessage.value = response.data.message;
  } catch (error) {
    // Log any errors that occur during the request
    console.error('Could not connect to the backend:', error);
    // Update the reactive variable to show an error message
    backendMessage.value = 'Could not connect to the backend service.';
  }
};

// Call the fetch function after the component is mounted
onMounted(() => {
  fetchBackendData();
});
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>

  <hr/>
  <h2>Message from Backend:</h2>
  <!-- Display the backend message -->
  <p>{{ backendMessage }}</p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>