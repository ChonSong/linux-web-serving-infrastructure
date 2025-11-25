import { io, Socket } from 'socket.io-client';

export interface DeviceInfo {
  name?: string;
  type?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  viewport?: string;
  userAgent?: string;
  platform?: string;
}

export interface SessionState {
  [key: string]: any;
}

export interface SyncOptions {
  syncServerUrl: string;
  token: string;
  deviceInfo?: DeviceInfo;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

export interface SyncEvents {
  'connected': () => void;
  'disconnected': () => void;
  'session-restored': (data: { sessionData: SessionState; deviceId: string }) => void;
  'session-updated': (data: { sessionKey: string; state: any; deviceId: string; timestamp: number }) => void;
  'device-connected': (data: { deviceId: string; deviceInfo: DeviceInfo }) => void;
  'device-disconnected': (data: { deviceId: string; timestamp: number }) => void;
  'realtime-event': (data: { type: string; payload: any; sourceDeviceId: string; timestamp: number }) => void;
  'device-message': (data: { message: any; sourceDeviceId: string; timestamp: number }) => void;
  'error': (error: { message: string }) => void;
}

export class CodeServerSync {
  private socket: Socket | null = null;
  private deviceId: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners = new Map<string, Set<Function>>();
  private pendingUpdates = new Map<string, any>();
  private updateQueue: Array<{ sessionKey: string; state: any }> = [];
  private isProcessingQueue = false;

  constructor(private options: SyncOptions) {
    this.options = {
      autoReconnect: true,
      reconnectDelay: 1000,
      ...options
    };
  }

  /**
   * Connect to the sync server
   */
  async connect(): Promise<void> {
    try {
      if (this.socket?.connected) {
        console.warn('Sync client already connected');
        return;
      }

      this.socket = io(this.options.syncServerUrl, {
        auth: { token: this.options.token },
        query: {
          deviceInfo: JSON.stringify(this.options.deviceInfo || this.getDefaultDeviceInfo())
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();

      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Connected to sync server');
          this.emit('connected');
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.emit('error', { message: error.message });
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to connect to sync server:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the sync server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.deviceId = null;
      console.log('Disconnected from sync server');
      this.emit('disconnected');
    }
  }

  /**
   * Check if connected to sync server
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get current device ID
   */
  getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Update session state - synchronizes across all devices
   */
  updateSession(sessionKey: string, state: any, debounce = 100): void {
    if (!this.isConnectionActive()) {
      // Queue the update for when we reconnect
      this.updateQueue.push({ sessionKey, state });
      return;
    }

    // Debounce rapid updates
    if (this.pendingUpdates.has(sessionKey)) {
      clearTimeout(this.pendingUpdates.get(sessionKey));
    }

    const timeoutId = setTimeout(() => {
      this.socket?.emit('session-update', { sessionKey, state });
      this.pendingUpdates.delete(sessionKey);
    }, debounce);

    this.pendingUpdates.set(sessionKey, timeoutId);
  }

  /**
   * Send real-time event (cursor position, text changes, etc.)
   */
  sendRealtimeEvent(type: string, payload: any, targetDeviceId?: string): void {
    if (!this.isConnectionActive()) {
      console.warn('Cannot send realtime event - not connected');
      return;
    }

    this.socket!.emit('realtime-event', { type, payload, targetDeviceId });
  }

  /**
   * Send message to specific device
   */
  sendDeviceMessage(targetDeviceId: string, message: any): void {
    if (!this.isConnectionActive()) {
      console.warn('Cannot send device message - not connected');
      return;
    }

    this.socket!.emit('device-message', { targetDeviceId, message });
  }

  /**
   * Register event listener
   */
  on<K extends keyof SyncEvents>(event: K, callback: SyncEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SyncEvents>(event: K, callback: SyncEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * Get list of user's devices (requires server API call)
   */
  async getDevices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.options.syncServerUrl}/api/devices`, {
        headers: {
          'Authorization': `Bearer ${this.options.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.devices;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('session-restored', (data) => {
      this.deviceId = data.deviceId;
      this.processUpdateQueue();
      this.emit('session-restored', data);
    });

    this.socket.on('session-updated', (data) => {
      // Ignore updates from this device to prevent echo
      if (data.deviceId === this.deviceId) return;

      this.emit('session-updated', data);
    });

    this.socket.on('device-connected', (data) => {
      if (data.deviceId === this.deviceId) return;
      this.emit('device-connected', data);
    });

    this.socket.on('device-disconnected', (data) => {
      if (data.deviceId === this.deviceId) return;
      this.emit('device-disconnected', data);
    });

    this.socket.on('realtime-event', (data) => {
      if (data.sourceDeviceId === this.deviceId) return;
      this.emit('realtime-event', data);
    });

    this.socket.on('device-message', (data) => {
      if (data.sourceDeviceId === this.deviceId) return;
      this.emit('device-message', data);
    });

    this.socket.on('error', (error) => {
      this.emit('error', error);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Disconnected from sync server:', reason);
      this.emit('disconnected');

      // Attempt reconnection if enabled and not intentionally disconnected
      if (this.options.autoReconnect && reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectDelay! * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private processUpdateQueue(): void {
    if (this.isProcessingQueue || this.updateQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift();
      if (update) {
        this.updateSession(update.sessionKey, update.state, 0);
      }
    }

    this.isProcessingQueue = false;
  }

  private getDefaultDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    // Determine device type
    let type: DeviceInfo['type'] = 'unknown';
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
      type = /iPad/.test(ua) ? 'tablet' : 'mobile';
    } else if (/Desktop|Windows|Mac|Linux/.test(ua)) {
      type = 'desktop';
    }

    return {
      name: `${type} - ${new Date().toLocaleDateString()}`,
      type,
      userAgent: ua,
      platform,
      viewport: `${window.screen.width}x${window.screen.height}`
    };
  }

  private emit<K extends keyof SyncEvents>(event: K, ...args: Parameters<SyncEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export factory function for easier usage
export function createCodeServerSync(options: SyncOptions): CodeServerSync {
  return new CodeServerSync(options);
}

// Export types for TypeScript users
export type { SyncEvents, DeviceInfo, SessionState, SyncOptions };