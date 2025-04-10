<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
</script>

<template>
    <TooltipProvider :delay-duration="300">
      <RouterView/>
      <Toaster position="top-center" richColors />
    </TooltipProvider>
</template>