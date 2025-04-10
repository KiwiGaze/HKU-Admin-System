<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppLayout from '@/components/common/AppLayout.vue';
import { useStudentStore } from '@/stores/studentStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'vue-sonner';
import { CheckCircle, AlertCircle, Edit, Lock, Loader2, RefreshCw, Users, Search, Clock, Award, Filter, SlidersHorizontal, CheckSquare, BookOpen } from 'lucide-vue-next';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

// Search and filter state
const searchQuery = ref('');
const statusFilter = ref('all');
const sortBy = ref('name');
const sortOrder = ref('asc');

// Active tab state
const activeTab = ref('assigned');
const isPendingTabChange = ref(false);

// Use the getter to get students relevant to the current teacher
const assignedStudents = computed(() => {
  let students = studentStore.getStudentsForCurrentUser;
  
  // Apply search filter
  if (searchQuery.value) {
    students = students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Apply status filter
  if (statusFilter.value === 'finalized') {
    students = students.filter(student => student.finalized);
  } else if (statusFilter.value === 'in-progress') {
    students = students.filter(student => !student.finalized);
  }
  
  // Apply sorting
  return students.sort((a, b) => {
    let comparison = 0;
    if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy.value === 'progress') {
      const aGrade = a.progressReportGrade ?? -1;
      const bGrade = b.progressReportGrade ?? -1;
      comparison = aGrade - bGrade;
    } else if (sortBy.value === 'final') {
      const aGrade = a.finalReportGrade ?? -1;
      const bGrade = b.finalReportGrade ?? -1;
      comparison = aGrade - bGrade;
    } else if (sortBy.value === 'status') {
      comparison = (a.finalized ? 1 : 0) - (b.finalized ? 1 : 0);
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});

// Compute statistics for dashboard cards
const stats = computed(() => ({
  total: assignedStudents.value.length,
  finalized: assignedStudents.value.filter(s => s.finalized).length,
  inProgress: assignedStudents.value.filter(s => !s.finalized).length,
  graded: assignedStudents.value.filter(s => 
    s.progressReportGrade !== null || s.finalReportGrade !== null
  ).length
}));

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

// Reset filters
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  sortBy.value = 'name';
  sortOrder.value = 'asc';
};

// Handle tab change with animation
const handleTabChange = (value: string) => {
  isPendingTabChange.value = true;
  activeTab.value = value;
  setTimeout(() => {
    isPendingTabChange.value = false;
  }, 300);
};

// Get student name by ID for readability
const getStudentName = (id: string) => {
  const student = assignedStudents.value.find(s => s.id === id);
  return student ? student.name : 'Unknown Student';
}
</script>

<template>
  <AppLayout>
    <div class="container mx-auto py-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-foreground">Teacher Dashboard</h2>
        <Button @click="refreshData" variant="outline" size="sm" :disabled="isLoading">
          <RefreshCw v-if="!isLoading" class="h-4 w-4 mr-2" />
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </Button>
      </div>

      <p class="text-muted-foreground mb-6">Welcome, {{ authStore.userName || 'Teacher' }}! Here you can manage your assigned students and their grades.</p>

      <div v-if="isLoading" class="text-center py-10">
        <Loader2 class="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Loading assigned students...</p>
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
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Total Students</CardTitle>
              <Users class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.total }}</div>
              <p class="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Finalized Records</CardTitle>
              <CheckSquare class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.finalized }}</div>
              <p class="text-xs text-muted-foreground">No further changes allowed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">In Progress</CardTitle>
              <Clock class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.inProgress }}</div>
              <p class="text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium">Graded Students</CardTitle>
              <Award class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.graded }}</div>
              <p class="text-xs text-muted-foreground">With at least one grade</p>
            </CardContent>
          </Card>
        </div>

        <!-- Main Content -->
        <Tabs v-model="activeTab" class="w-full">
          <div class="border-b mb-6">
            <TabsList class="inline-flex h-12 items-center justify-center rounded-md bg-muted p-1 w-auto">
              <TabsTrigger 
                value="assigned" 
                class="inline-flex items-center justify-center whitespace-nowrap px-5 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow rounded-md"
                @click="handleTabChange('assigned')"
              >
                <Users class="h-4 w-4 mr-2" />
                Assigned Students
                <Badge class="ml-2 bg-blue-100 text-blue-800">{{ stats.total }}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                class="inline-flex items-center justify-center whitespace-nowrap px-5 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow rounded-md"
                @click="handleTabChange('reports')"
              >
                <BookOpen class="h-4 w-4 mr-2" />
                Report Overview
              </TabsTrigger>
            </TabsList>
          </div>
          
          <!-- Students Tab Content -->
          <TabsContent 
            value="assigned" 
            class="mt-0 transition-all"
            :class="{ 'opacity-0': isPendingTabChange && activeTab === 'assigned', 'opacity-100': !isPendingTabChange && activeTab === 'assigned' }"
          >
            <!-- Search and Filter Controls -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 py-4 rounded-lg">
              <div class="flex items-center space-x-2 flex-1">
                <div class="relative w-full max-w-xs">
                  <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    class="pl-8"
                    v-model="searchQuery" 
                  />
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="bg-green-50/50">
                  <CheckCircle class="h-3 w-3 mr-1 text-green-600" /> 
                  Finalized: {{ stats.finalized }}
                </Badge>
                <Badge variant="outline" class="bg-yellow-50/50">
                  <Clock class="h-3 w-3 mr-1 text-yellow-600" />
                  In Progress: {{ stats.inProgress }}
                </Badge>
              </div>
            </div>

            <!-- Students Table -->
            <div class="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div class="p-4 border-b">
                <h3 class="text-lg font-medium">Assigned Students</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  Manage student reports and grades
                </p>
              </div>
              
              <div v-if="assignedStudents.length === 0" class="bg-muted p-8 text-center">
                <p class="text-muted-foreground">You currently have no students assigned.</p>
              </div>
              <div v-else-if="searchQuery && assignedStudents.length === 0" class="bg-muted p-8 text-center">
                <p class="text-muted-foreground">No students match your search criteria.</p>
                <Button variant="link" @click="resetFilters" class="mt-2">Reset Filters</Button>
              </div>
              <div v-else>
                <Table>
                  <TableHeader class="bg-muted/50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Progress Report</TableHead>
                      <TableHead>Final Report</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow 
                      v-for="student in assignedStudents" 
                      :key="student.id" 
                      :class="[
                        studentStore.isProcessing(student.id) ? 'opacity-70' : '',
                        student.finalized ? 'bg-green-50/30' : ''
                      ]"
                    >
                      <TableCell>{{ student.name }}</TableCell>
                      <TableCell>
                        <div class="flex items-center gap-1">
                          <Badge 
                            v-if="student.progressReportGrade !== null" 
                            variant="outline" 
                            :class="{'bg-blue-50 text-blue-700': student.progressReportGrade >= 60}"
                          >
                            {{ student.progressReportGrade }}/100
                          </Badge>
                          <span v-else class="text-muted-foreground text-sm">Not graded</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center gap-1">
                          <Badge 
                            v-if="student.finalReportGrade !== null" 
                            variant="outline" 
                            :class="{'bg-blue-50 text-blue-700': student.finalReportGrade >= 60}"
                          >
                            {{ student.finalReportGrade }}/100
                          </Badge>
                          <span v-else class="text-muted-foreground text-sm">Not graded</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge v-if="student.finalized" variant="outline" class="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle class="h-3 w-3 mr-1" /> Finalized
                        </Badge>
                        <Badge v-else variant="outline" class="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock class="h-3 w-3 mr-1" /> In Progress
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
                                <AlertDialogTitle>Finalize Student Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will finalize the student record for {{ student.name }}. After finalization, no further changes can be made to the grades.
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
                          <div v-if="student.finalized" class="text-gray-500 text-sm italic">No further changes can be made</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <!-- Reports Overview Tab Content -->
          <TabsContent 
            value="reports" 
            class="mt-0 transition-all"
            :class="{ 'opacity-0': isPendingTabChange && activeTab === 'reports', 'opacity-100': !isPendingTabChange && activeTab === 'reports' }"
          >
            <div class="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div class="p-4 border-b">
                <h3 class="text-lg font-medium">Report Overview</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  At-a-glance view of student progress and final reports
                </p>
              </div>
              
              <div class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Progress Reports Card -->
                  <div class="border rounded-md overflow-hidden">
                    <div class="bg-blue-50/50 p-3 border-b">
                      <h4 class="font-medium flex items-center">
                        <BookOpen class="h-4 w-4 mr-2" /> 
                        Progress Reports
                      </h4>
                    </div>
                    <div class="p-4">
                      <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                          <span>Completed:</span>
                          <span class="font-medium">
                            {{ assignedStudents.filter(s => s.progressReportGrade !== null).length }} of {{ assignedStudents.length }}
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                          <div class="bg-blue-600 h-2.5 rounded-full" :style="{
                            width: `${(assignedStudents.filter(s => s.progressReportGrade !== null).length / Math.max(assignedStudents.length, 1)) * 100}%`
                          }"></div>
                        </div>
                        <div class="pt-2">
                          <h5 class="text-sm font-medium mb-2">Recently Graded</h5>
                          <div class="space-y-2">
                            <div v-for="student in assignedStudents.filter(s => s.progressReportGrade !== null).slice(0, 3)" :key="`progress-${student.id}`" class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                              <span>{{ student.name }}</span>
                              <Badge variant="outline" :class="{'bg-green-50 text-green-700': student.progressReportGrade && student.progressReportGrade >= 60, 'bg-red-50 text-red-700': student.progressReportGrade && student.progressReportGrade < 60, 'bg-gray-50 text-gray-700': student.progressReportGrade === null}">
                                {{ student.progressReportGrade !== null ? student.progressReportGrade : 'Not graded' }} / 100
                              </Badge>
                            </div>
                            <div v-if="!assignedStudents.some(s => s.progressReportGrade !== null)" class="text-center text-sm text-muted-foreground p-2">
                              No progress reports graded yet
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Final Reports Card -->
                  <div class="border rounded-md overflow-hidden">
                    <div class="bg-green-50/50 p-3 border-b">
                      <h4 class="font-medium flex items-center">
                        <Award class="h-4 w-4 mr-2" /> 
                        Final Reports
                      </h4>
                    </div>
                    <div class="p-4">
                      <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                          <span>Completed:</span>
                          <span class="font-medium">
                            {{ assignedStudents.filter(s => s.finalReportGrade !== null).length }} of {{ assignedStudents.length }}
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                          <div class="bg-green-600 h-2.5 rounded-full" :style="{
                            width: `${(assignedStudents.filter(s => s.finalReportGrade !== null).length / Math.max(assignedStudents.length, 1)) * 100}%`
                          }"></div>
                        </div>
                        <div class="pt-2">
                          <h5 class="text-sm font-medium mb-2">Recently Graded</h5>
                          <div class="space-y-2">
                            <div v-for="student in assignedStudents.filter(s => s.finalReportGrade !== null).slice(0, 3)" :key="`final-${student.id}`" class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                              <span>{{ student.name }}</span>
                              <Badge variant="outline" :class="{'bg-green-50 text-green-700': student.finalReportGrade && student.finalReportGrade >= 60, 'bg-red-50 text-red-700': student.finalReportGrade && student.finalReportGrade < 60, 'bg-gray-50 text-gray-700': student.finalReportGrade === null}">
                                {{ student.finalReportGrade !== null ? student.finalReportGrade : 'Not graded' }} / 100
                              </Badge>
                            </div>
                            <div v-if="!assignedStudents.some(s => s.finalReportGrade !== null)" class="text-center text-sm text-muted-foreground p-2">
                              No final reports graded yet
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Overall Status -->
                <div class="mt-6 border rounded-md overflow-hidden">
                  <div class="bg-gray-50 p-3 border-b">
                    <h4 class="font-medium">Overall Status</h4>
                  </div>
                  <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="flex flex-col">
                        <span class="text-sm text-muted-foreground">Finalized Students</span>
                        <div class="text-2xl font-bold mt-1">{{ stats.finalized }}</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div class="bg-green-600 h-1.5 rounded-full" :style="{
                            width: `${(stats.finalized / Math.max(stats.total, 1)) * 100}%`
                          }"></div>
                        </div>
                        <span class="text-xs text-muted-foreground mt-1">{{ Math.round((stats.finalized / Math.max(stats.total, 1)) * 100) }}% complete</span>
                      </div>
                      
                      <div class="flex flex-col">
                        <span class="text-sm text-muted-foreground">Progress Reports Graded</span>
                        <div class="text-2xl font-bold mt-1">{{ assignedStudents.filter(s => s.progressReportGrade !== null).length }}</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div class="bg-blue-600 h-1.5 rounded-full" :style="{
                            width: `${(assignedStudents.filter(s => s.progressReportGrade !== null).length / Math.max(stats.total, 1)) * 100}%`
                          }"></div>
                        </div>
                        <span class="text-xs text-muted-foreground mt-1">
                          {{ Math.round((assignedStudents.filter(s => s.progressReportGrade !== null).length / Math.max(stats.total, 1)) * 100) }}% complete
                        </span>
                      </div>
                      
                      <div class="flex flex-col">
                        <span class="text-sm text-muted-foreground">Final Reports Graded</span>
                        <div class="text-2xl font-bold mt-1">{{ assignedStudents.filter(s => s.finalReportGrade !== null).length }}</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div class="bg-purple-600 h-1.5 rounded-full" :style="{
                            width: `${(assignedStudents.filter(s => s.finalReportGrade !== null).length / Math.max(stats.total, 1)) * 100}%`
                          }"></div>
                        </div>
                        <span class="text-xs text-muted-foreground mt-1">
                          {{ Math.round((assignedStudents.filter(s => s.finalReportGrade !== null).length / Math.max(stats.total, 1)) * 100) }}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </AppLayout>
  
  <!-- Grade Dialog -->
  <Dialog v-model:open="gradeDialogOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ selectedReportType === 'progress' ? 'Progress Report' : 'Final Report' }} Grade</DialogTitle>
        <DialogDescription>
          Enter the grade for {{ getStudentName(selectedStudent || '') }}'s {{ selectedReportType }} report.
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
          Submit Grade
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