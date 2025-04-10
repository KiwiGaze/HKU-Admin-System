<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { School, LogOut, User } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const getInitials = (name: string | null): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
    <div class="flex items-center gap-2">
      <School class="h-6 w-6 text-primary" />
      <h1 class="text-xl font-semibold text-primary">HKU Thesis Management</h1>
    </div>
    <div class="relative ml-auto flex-1 md:grow-0">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon" class="overflow-hidden rounded-full">
             <Avatar class="h-8 w-8">
                <!-- Add AvatarImage if you store user avatar URLs -->
                <!-- <AvatarImage src="/avatars/01.png" alt="User Avatar" /> -->
                <AvatarFallback>
                  <User v-if="!authStore.userName" class="h-5 w-5 text-muted-foreground" />
                  <span v-else>{{ getInitials(authStore.userName) }}</span>
                </AvatarFallback>
              </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">{{ authStore.userName || 'User' }}</p>
              <p class="text-xs leading-none text-muted-foreground">
                Role: {{ authStore.role ? authStore.role.charAt(0).toUpperCase() + authStore.role.slice(1) : 'Unknown' }}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="cursor-pointer">
            <LogOut class="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>