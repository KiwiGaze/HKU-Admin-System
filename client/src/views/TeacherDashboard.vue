// src/views/TeacherDashboard.vue<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppLayout from '@/components/common/AppLayout.vue';
import { useStudentStore } from '@/stores/studentStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'vue-sonner';
// Import necessary UI components and icons
// e.g., import { Button } from '@/components/ui/button';
// e.g., import { ClipboardCheck, CheckSquare } from 'lucide-vue-next';

const studentStore = useStudentStore();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

// Use the getter to get students relevant to the current teacher
const assignedStudents = computed(() => studentStore.getStudentsForCurrentUser);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  document.title = 'Teacher Dashboard';
  try {
    // Fetch all students; the getter will filter them.
    // Alternatively, modify API/store to fetch only assigned students if performance is a concern.
    await studentStore.fetchStudents();
    if (studentStore.error) throw new Error(studentStore.error);
  } catch (err: any) {
    error.value = err.message || 'Failed to load assigned students.';
    toast.error('Error loading data', { description: error.value || undefined });
  } finally {
    isLoading.value = false;
  }
});

// Add methods for teacher actions like grading, finalizing records, etc.
// Handle loading states (using studentStore.isProcessing) and errors for each action.

</script>

<template>
  <AppLayout>
    <div class="container mx-auto py-6">
       <h2 class="text-2xl font-semibold mb-4 text-foreground">Teacher Dashboard</h2>

       <div v-if="isLoading" class="text-center py-10">
         <p>Loading assigned students...</p>
         <!-- Add a loading spinner component here -->
       </div>

       <div v-else-if="error" class="text-center py-10 text-red-600">
         <p>Error: {{ error }}</p>
         <!-- Optionally add a retry button -->
       </div>

       <div v-else>
         <!-- Dashboard Content -->
         <p class="text-muted-foreground">Welcome, {{ authStore.userName || 'Teacher' }}!</p>
         <!-- Add sections for managing assigned students -->
         <!-- Example: Assigned Student List Table, Grading Modals, Finalize Buttons -->

         <div class="mt-6">
           <h3 class="text-lg font-medium mb-3">Assigned Students</h3>
           <div v-if="assignedStudents.length === 0" class="text-muted-foreground">
             You currently have no students assigned.
           </div>
           <div v-else>
              <!-- Student Table/List Component displaying assignedStudents -->
              <!-- Include columns for grades, status, and actions (Grade, Finalize) -->
           </div>
         </div>
       </div>
    </div>
  </AppLayout>
</template>