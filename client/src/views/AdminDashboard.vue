// src/views/AdminDashboard.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '@/components/common/AppLayout.vue';
import { useStudentStore } from '@/stores/studentStore';
import { useTeacherStore } from '@/stores/teacherStore';
import { toast } from 'vue-sonner';
import { UserPlus, AlertCircle, UserCheck, Loader2, CheckCircle, X, Users, User, RefreshCw, Trash2 } from 'lucide-vue-next';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

const studentStore = useStudentStore();
const teacherStore = useTeacherStore();

const isLoading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('students');

// Dialog state for adding student
const addStudentDialogOpen = ref(false);
const newStudentName = ref('');
const isAddingStudent = ref(false);
const addStudentError = ref<string | null>(null);

// Dialog state for assigning teacher
const assignTeacherDialogOpen = ref(false);
const selectedStudentId = ref<string | null>(null);
const selectedTeacherId = ref<string | null>(null);
const isAssigningTeacher = ref(false);
const assignTeacherError = ref<string | null>(null);

// Dialog state for delete confirmation
const deleteDialogOpen = ref(false);
const studentToDelete = ref<string | null>(null);
const isDeletingStudent = ref(false);

// Dialog state for unfinalize confirmation
const unfinalizeDialogOpen = ref(false);
const studentToUnfinalize = ref<string | null>(null);
const isUnfinalizingStudent = ref(false);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  document.title = 'Admin Dashboard';
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

// Add new student
const addStudent = async () => {
  if (!newStudentName.value.trim()) {
    addStudentError.value = 'Student name is required';
    return;
  }
  
  isAddingStudent.value = true;
  addStudentError.value = null;
  
  try {
    await studentStore.addStudent(newStudentName.value.trim());
    toast.success(`Student ${newStudentName.value} added successfully`);
    addStudentDialogOpen.value = false;
    newStudentName.value = '';
  } catch (err: any) {
    addStudentError.value = err.message || 'Failed to add student';
    toast.error('Failed to add student', {
      description: addStudentError.value || undefined
    });
  } finally {
    isAddingStudent.value = false;
  }
};

// Open assign teacher dialog
const openAssignTeacherDialog = (studentId: string) => {
  selectedStudentId.value = studentId;
  const student = studentStore.students.find(s => s.id === studentId);
  selectedTeacherId.value = student?.assignedTeacherId || null;
  assignTeacherDialogOpen.value = true;
  assignTeacherError.value = null;
};

// Assign teacher to student
const assignTeacher = async () => {
  if (!selectedStudentId.value || !selectedTeacherId.value) {
    assignTeacherError.value = 'Please select a teacher';
    return;
  }
  
  isAssigningTeacher.value = true;
  assignTeacherError.value = null;
  
  try {
    await studentStore.assignTeacher(selectedStudentId.value, selectedTeacherId.value);
    toast.success('Teacher assigned successfully');
    assignTeacherDialogOpen.value = false;
    selectedStudentId.value = null;
    selectedTeacherId.value = null;
  } catch (err: any) {
    assignTeacherError.value = err.message || 'Failed to assign teacher';
    toast.error('Failed to assign teacher', {
      description: assignTeacherError.value || undefined
    });
  } finally {
    isAssigningTeacher.value = false;
  }
};

// Open delete confirmation dialog
const openDeleteDialog = (studentId: string) => {
  studentToDelete.value = studentId;
  deleteDialogOpen.value = true;
};

// Delete student
const confirmDeleteStudent = async () => {
  if (!studentToDelete.value) return;
  
  isDeletingStudent.value = true;
  
  try {
    await studentStore.deleteStudent(studentToDelete.value);
    toast.success('Student deleted successfully');
    deleteDialogOpen.value = false;
    studentToDelete.value = null;
  } catch (err: any) {
    toast.error('Failed to delete student', {
      description: err.message || 'An error occurred'
    });
  } finally {
    isDeletingStudent.value = false;
  }
};

// Open unfinalize confirmation dialog
const openUnfinalizeDialog = (studentId: string) => {
  studentToUnfinalize.value = studentId;
  unfinalizeDialogOpen.value = true;
};

// Unfinalize student record
const confirmUnfinalizeStudent = async () => {
  if (!studentToUnfinalize.value) return;
  
  isUnfinalizingStudent.value = true;
  
  try {
    await studentStore.unfinalizeRecord(studentToUnfinalize.value);
    toast.success('Student record unfinalized successfully');
    unfinalizeDialogOpen.value = false;
    studentToUnfinalize.value = null;
  } catch (err: any) {
    toast.error('Failed to unfinalize student record', {
      description: err.message || 'An error occurred'
    });
  } finally {
    isUnfinalizingStudent.value = false;
  }
};

