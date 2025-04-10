<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue';
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-muted/40">
    <AppHeader />
    <main class="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <slot></slot> <!-- Main content goes here -->
    </main>
     <footer class="text-center text-xs text-muted-foreground py-4 px-6 mt-auto">
        © {{ new Date().getFullYear() }} Qi Yijiazhen. All rights reserved.
     </footer>
  </div>
</template>