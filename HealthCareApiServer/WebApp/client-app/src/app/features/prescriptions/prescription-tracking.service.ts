import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrescriptionModel } from '../../api/models';

export interface PrescriptionIntakeModel {
  id?: number;
  prescriptionId: number;
  scheduledFor: string;
  takenAt?: string | null;
}

export type PrescriptionWithIntakes = PrescriptionModel & {
  intakes?: PrescriptionIntakeModel[] | null;
};

export interface MarkIntakeRequest {
  prescriptionId: number;
  scheduledFor: string;
  takenAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PrescriptionTrackingService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private readonly http: HttpClient) { }

  getMyPrescriptions(): Observable<PrescriptionWithIntakes[]> {
    return this.http.get<PrescriptionWithIntakes[]>(`${this.baseUrl}/Prescription/Mine`);
  }

  markIntake(request: MarkIntakeRequest): Observable<PrescriptionIntakeModel> {
    return this.http.post<PrescriptionIntakeModel>(`${this.baseUrl}/PrescriptionIntake/Mark`, request);
  }
}
