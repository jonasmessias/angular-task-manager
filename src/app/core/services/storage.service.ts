import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import type {
  DeleteFileDto,
  PresignedUploadDto,
  PresignedUploadResponse,
  UploadResponse,
} from '../interfaces/storage.interface';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(API_ENDPOINTS.STORAGE.UPLOAD, formData);
  }

  getPresignedUploadUrl(dto: PresignedUploadDto): Observable<PresignedUploadResponse> {
    return this.http.post<PresignedUploadResponse>(API_ENDPOINTS.STORAGE.PRESIGNED_UPLOAD, dto);
  }

  deleteFile(dto: DeleteFileDto): Observable<void> {
    const params = new HttpParams().set('fileUrl', dto.fileUrl);
    return this.http.delete<void>(API_ENDPOINTS.STORAGE.DELETE, { params });
  }
}
