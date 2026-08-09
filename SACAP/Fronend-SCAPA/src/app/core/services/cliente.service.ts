import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClienteDTO {
  idCliente: number;
  nombreFinca: string;
  cedula: string;
  nombreContacto?: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clientes`;

  listarTodos(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(this.apiUrl);
  }

  listarPorTecnico(idTecnico: number): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(`${this.apiUrl}/tecnico/${idTecnico}`);
  }
}
