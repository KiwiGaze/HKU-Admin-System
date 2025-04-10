// src/views/TeacherDashboard.vue<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppLayout from '@/components/common/AppLayout.vue';
import { useStudentStore } from '@/stores/studentStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'vue-sonner';
import { CheckCircle, AlertCircle, Edit, Lock, Loader2, RefreshCw } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const studentStore = useStudentStore();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

// Dialog state
const gradeDialogOpen = ref(false);
const selectedStudent = ref<string | null>(null);
const selectedReportType = ref<'progress' | 'final'>('progress');
const gradeInputValue = ref<number | null>(null);
const isSubmitting = ref(false);
const gradeSubmitError = ref<string | null>(null);

// Use the getter to get students relevant to the current teacher
const assignedStudents = computed(() => studentStore.getStudentsForCurrentUser);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  document.title = 'Teacher Dashboard';
  try {
    await studentStore.fetchStudents();
    if (studentStore.error) throw new Error(studentStore.error);
  } catch (err: any) {
    error.value = err.message || 'Failed to load assigned students.';
    toast.error('Error loading data', { description: error.value || undefined });
  } finally {
    isLoading.value = false;
  }
});

// Open grade dialog with pre-populated data
const openGradeDialog = (studentId: string, reportType: 'progress' | 'final') => {
  const student = assignedStudents.value.find(s => s.id === studentId);
  if (!student) return;
  
  selectedStudent.value = studentId;
  selectedReportType.value = reportType;
  gradeInputValue.value = reportType === 'progress' 
    ? student.progressReportGrade || null
    : student.finalReportGrade || null;
  gradeDialogOpen.value = true;
  gradeSubmitError.value = null;
};

// Submit grade
const submitGrade = async () => {
  if (!selectedStudent.value || gradeInputValue.value === null) return;
  
  isSubmitting.value = true;
  gradeSubmitError.value = null;
  
  try {
    await studentStore.gradeStudent(
      selectedStudent.value, 
      selectedReportType.value, 
      gradeInputValue.value
    );
    
    toast.success('Grade submitted successfully');
    gradeDialogOpen.value = false;
    selectedStudent.value = null;
    gradeInputValue.value = null;
  } catch (err: any) {
    gradeSubmitError.value = err.message || 'Failed to submit grade. Please try again.';
    toast.error('Failed to submit grade', {
      description: gradeSubmitError.value || undefined,
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Finalize student record
const finalizeRecord = async (studentId: string) => {
  try {
    await studentStore.finalizeRecord(studentId);
    toast.success('Student record finalized successfully');
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to finalize student record.';
    toast.error('Error finalizing record', { description: errorMessage });
  }
};

// Refresh data
const refreshData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    await studentStore.fetchStudents();
    if (studentStore.error) throw new Error(studentStore.error);
    toast.success('Data refreshed successfully');
  } catch (err: any) {
    error.value = err.message || 'Failed to refresh data.';
    toast.error('Error refreshing data', { description: error.value || undefined });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <AppLayout>
    <div class="container mx-auto py-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-foreground">Teacher Dashboard</h2>
        <Button @click="refreshData" variant="outline" size="sm" :disabled="isLoading">
          <RefreshCw v-if="!isLoading" class="h-4 w-4" />
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          <span>{{ isLoading ? 'Refreshing...' : 'Refresh' }}</span>
        </Button>
      </div>

      <p class="text-muted-foreground mb-6">Welcome, {{ authStore.userName || 'Teacher' }}! Here you can manage your assigned students.</p>

      <div v-if="isLoading" class="text-center py-10">
        <Loader2 class="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Loading assigned students...</p>
      </div>

      <div v-else-if="error" class="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
        <AlertCircle class="mr-2 h-5 w-5" />
        <div>
          <p class="font-medium">Error loading data</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <Button @click="refreshData" variant="destructive" size="sm" class="ml-auto">
          Try Again
        </Button>
      </div>

      <div v-else>
        <div class="mt-6">
          <h3 class="text-lg font-medium mb-4">Assigned Students</h3>
          <div v-if="assignedStudents.length === 0" class="bg-muted p-8 text-center rounded-md">
            <p class="text-muted-foreground">You currently have no students assigned.</p>
          </div>
          <div v-else class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Progress Report</TableHead>
                  <TableHead>Final Report</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="student in assignedStudents" :key="student.id" 
                  :class="studentStore.isProcessing(student.id) ? 'opacity-70' : ''"
                >
                  <TableCell>{{ student.name }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <span v-if="student.progressReportGrade !== null">
                        {{ student.progressReportGrade }}/100
                      </span>
                      <span v-else class="text-muted-foreground">Not graded</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <span v-if="student.finalReportGrade !== null">
                        {{ student.finalReportGrade }}/100
                      </span>
                      <span v-else class="text-muted-foreground">Not graded</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge v-if="student.finalized" variant="outline" class="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle class="h-3 w-3 mr-1" /> Finalized
                    </Badge>
                    <Badge v-else variant="outline" class="bg-yellow-50 text-yellow-700 border-yellow-200">
                      In Progress
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button 
                        v-if="!student.finalized"
                        variant="outline" 
                        size="sm"
                        @click="openGradeDialog(student.id, 'progress')"
                        :disabled="studentStore.isProcessing(student.id)"
                      >
                        <Edit class="h-4 w-4 mr-1" /> Progress
                      </Button>
                      <Button 
                        v-if="!student.finalized"
                        variant="outline" 
                        size="sm"
                        @click="openGradeDialog(student.id, 'final')"
                        :disabled="studentStore.isProcessing(student.id)"
                      >
                        <Edit class="h-4 w-4 mr-1" /> Final
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            v-if="!student.finalized && student.finalReportGrade !== null"
                            variant="default" 
                            size="sm"
                            :disabled="studentStore.isProcessing(student.id)"
                          >
                            <Lock class="h-4 w-4 mr-1" /> Finalize
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will finalize the student record. After finalization, no further changes can be made to the grades.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              @click="finalizeRecord(student.id)"
                              class="bg-primary"
                            >
                              Finalize
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <div v-if="studentStore.isProcessing(student.id)" class="inline-flex ml-2">
                        <Loader2 class="h-4 w-4 animate-spin" />
                      </div>
                      <div v-if="student.finalized" class="text-gray-500">No further changes can be made</div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
  
  <!-- Grade Dialog -->
  <Dialog v-model:open="gradeDialogOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ selectedReportType === 'progress' ? 'Progress Report' : 'Final Report' }} Grade</DialogTitle>
        <DialogDescription>
          Enter the grade for this student's {{ selectedReportType }} report.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="grade" class="text-right">
            Grade
          </Label>
          <div class="col-span-3">
            <Input
              id="grade"
              type="number"
              min="0"
              max="100"
              :model-value="gradeInputValue ?? undefined" 
              @update:model-value="gradeInputValue = $event === '' ? null : Number($event)"
              placeholder="Enter grade (0-100)"
              :disabled="isSubmitting"
            />
            <p v-if="gradeSubmitError" class="text-red-500 text-sm mt-2">{{ gradeSubmitError }}</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="gradeDialogOpen = false" :disabled="isSubmitting">Cancel</Button>
        <Button @click="submitGrade" :disabled="isSubmitting || gradeInputValue === null">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>