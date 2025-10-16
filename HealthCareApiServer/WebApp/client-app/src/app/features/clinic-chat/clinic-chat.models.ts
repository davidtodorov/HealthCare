export interface DepartmentOption {
  id: number;
  name: string;
  description?: string | null;
}

export interface DepartmentSuggestion {
  department: DepartmentOption;
  confidence?: number | null;
  reason?: string | null;
}

export interface SymptomMessageResponse {
  message: string;
  suggestedDepartment?: DepartmentSuggestion | null;
  departments: DepartmentOption[];
  followUpQuestions: string[];
  symptomSummary?: string | null;
}

export interface SymptomMessageRequest {
  message: string;
}

export interface DoctorRecommendationRequest {
  departmentId: number;
  symptomSummary?: string | null;
  userMessage?: string | null;
}

export interface AppointmentSlotOption {
  utcStart: string;
  localDate: string;
  localTime: string;
  displayLabel: string;
}

export interface DoctorSuggestion {
  doctorId: number;
  departmentId: number;
  departmentName?: string | null;
  fullName: string;
  hospitalName?: string | null;
  freeSlotCount: number;
  upcomingSlots: AppointmentSlotOption[];
}

export interface DoctorRecommendationResponse {
  message: string;
  department: DepartmentOption;
  doctors: DoctorSuggestion[];
  symptomSummary?: string | null;
}

export interface ErrorResponse {
  message?: string;
}
