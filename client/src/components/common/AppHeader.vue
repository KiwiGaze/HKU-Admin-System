// src/components/common/AppHeader.vue
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { School, LogOut, User, Menu, Settings } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ref, onMounted, watch } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Close mobile menu when route changes
watch(() => router.currentRoute.value.path, () => {
  isMobileMenuOpen.value = false;
});

const getInitials = (name: string | null): string => {
  if (!name) return '?';
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2); // Limit to 2 characters for better visual
}

// For accessibility
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
    <!-- Logo & Brand -->
    <div class="flex items-center gap-2">
      <School class="h-6 w-6 text-primary" aria-hidden="true" />
      <h1 class="text-xl font-semibold text-primary hidden sm:inline-block">HKU Thesis Management</h1>
      <h1 class="text-xl font-semibold text-primary sm:hidden">HKU Thesis</h1>
    </div>
    
    <!-- Mobile Menu Toggle -->
    <Button 
      variant="ghost" 
      size="icon" 
      class="md:hidden ml-auto"
      @click="toggleMobileMenu"
      aria-label="Toggle menu"
    >
      <Menu class="h-5 w-5" />
    </Button>

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex items-center gap-6 mx-6 flex-1">
      <router-link 
        to="/" 
        class="text-sm font-medium hover:text-primary transition-colors"
        active-class="text-primary font-medium"
      >
        Dashboard
      </router-link>
      <!-- Add more navigation links as needed based on user role -->
    </nav>

    <!-- User Menu -->
    <div class="ml-auto hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="flex items-center gap-2 h-9 px-1 rounded-full">
            <Avatar class="h-7 w-7">
              <AvatarFallback class="bg-muted text-muted-foreground text-xs">
                <User v-if="!authStore.userName" class="h-4 w-4" aria-hidden="true" />
                <span v-else>{{ getInitials(authStore.userName) }}</span>
              </AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium truncate max-w-[100px]">
              {{ authStore.userName || 'User' }}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">{{ authStore.userName || 'User' }}</p>
              <p class="text-xs leading-none text-muted-foreground">
                {{ authStore.role ? authStore.role.charAt(0).toUpperCase() + authStore.role.slice(1) : 'Unknown' }}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <router-link to="/profile" class="flex w-full cursor-pointer items-center">
              <User class="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Profile</span>
            </router-link>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <router-link to="/settings" class="flex w-full cursor-pointer items-center">
              <Settings class="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Settings</span>
            </router-link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-red-500 focus:text-red-500">
            <LogOut class="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Mobile Menu (Slide down) -->
    <div 
      v-if="isMobileMenuOpen" 
      class="absolute top-16 left-0 right-0 bg-background border-b shadow-md z-50 md:hidden"
    >
      <div class="py-4 px-6 space-y-4">
        <nav class="flex flex-col space-y-3">
          <router-link 
            to="/"
            class="text-sm font-medium py-2 hover:text-primary transition-colors"
            active-class="text-primary font-medium"
            @click="isMobileMenuOpen = false"
          >
            Dashboard
          </router-link>
          <!-- Add more navigation links as needed -->
        </nav>
        
        <div class="pt-2 border-t">
          <div class="flex items-center gap-3 py-2">
            <Avatar class="h-8 w-8">
              <AvatarFallback class="bg-muted text-muted-foreground">
                <User v-if="!authStore.userName" class="h-4 w-4" aria-hidden="true" />
                <span v-else>{{ getInitials(authStore.userName) }}</span>
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-medium">{{ authStore.userName || 'User' }}</p>
              <p class="text-xs text-muted-foreground">
                {{ authStore.role ? authStore.role.charAt(0).toUpperCase() + authStore.role.slice(1) : 'Unknown' }}
              </p>
            </div>
          </div>
          
          <div class="space-y-1 pt-2">
            <router-link 
              to="/profile" 
              class="flex items-center py-2 text-sm"
              @click="isMobileMenuOpen = false"
            >
              <User class="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Profile</span>
            </router-link>
            <router-link 
              to="/settings" 
              class="flex items-center py-2 text-sm"
              @click="isMobileMenuOpen = false"
            >
              <Settings class="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Settings</span>
            </router-link>
            <button 
              @click="handleLogout" 
              class="flex items-center py-2 text-sm w-full text-red-500"
            >
              <LogOut class="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>