// src/views/AdminDashboard.vue<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '@/components/common/AppLayout.vue';
import { useStudentStore } from '@/stores/studentStore';
import { useTeacherStore } from '@/stores/teacherStore';
import { toast } from 'vue-sonner';
// Import necessary UI components and icons
// e.g., import { Button } from '@/components/ui/button';
// e.g., import { Users, UserPlus } from 'lucide-vue-next';

const studentStore = useStudentStore();
const teacherStore = useTeacherStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      teacherStore.fetchTeachers()
    ]);
    if (studentStore.error) throw new Error(studentStore.error);
    if (teacherStore.error) throw new Error(teacherStore.error);
  } catch (err: any) {
    error.value = err.message || 'Failed to load dashboard data.';
    toast.error('Error loading data', { description: error.value || undefined });
  } finally {
    isLoading.value = false;
  }
});

// Add methods for admin actions like adding students, assigning teachers, etc.
// Handle loading states and errors for each action.

</script>

<template>
  <AppLayout>
    <div class="container mx-auto py-6">
      <h2 class="text-2xl font-semibold mb-4 text-foreground">Admin Dashboard</h2>

      <div v-if="isLoading" class="text-center py-10">
        <p>Loading dashboard data...</p>
        <!-- Add a loading spinner component here -->
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-600">
        <p>Error: {{ error }}</p>
        <!-- Optionally add a retry button -->
      </div>

      <div v-else>
        <!-- Dashboard Content -->
        <p class="text-muted-foreground">Welcome, Admin!</p>
        <!-- Add sections for managing students and teachers -->
        <!-- Example: Student List Table, Add Student Form, Assign Teacher Modals -->

        <div class="mt-6">
          <h3 class="text-lg font-medium mb-3">Student Management</h3>
          <!-- Student Table/List Component -->
          <!-- Add Student Button/Modal Trigger -->
        </div>

        <div class="mt-6">
          <h3 class="text-lg font-medium mb-3">Teacher Information</h3>
          <!-- Teacher List (optional, maybe just for assignment dropdowns) -->
        </div>
      </div>
    </div>
  </AppLayout>
</template>