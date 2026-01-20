import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // Example: GET
  get<T>(
    endpoint: string,
    params?: Record<
      string,
      string | number | boolean | readonly (string | number | boolean)[]
    >
  ): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params,
    });
  }

  // Example: POST
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  // Example: PUT
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  // Example: DELETE
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
}
