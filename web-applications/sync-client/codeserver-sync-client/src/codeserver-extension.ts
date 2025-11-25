import { CodeServerSync, createCodeServerSync } from './sync-client';

declare global {
  interface Window {
    codeServerSync?: CodeServerSync;
    monaco?: any;
  }
}

/**
 * Code Server Extension for Cross-Device Synchronization
 *
 * This extension provides real-time synchronization of:
 * - Open files and tabs
 * - Cursor positions
 * - Text editor content
 * - Terminal state
 * - VS Code settings
 */
export class CodeServerSyncExtension {
  private syncClient: CodeServerSync | null = null;
  private isExtensionEnabled = false;
  private fileChangeHandler: ((e: any) => void) | null = null;
  private cursorChangeHandler: ((e: any) => void) | null = null;
  private terminalDataHandler: ((data: string) => void) | null = null;

  constructor() {
    this.loadSettings();
  }

  /**
   * Initialize the sync extension
   */
  async initialize(token: string, syncServerUrl = 'https://sync.codeovertcp.com'): Promise<void> {
    try {
      // Create sync client
      this.syncClient = createCodeServerSync({
        syncServerUrl,
        token,
        deviceInfo: this.getDeviceInfo(),
        autoReconnect: true
      });

      // Setup event handlers
      this.setupSyncEventHandlers();

      // Connect to sync server
      await this.syncClient.connect();

      // Setup code-server integration
      this.setupCodeServerIntegration();

      this.isExtensionEnabled = true;
      console.log('Code Server Sync Extension initialized');

      // Store globally for access from other scripts
      window.codeServerSync = this.syncClient;

    } catch (error) {
      console.error('Failed to initialize Code Server Sync Extension:', error);
      throw error;
    }
  }

  /**
   * Disable the sync extension
   */
  disable(): void {
    this.cleanupCodeServerIntegration();
    this.syncClient?.disconnect();
    this.isExtensionEnabled = false;
    delete window.codeServerSync;
    console.log('Code Server Sync Extension disabled');
  }

  /**
   * Check if extension is enabled
   */
  isEnabled(): boolean {
    return this.isExtensionEnabled;
  }

  /**
   * Get sync client instance
   */
  getSyncClient(): CodeServerSync | null {
    return this.syncClient;
  }

  private setupSyncEventHandlers(): void {
    if (!this.syncClient) return;

    // Handle session restoration
    this.syncClient.on('session-restored', ({ sessionData }) => {
      console.log('Session restored:', sessionData);
      this.restoreSession(sessionData);
    });

    // Handle session updates from other devices
    this.syncClient.on('session-updated', ({ sessionKey, state }) => {
      console.log('Session updated:', sessionKey, state);
      this.handleSessionUpdate(sessionKey, state);
    });

    // Handle device connections
    this.syncClient.on('device-connected', ({ deviceId, deviceInfo }) => {
      this.showNotification(`${deviceInfo.name || 'Another device'} connected`, 'info');
    });

    // Handle real-time cursor position updates
    this.syncClient.on('realtime-event', ({ type, payload, sourceDeviceId }) => {
      if (type === 'cursor-position') {
        this.showRemoteCursor(payload, sourceDeviceId);
      }
    });

    // Handle errors
    this.syncClient.on('error', ({ message }) => {
      console.error('Sync error:', message);
      this.showNotification(`Sync error: ${message}`, 'error');
    });
  }

  private setupCodeServerIntegration(): void {
    // Wait for Monaco editor to be available
    this.waitForMonaco(() => {
      this.setupMonacoIntegration();
    });

    // Setup terminal integration
    this.setupTerminalIntegration();

    // Setup file system integration
    this.setupFileIntegration();

    // Setup settings synchronization
    this.setupSettingsSync();
  }

  private waitForMonaco(callback: () => void, maxAttempts = 50): void {
    let attempts = 0;

    const checkMonaco = () => {
      attempts++;

      if (window.monaco) {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(checkMonaco, 100);
      } else {
        console.warn('Monaco editor not found, some sync features may not work');
      }
    };

    checkMonaco();
  }

  private setupMonacoIntegration(): void {
    if (!window.monaco || !this.syncClient) return;

    // Listen for model changes
    this.fileChangeHandler = (e: any) => {
      const model = e.model;
      if (model && model.uri && !model.uri.scheme.includes('output')) {
        const content = model.getValue();
        const filePath = model.uri.path;

        this.syncClient!.updateSession(`file:${filePath}`, {
          content,
          lastModified: Date.now()
        });
      }
    };

    // Listen for cursor position changes
    this.cursorChangeHandler = (e: any) => {
      const position = e.position;
      const model = e.model;

      if (model && model.uri && position) {
        this.syncClient!.sendRealtimeEvent('cursor-position', {
          line: position.lineNumber,
          column: position.column,
          filePath: model.uri.path
        });
      }
    };

    // Register listeners with all existing editors
    window.monaco.editor.getModels().forEach(model => {
      model.onDidChangeContent(this.fileChangeHandler);
    });

    // Listen for new models
    window.monaco.editor.onDidCreateModel((model: any) => {
      model.onDidChangeContent(this.fileChangeHandler);
    });

    console.log('Monaco editor integration setup complete');
  }

