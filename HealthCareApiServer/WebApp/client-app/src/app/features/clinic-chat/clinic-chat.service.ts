import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfiguration } from '../../api/api-configuration';
import {
  DoctorRecommendationRequest,
  DoctorRecommendationResponse,
  ErrorResponse,
  SymptomMessageRequest,
  SymptomMessageResponse,
} from './clinic-chat.models';

@Injectable({ providedIn: 'root' })
export class ClinicChatService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);
  private readonly baseUrl = this.apiConfig.rootUrl?.replace(/\/$/, '') ?? '';

  analyzeSymptoms(request: SymptomMessageRequest): Observable<SymptomMessageResponse> {
    return this.http
      .post<SymptomMessageResponse | ErrorResponse>(`${this.baseUrl}/api/Chat/Symptoms`, request)
      .pipe(map((response) => this.ensureSymptomResponse(response)));
  }

  recommendDoctors(request: DoctorRecommendationRequest): Observable<DoctorRecommendationResponse> {
    return this.http
      .post<DoctorRecommendationResponse | ErrorResponse>(`${this.baseUrl}/api/Chat/Department`, request)
      .pipe(map((response) => this.ensureDoctorResponse(response)));
  }

  private ensureSymptomResponse(response: SymptomMessageResponse | ErrorResponse): SymptomMessageResponse {
    if (this.isSymptomResponse(response)) {
      return {
        ...response,
        departments: response.departments ?? [],
        followUpQuestions: response.followUpQuestions ?? [],
      };
    }

    throw new Error(response.message ?? 'The assistant was unable to process your symptoms.');
  }

  private ensureDoctorResponse(response: DoctorRecommendationResponse | ErrorResponse): DoctorRecommendationResponse {
    if (this.isDoctorResponse(response)) {
      return {
        ...response,
        doctors: response.doctors ?? [],
      };
    }

    throw new Error(response.message ?? 'The assistant was unable to load doctor availability.');
  }

  private isSymptomResponse(value: any): value is SymptomMessageResponse {
    return value && typeof value === 'object' && 'message' in value && 'departments' in value;
  }

  private isDoctorResponse(value: any): value is DoctorRecommendationResponse {
    return value && typeof value === 'object' && 'message' in value && 'department' in value;
  }
}
