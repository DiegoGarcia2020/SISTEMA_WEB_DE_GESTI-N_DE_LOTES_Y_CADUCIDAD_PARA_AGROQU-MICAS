import { Injectable, inject } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private authService = inject(AuthService);
  private client: Client;
  private connectionSubject = new Subject<boolean>();
  public connectionState$ = this.connectionSubject.asObservable();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-sacpa'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      beforeConnect: () => {
        const token = this.authService.getToken();
        this.client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      }
    });

    this.client.onConnect = (frame) => {
      console.log('Conectado a WebSocket', frame);
      this.connectionSubject.next(true);
    };

    this.client.onStompError = (frame) => {
      console.error('Error STOMP:', frame);
      this.connectionSubject.next(false);
    };

    this.client.onWebSocketClose = () => {
      console.log('Conexión WebSocket cerrada');
      this.connectionSubject.next(false);
    };

    this.client.activate();
  }

  public subscribe(topic: string, callback: (message: any) => void): void {
    if (this.client.connected) {
      this.client.subscribe(topic, message => callback(JSON.parse(message.body)));
    } else {
      this.connectionState$.subscribe(connected => {
        if (connected) {
          this.client.subscribe(topic, message => callback(JSON.parse(message.body)));
        }
      });
    }
  }

  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