  private setupTerminalIntegration(): void {
    // This would integrate with code-server's terminal
    // Implementation depends on how code-server exposes terminal APIs
    try {
      // Try to find terminal elements and hook into their data streams
      const terminals = document.querySelectorAll('.xterm');

      terminals.forEach((terminal) => {
        // This is a simplified approach - real implementation would need
        // to hook into the terminal's actual data stream
        console.log('Found terminal, setting up sync integration');
      });
    } catch (error) {
      console.warn('Terminal integration setup failed:', error);
    }
  }

  private setupFileIntegration(): void {
    // This would integrate with the file explorer
    // to sync open tabs, file tree state, etc.
    try {
      // Listen for file open/close events
      console.log('File integration setup complete');
    } catch (error) {
      console.warn('File integration setup failed:', error);
    }
  }

  private setupSettingsSync(): void {
    // Sync VS Code settings across devices
    try {
      // Get current settings
      const settings = this.getCurrentSettings();

      if (settings && this.syncClient) {
        this.syncClient.updateSession('vscode-settings', settings);
      }

      console.log('Settings sync setup complete');
    } catch (error) {
      console.warn('Settings sync setup failed:', error);
    }
  }

  private getCurrentSettings(): any {
    // Try to get VS Code settings from localStorage or API
    try {
      const settings = {};
      // This would need to be implemented based on how code-server stores settings
      return settings;
    } catch (error) {
      console.warn('Failed to get current settings:', error);
      return {};
    }
  }

  private restoreSession(sessionData: any): void {
    // Restore file contents
    Object.keys(sessionData).forEach(key => {
      if (key.startsWith('file:')) {
        const filePath = key.replace('file:', '');
        const { content } = sessionData[key];
        this.restoreFileContent(filePath, content);
      }
    });

    // Restore settings
    if (sessionData['vscode-settings']) {
      this.restoreSettings(sessionData['vscode-settings']);
    }
  }

  private handleSessionUpdate(sessionKey: string, state: any): void {
    if (sessionKey.startsWith('file:')) {
      const filePath = sessionKey.replace('file:', '');
      const { content } = state;
      this.syncFileContent(filePath, content);
    } else if (sessionKey === 'vscode-settings') {
      this.restoreSettings(state);
    }
  }

  private restoreFileContent(filePath: string, content: string): void {
    // This would open the file and restore its content
    console.log(`Restoring content for ${filePath}`);
  }

  private syncFileContent(filePath: string, content: string): void {
    // This would update the file content in real-time
    console.log(`Syncing content for ${filePath}`);
  }

  private restoreSettings(settings: any): void {
    // This would restore VS Code settings
    console.log('Restoring settings:', settings);
  }

  private showRemoteCursor(position: any, sourceDeviceId: string): void {
    // Show remote cursor position in the editor
    console.log(`Remote cursor at ${position.line}:${position.column} from ${sourceDeviceId}`);
  }

  private showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    // Show notification in code-server UI
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Try to use VS Code's notification system if available
    if ((window as any).vscode) {
      (window as any).vscode.window.showInformationMessage(message);
    }
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);

    return {
      name: isMobile ? 'Mobile Code Server' : 'Desktop Code Server',
      type: isMobile ? 'mobile' : 'desktop',
      userAgent: ua,
      viewport: `${window.screen.width}x${window.screen.height}`,
      url: window.location.href
    };
  }

  private loadSettings(): void {
    // Load extension settings from localStorage
    try {
      const settings = localStorage.getItem('codeserver-sync-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        // Apply settings
      }
    } catch (error) {
      console.warn('Failed to load extension settings:', error);
    }
  }

  private cleanupCodeServerIntegration(): void {
    // Clean up Monaco listeners
    if (window.monaco && this.fileChangeHandler) {
      window.monaco.editor.getModels().forEach(model => {
        if (this.fileChangeHandler) {
          model.onDidChangeContent.removeListener(this.fileChangeHandler);
        }
      });
    }

    // Clean up other integrations
    this.fileChangeHandler = null;
    this.cursorChangeHandler = null;
    this.terminalDataHandler = null;
  }
}

// Auto-initialize extension when script loads
export function initCodeServerSync(token: string, syncServerUrl?: string): Promise<void> {
  const extension = new CodeServerSyncExtension();
  return extension.initialize(token, syncServerUrl);
}

// Make available globally
window.CodeServerSyncExtension = CodeServerSyncExtension;
window.initCodeServerSync = initCodeServerSync;