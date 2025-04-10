// src/views/AdminDashboard.vue
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import AppLayout from '@/components/common/AppLayout.vue';
import { useStudentStore } from '@/stores/studentStore';
import { useTeacherStore } from '@/stores/teacherStore';
import { toast } from 'vue-sonner';
import { UserPlus, AlertCircle, UserCheck, Loader2, CheckCircle, X, Users, User, RefreshCw, Trash2, Search } from 'lucide-vue-next';
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
import { useDebounce } from '@/composables/useDebounce';

const studentStore = useStudentStore();
const teacherStore = useTeacherStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

// Enhanced tab state
const activeTab = ref('students');
const isPendingTabChange = ref(false);

// Enhanced filter state
const studentSearchQuery = ref('');
const isSearching = ref(false);
const showFinalized = ref(true);
const showInProgress = ref(true);
const studentSortBy = ref('name');
const studentSortOrder = ref('asc');

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

const debouncedSearch = useDebounce((query: string) => {
  if (query.length === 0) {
    // If search is cleared, fetch all students
    refreshData();
    return;
  }
  
  isSearching.value = true;
  studentStore.searchStudents(query)
    .finally(() => {
      isSearching.value = false;
    });
}, 300);

// Watch for changes in search query
watch(studentSearchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

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

// Handle tab change with animation
const handleTabChange = (value: string) => {
  isPendingTabChange.value = true;
  activeTab.value = value;
  setTimeout(() => {
    isPendingTabChange.value = false;
  }, 300);
};

// Filter students based on search and status filters
const filteredStudents = computed(() => {
  return studentStore.students.filter(student => {
    // Search filter
    const matchesSearch = student.name.toLowerCase().includes(studentSearchQuery.value.toLowerCase());
    
    // Status filter
    const matchesStatus = (
      (student.finalized && showFinalized.value) ||
      (!student.finalized && showInProgress.value)
    );
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by selected field
    let comparison = 0;
    if (studentSortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (studentSortBy.value === 'progress') {
      const aGrade = a.progressReportGrade ?? -1;
      const bGrade = b.progressReportGrade ?? -1;
      comparison = aGrade - bGrade;
    } else if (studentSortBy.value === 'final') {
      const aGrade = a.finalReportGrade ?? -1;
      const bGrade = b.finalReportGrade ?? -1;
      comparison = aGrade - bGrade;
    }
    
    // Apply sort order
    return studentSortOrder.value === 'asc' ? comparison : -comparison;
  });
});

// Toggle filters
const toggleFinalizedFilter = () => {
  showFinalized.value = !showFinalized.value;
};

const toggleInProgressFilter = () => {
  showInProgress.value = !showInProgress.value;
};

// Reset filters
const resetFilters = () => {
  studentSearchQuery.value = '';
  showFinalized.value = true;
  showInProgress.value = true;
  studentSortBy.value = 'name';
  studentSortOrder.value = 'asc';
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
          <div class="border-b mb-6">
            <TabsList class="inline-flex h-12 items-center justify-center rounded-md bg-muted p-1 w-auto">
              <TabsTrigger 
                value="students" 
                class="inline-flex items-center justify-center whitespace-nowrap px-5 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow rounded-md"
                @click="handleTabChange('students')"
              >
                <Users class="h-4 w-4 mr-2" />
                Student Management
                <Badge class="hidden sm:block ml-2 bg-blue-100 text-blue-800">{{ studentStore.students.length }}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="teachers" 
                class="inline-flex items-center justify-center whitespace-nowrap px-5 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow rounded-md"
                @click="handleTabChange('teachers')"
              >
                <User class="h-4 w-4 mr-2" />
                Teacher Information
                <Badge class="hidden sm:block ml-2 bg-blue-100 text-blue-800">{{ teacherStore.teachers.length }}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <!-- Students Tab Content -->
          <TabsContent 
            value="students" 
            class="mt-0 transition-all"
            :class="{ 'opacity-0': isPendingTabChange && activeTab === 'students', 'opacity-100': !isPendingTabChange && activeTab === 'students' }"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 py-4 rounded-lg">
              <div class="flex items-center space-x-2 flex-1">
                <div class="relative w-full max-w-xs">
                  <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    class="pl-8"
                    v-model="studentSearchQuery" 
                    :disabled="isSearching"
                  />
                  <Loader2 v-if="isSearching" class="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
                </div> 
              </div>
              
              <Dialog v-model:open="addStudentDialogOpen">
                <DialogTrigger asChild>
                  <Button size="sm" class="whitespace-nowrap">
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
            
            <div class="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div class="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 class="text-lg font-medium">Student Management</h3>
                
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" class="cursor-pointer" :class="showFinalized ? 'bg-green-50' : ''" @click="toggleFinalizedFilter">
                    <CheckCircle v-if="showFinalized" class="h-3 w-3 mr-1" /> 
                    Finalized ({{ studentStore.students.filter(s => s.finalized).length }})
                  </Badge>
                  
                  <Badge variant="outline" class="cursor-pointer" :class="showInProgress ? 'bg-yellow-50' : ''" @click="toggleInProgressFilter">
                    <CheckCircle v-if="showInProgress" class="h-3 w-3 mr-1" />
                    In Progress ({{ studentStore.students.filter(s => !s.finalized).length }})
                  </Badge>
                  
                  <span class="hidden sm:inline">|</span>
                  <span>Total: {{ studentStore.students.length }}</span>
                </div>
              </div>
            
              <div v-if="studentStore.students.length === 0" class="bg-muted p-8 text-center">
                <p class="text-muted-foreground">No students in the system. Add a student to get started.</p>
              </div>
              <div v-else-if="filteredStudents.length === 0" class="bg-muted p-8 text-center">
                <p class="text-muted-foreground">No students match your search criteria.</p>
                <Button variant="link" @click="resetFilters" class="mt-2">Reset Filters</Button>
              </div>
              <div v-else>
                <Table>
                  <TableHeader class="bg-muted/50">
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
                    <TableRow v-for="student in filteredStudents" :key="student.id"
                      :class="[
                        studentStore.isProcessing(student.id) ? 'opacity-70' : '',
                        student.finalized ? 'bg-green-50/30' : ''
                      ]"
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
            </div>
          </TabsContent>
          
          <!-- Teachers Tab Content -->
          <TabsContent 
            value="teachers" 
            class="mt-0 transition-all"
            :class="{ 'opacity-0': isPendingTabChange && activeTab === 'teachers', 'opacity-100': !isPendingTabChange && activeTab === 'teachers' }"
          >
            <div class="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div class="p-4 border-b">
                <h3 class="text-lg font-medium">Teacher Information</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  View all teachers and their assigned students
                </p>
              </div>
              
              <div v-if="teacherStore.teachers.length === 0" class="bg-muted p-8 text-center">
                <p class="text-muted-foreground">No teachers in the system.</p>
              </div>
              <div v-else>
                <Table>
                  <TableHeader class="bg-muted/50">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Assigned Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="teacher in teacherStore.teachers" :key="teacher.id">
                      <TableCell class="font-mono text-xs">{{ teacher.id }}</TableCell>
                      <TableCell>{{ teacher.name }}</TableCell>
                      <TableCell>
                        <Badge class="bg-blue-100 text-blue-800 border-none">
                          {{ studentStore.students.filter(s => s.assignedTeacherId === teacher.id).length }}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
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

<style scoped>
.transition-all {
  transition: all 0.2s ease;
}
</style>