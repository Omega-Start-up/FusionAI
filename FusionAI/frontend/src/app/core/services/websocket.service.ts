import { Injectable, inject, computed, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent, BehaviorSubject, Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  roomId?: string;
}

export interface RoomInfo {
  id: string;
  name: string;
  participants: string[];
  createdAt: Date;
}

export interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentRoom?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private authService = inject(AuthService);
  
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // État de connexion
  private _connectionState = signal<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  private _connectedUsers = signal<UserPresence[]>([]);
  private _currentRoom = signal<string | null>(null);
  private _rooms = signal<RoomInfo[]>([]);

  // Messages temps réel
  private _messageSubject = new Subject<WebSocketMessage>();
  private _typingSubject = new Subject<{ userId: string; isTyping: boolean; roomId: string }>();
  private _presenceSubject = new Subject<UserPresence>();

  // Computed properties
  readonly isConnected = computed(() => this._connectionState() === 'connected');
  readonly connectionState = this._connectionState.asReadonly();
  readonly connectedUsers = this._connectedUsers.asReadonly();
  readonly currentRoom = this._currentRoom.asReadonly();
  readonly rooms = this._rooms.asReadonly();

  // Observables publics
  readonly messages$ = this._messageSubject.asObservable();
  readonly typing$ = this._typingSubject.asObservable();
  readonly presence$ = this._presenceSubject.asObservable();

  /**
   * Initialiser la connexion WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('Cannot connect to WebSocket: No authentication token');
      return;
    }

    this._connectionState.set('connecting');

    this.socket = io(environment.wsUrl || 'ws://localhost:3001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventListeners();
  }

  /**
   * Déconnecter WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this._connectionState.set('disconnected');
    this._currentRoom.set(null);
    this._connectedUsers.set([]);
  }

  /**
   * Rejoindre une room
   */
  joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: Socket not connected');
      return;
    }

    this.socket.emit('join-room', { roomId });
    this._currentRoom.set(roomId);
  }

  /**
   * Quitter une room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave-room', { roomId });
    if (this._currentRoom() === roomId) {
      this._currentRoom.set(null);
    }
  }

  /**
   * Envoyer un message
   */
  sendMessage(type: string, payload: any, roomId?: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: Socket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date(),
      roomId: roomId || this._currentRoom() || undefined
    };

    this.socket.emit('message', message);
  }

  /**
   * Envoyer un signal de frappe
   */
  sendTyping(isTyping: boolean, roomId?: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('typing', {
      isTyping,
      roomId: roomId || this._currentRoom()
    });
  }

  /**
   * Mettre à jour le statut de présence
   */
  updatePresence(status: UserPresence['status']): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('presence-update', { status });
  }

  /**
   * Obtenir la liste des rooms disponibles
   */
  getRooms(): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('get-rooms');
  }

  /**
   * Créer une nouvelle room
   */
  createRoom(name: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('create-room', { name });
  }

  /**
   * Configuration des event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // ===== CONNEXION =====
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this._connectionState.set('connected');
      this.reconnectAttempts = 0;
      
      // Restaurer l'état si nécessaire
      this.restoreState();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this._connectionState.set('disconnected');
      this._connectedUsers.set([]);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this._connectionState.set('error');
      this.handleReconnection();
    });

    // ===== MESSAGES =====
    this.socket.on('message', (message: WebSocketMessage) => {
      this._messageSubject.next(message);
    });

    this.socket.on('typing', (data: { userId: string; isTyping: boolean; roomId: string }) => {
      this._typingSubject.next(data);
    });

    // ===== PRÉSENCE =====
    this.socket.on('user-connected', (user: UserPresence) => {
      this.updateUserPresence(user);
    });

    this.socket.on('user-disconnected', (userId: string) => {
      this.removeUserPresence(userId);
    });

    this.socket.on('presence-update', (user: UserPresence) => {
      this.updateUserPresence(user);
      this._presenceSubject.next(user);
    });

    this.socket.on('users-list', (users: UserPresence[]) => {
      this._connectedUsers.set(users);
    });

    // ===== ROOMS =====
    this.socket.on('room-joined', (roomInfo: RoomInfo) => {
      console.log('Joined room:', roomInfo.name);
      this._currentRoom.set(roomInfo.id);
    });

    this.socket.on('room-left', (roomId: string) => {
      console.log('Left room:', roomId);
      if (this._currentRoom() === roomId) {
        this._currentRoom.set(null);
      }
    });

    this.socket.on('rooms-list', (rooms: RoomInfo[]) => {
      this._rooms.set(rooms);
    });

    this.socket.on('room-created', (room: RoomInfo) => {
      const currentRooms = this._rooms();
      this._rooms.set([...currentRooms, room]);
    });

    // ===== COLLABORATION =====
    this.socket.on('file-changed', (data: any) => {
      this._messageSubject.next({
        type: 'file-change',
        payload: data,
        timestamp: new Date()
      });
    });

    this.socket.on('cursor-position', (data: any) => {
      this._messageSubject.next({
        type: 'cursor-position',
        payload: data,
        timestamp: new Date()
      });
    });

    // ===== NOTIFICATIONS =====
    this.socket.on('notification', (notification: any) => {
      this._messageSubject.next({
        type: 'notification',
        payload: notification,
        timestamp: new Date()
      });
    });
  }

  /**
   * Gestion de la reconnexion
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this._connectionState.set('error');
    }
  }

  /**
   * Restaurer l'état après reconnexion
   */
  private restoreState(): void {
    // Rejoindre la room courante si elle existe
    const currentRoom = this._currentRoom();
    if (currentRoom) {
      this.joinRoom(currentRoom);
    }

    // Récupérer la liste des rooms et des utilisateurs
    this.getRooms();
    this.socket?.emit('get-users');
  }

  /**
   * Mettre à jour la présence d'un utilisateur
   */
  private updateUserPresence(user: UserPresence): void {
    const users = this._connectedUsers();
    const existingIndex = users.findIndex(u => u.userId === user.userId);
    
    if (existingIndex >= 0) {
      const updatedUsers = [...users];
      updatedUsers[existingIndex] = user;
      this._connectedUsers.set(updatedUsers);
    } else {
      this._connectedUsers.set([...users, user]);
    }
  }

  /**
   * Supprimer un utilisateur de la liste de présence
   */
  private removeUserPresence(userId: string): void {
    const users = this._connectedUsers();
    this._connectedUsers.set(users.filter(u => u.userId !== userId));
  }

  /**
   * Nettoyage au destroy du service
   */
  ngOnDestroy(): void {
    this.disconnect();
    this._messageSubject.complete();
    this._typingSubject.complete();
    this._presenceSubject.complete();
  }
}