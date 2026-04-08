import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export interface ChatFlowConfig {
  workspace: string;
  apiUrl?: string;
  signalrUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-left' | 'bottom-right';
  primaryColor?: string;
  greeting?: string;
  avatar?: string;
  autoOpen?: boolean;
}

interface Message {
  id: string;
  content: string;
  sender: 'visitor' | 'agent' | 'system';
  createdAt: string;
}

export default class ChatFlowWidget {
  private config: Required<ChatFlowConfig>;
  private container: HTMLElement | null = null;
  private isOpen = false;
  private conversationId: string | null = null;
  private hubConnection: HubConnection | null = null;
  private messages: Message[] = [];

  constructor(config: ChatFlowConfig) {
    this.config = {
      workspace: config.workspace,
      apiUrl: config.apiUrl || 'https://api.chatflow.com',
      signalrUrl: config.signalrUrl || 'https://api.chatflow.com/hubs/chat',
      theme: config.theme || 'light',
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#007bff',
      greeting: config.greeting || 'Hi! How can we help you today?',
      avatar: config.avatar || '',
      autoOpen: config.autoOpen || false
    };

    this.init();
  }

  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  private render(): void {
    this.injectStyles();
    this.createContainer();
    this.attachEventListeners();

    if (this.config.autoOpen) {
      this.open();
    }
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .chatflow-widget {
        position: fixed;
        ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .chatflow-bubble {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .chatflow-bubble:hover {
        transform: scale(1.1);
      }

      .chatflow-bubble svg {
        width: 28px;
        height: 28px;
        fill: white;
      }

      .chatflow-window {
        display: none;
        position: fixed;
        ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 100px;
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        flex-direction: column;
        overflow: hidden;
      }

      .chatflow-window.open {
        display: flex;
      }

      .chatflow-header {
        background: ${this.config.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .chatflow-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chatflow-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
      }

      .chatflow-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chatflow-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chatflow-message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        word-wrap: break-word;
      }

      .chatflow-message.visitor {
        align-self: flex-end;
        background: ${this.config.primaryColor};
        color: white;
      }

      .chatflow-message.agent {
        align-self: flex-start;
        background: #f0f0f0;
        color: #333;
      }

      .chatflow-input-container {
        padding: 16px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
      }

      .chatflow-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
      }

      .chatflow-input:focus {
        border-color: ${this.config.primaryColor};
      }

      .chatflow-send {
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chatflow-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .chatflow-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.className = 'chatflow-widget';
    this.container.innerHTML = `
      <div class="chatflow-bubble" id="chatflow-bubble">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <div class="chatflow-window" id="chatflow-window">
        <div class="chatflow-header">
          <div class="chatflow-header-info">
            ${this.config.avatar ? `<img src="${this.config.avatar}" class="chatflow-avatar" alt="Support">` : '<div class="chatflow-avatar"></div>'}
            <div>
              <div style="font-weight: 600;">Support Team</div>
              <div style="font-size: 12px; opacity: 0.9;">Usually replies in minutes</div>
            </div>
          </div>
          <button class="chatflow-close" id="chatflow-close">&times;</button>
        </div>
        <div class="chatflow-messages" id="chatflow-messages">
          <div class="chatflow-message agent">${this.config.greeting}</div>
        </div>
        <div class="chatflow-input-container">
          <input type="text" class="chatflow-input" id="chatflow-input" placeholder="Type your message...">
          <button class="chatflow-send" id="chatflow-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
  }

  private attachEventListeners(): void {
    const bubble = document.getElementById('chatflow-bubble');
    const closeBtn = document.getElementById('chatflow-close');
    const input = document.getElementById('chatflow-input') as HTMLInputElement;
    const sendBtn = document.getElementById('chatflow-send');

    bubble?.addEventListener('click', () => this.toggle());
    closeBtn?.addEventListener('click', () => this.close());
    sendBtn?.addEventListener('click', () => this.sendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  public open(): void {
    const window = document.getElementById('chatflow-window');
    if (window) {
      window.classList.add('open');
      this.isOpen = true;
      
      if (!this.conversationId) {
        this.startConversation();
      }
    }
  }

  public close(): void {
    const window = document.getElementById('chatflow-window');
    if (window) {
      window.classList.remove('open');
      this.isOpen = false;
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private async startConversation(): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: this.config.workspace,
          metadata: {
            page: window.location.href,
            userAgent: navigator.userAgent
          }
        })
      });

      const data = await response.json();
      this.conversationId = data.id;
      
      await this.connectSignalR();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }

  private async connectSignalR(): Promise<void> {
    if (!this.conversationId) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.config.signalrUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      this.addMessage(message);
    });

    try {
      await this.hubConnection.start();
      await this.hubConnection.invoke('JoinConversation', this.conversationId);
    } catch (error) {
      console.error('SignalR connection failed:', error);
    }
  }

  private async sendMessage(): Promise<void> {
    const input = document.getElementById('chatflow-input') as HTMLInputElement;
    const content = input.value.trim();

    if (!content || !this.conversationId) return;

    try {
      const response = await fetch(`${this.config.apiUrl}/api/conversations/${this.conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'text' })
      });

      const message = await response.json();
      this.addMessage(message);
      input.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  private addMessage(message: Message): void {
    const messagesContainer = document.getElementById('chatflow-messages');
    if (!messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chatflow-message ${message.sender}`;
    messageEl.textContent = message.content;
    messagesContainer.appendChild(messageEl);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  public destroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

// Auto-init if config is in window
if (typeof window !== 'undefined') {
  (window as any).ChatFlowWidget = ChatFlowWidget;
  
  // Check for inline config
  const scripts = document.querySelectorAll('script[data-chatflow]');
  if (scripts.length > 0) {
    const workspace = scripts[0].getAttribute('data-chatflow');
    if (workspace) {
      new ChatFlowWidget({ workspace });
    }
  }
}
