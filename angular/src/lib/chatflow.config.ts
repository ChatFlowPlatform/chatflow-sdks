import { InjectionToken } from '@angular/core';

export interface ChatFlowConfig {
  apiUrl: string;
  signalrUrl?: string;
}

export const CHATFLOW_CONFIG = new InjectionToken<ChatFlowConfig>('CHATFLOW_CONFIG');
