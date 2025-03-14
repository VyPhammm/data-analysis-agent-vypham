import config from '../../config';
import { Message, ApiResponse } from '../types';

export class ChatService {
  static async sendMessage(userMessage: string): Promise<ApiResponse> {
    try {
      const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      headers[config.AUTH_HEADER.name] = config.AUTH_HEADER.value;

      const response = await Promise.race([
        fetch(config.WEBHOOK_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            user_prompt: userMessage,
            date_time: currentDateTime
          })
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 300000)
        )
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      return this.processApiResponse(jsonResponse);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  private static processApiResponse(response: any): ApiResponse {
    if (Array.isArray(response.data)) {
      return response;
    }
    
    if (Array.isArray(response)) {
      return { data: response };
    }
    
    if (response && !Array.isArray(response.data) && typeof response.data === 'object' && response.data !== null) {
      const dataArray: any[] = [];
      const dataObject = response.data as Record<string, any>;
      
      for (const key in dataObject) {
        if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
          dataArray.push(dataObject[key]);
        }
      }
      return { ...response, data: dataArray };
    }
    
    if (response && typeof response === 'object') {
      const keys = Object.keys(response);
      if (keys.some(key => 
        key.startsWith('shop_item_id') || 
        key === '0' || 
        key === '1' || 
        key === '2' || 
        key === 'app_name'
      )) {
        return { data: Array.isArray(response) ? response : [response] };
      }
    }
    
    if (response && response.data !== undefined && !Array.isArray(response.data)) {
      return { ...response, data: [response.data] };
    }
    
    return response;
  }
} 