// Refresh data
const refreshData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      teacherStore.fetchTeachers()
    ]);
    if (studentStore.error) throw new Error(studentStore.error);
    if (teacherStore.error) throw new Error(teacherStore.error);
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
        <h2 class="text-2xl font-semibold text-foreground">Admin Dashboard</h2>
        <Button @click="refreshData" variant="outline" size="sm" :disabled="isLoading">
          <RefreshCw v-if="!isLoading" class="h-4 w-4" />
          <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </Button>
      </div>

      <p class="text-muted-foreground mb-6">Welcome, Admin! Here you can manage students and teachers in the system.</p>

      <div v-if="isLoading" class="text-center py-10">
        <Loader2 class="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Loading dashboard data...</p>
      </div>

      <div v-else-if="error" class="bg-destructive/10 text-destructive p-4 rounded-md flex items-center mb-6">
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
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="students" class="flex items-center gap-2">
              <Users class="h-4 w-4" />
              Student Management
            </TabsTrigger>
            <TabsTrigger value="teachers" class="flex items-center gap-2">
              <User class="h-4 w-4" />
              Teacher Information
            </TabsTrigger>
          </TabsList>
          
          <!-- Students Tab Content -->
          <TabsContent value="students" class="mt-0">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Student Management</h3>
              <Dialog v-model:open="addStudentDialogOpen">
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus class="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Enter the name of the student you want to add to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                      <Label for="studentName" class="text-right">Name</Label>
                      <Input
                        id="studentName"
                        v-model="newStudentName"
                        placeholder="Enter student name"
                        class="col-span-3"
                        :disabled="isAddingStudent"
                      />
                    </div>
                    <p v-if="addStudentError" class="text-red-500 text-sm">{{ addStudentError }}</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" @click="addStudentDialogOpen = false" :disabled="isAddingStudent">Cancel</Button>
                    <Button @click="addStudent" :disabled="isAddingStudent || !newStudentName.trim()">
                      <Loader2 v-if="isAddingStudent" class="mr-2 h-4 w-4 animate-spin" />
                      Add Student
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div v-if="studentStore.students.length === 0" class="bg-muted p-8 text-center rounded-md">
              <p class="text-muted-foreground">No students in the system. Add a student to get started.</p>
            </div>
            <div v-else class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                    <TableHead>Progress Grade</TableHead>
                    <TableHead>Final Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="student in studentStore.students" :key="student.id"
                    :class="studentStore.isProcessing(student.id) ? 'opacity-70' : ''"
                  >
                    <TableCell>{{ student.name }}</TableCell>
                    <TableCell>{{ teacherStore.getTeacherName(student.assignedTeacherId) }}</TableCell>
                    <TableCell>
                      <span v-if="typeof student.progressReportGrade === 'number'">
                        {{ student.progressReportGrade }}/100
                      </span>
                      <span v-else class="text-muted-foreground">Not graded</span>
                    </TableCell>
                    <TableCell>
                      <span v-if="typeof student.finalReportGrade === 'number'">
                        {{ student.finalReportGrade }}/100
                      </span>
                      <span v-else class="text-muted-foreground">Not graded</span>
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
                      <div class="flex justify-end space-x-2">
                        <Button 
                          v-if="!student.finalized"
                          variant="outline" 
                          size="sm"
                          @click="openAssignTeacherDialog(student.id)"
                          :disabled="studentStore.isProcessing(student.id)"
                        >
                          <UserCheck class="h-4 w-4 mr-1" /> Assign Teacher
                        </Button>
                        <Button
                          v-if="student.finalized"
                          variant="outline"
                          size="sm"
                          @click="openUnfinalizeDialog(student.id)"
                          :disabled="studentStore.isProcessing(student.id)"
                        >
                          <X class="h-4 w-4 mr-1" /> Unfinalize
                        </Button>
                        <Button
                          v-if="!student.finalized"
                          variant="destructive"
                          size="sm"
                          @click="openDeleteDialog(student.id)"
                          :disabled="studentStore.isProcessing(student.id)"
                        >
                          <Trash2 class="h-4 w-4 mr-1" /> Delete
                        </Button>
                        <div v-if="studentStore.isProcessing(student.id)" class="inline-flex ml-2">
                          <Loader2 class="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <!-- Teachers Tab Content -->
          <TabsContent value="teachers" class="mt-0">
            <h3 class="text-lg font-medium mb-4">Teacher Information</h3>
            <div v-if="teacherStore.teachers.length === 0" class="bg-muted p-8 text-center rounded-md">
              <p class="text-muted-foreground">No teachers in the system.</p>
            </div>
            <div v-else class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Assigned Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="teacher in teacherStore.teachers" :key="teacher.id">
                    <TableCell class="font-mono text-xs">{{ teacher.id }}</TableCell>
                    <TableCell>{{ teacher.name }}</TableCell>
                    <TableCell>
                      {{ studentStore.students.filter(s => s.assignedTeacherId === teacher.id).length }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </AppLayout>
  
  <!-- Assign Teacher Dialog -->
  <Dialog v-model:open="assignTeacherDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign Teacher</DialogTitle>
        <DialogDescription>
          Select a teacher to assign to this student.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="teacherSelect" class="text-right">Teacher</Label>
          <div class="col-span-3">
            <Select v-model="selectedTeacherId">
              <SelectTrigger id="teacherSelect">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="teacher in teacherStore.teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="assignTeacherError" class="text-red-500 text-sm mt-2">{{ assignTeacherError }}</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="assignTeacherDialogOpen = false" :disabled="isAssigningTeacher">Cancel</Button>
        <Button @click="assignTeacher" :disabled="isAssigningTeacher || !selectedTeacherId">
          <Loader2 v-if="isAssigningTeacher" class="mr-2 h-4 w-4 animate-spin" />
          Assign
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Student Confirmation Dialog -->
  <Dialog v-model:open="deleteDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this student? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="deleteDialogOpen = false" :disabled="isDeletingStudent">Cancel</Button>
        <Button variant="destructive" @click="confirmDeleteStudent" :disabled="isDeletingStudent">
          <Loader2 v-if="isDeletingStudent" class="mr-2 h-4 w-4 animate-spin" />
          Delete Student
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <!-- Unfinalize Student Record Confirmation Dialog -->
  <Dialog v-model:open="unfinalizeDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Unfinalize Student Record</DialogTitle>
        <DialogDescription>
          Are you sure you want to unfinalize this student record? This will allow modifications to be made again.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="unfinalizeDialogOpen = false" :disabled="isUnfinalizingStudent">Cancel</Button>
        <Button @click="confirmUnfinalizeStudent" :disabled="isUnfinalizingStudent">
          <Loader2 v-if="isUnfinalizingStudent" class="mr-2 h-4 w-4 animate-spin" />
          Unfinalize Record
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>