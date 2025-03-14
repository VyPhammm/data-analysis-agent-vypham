import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import config from '../config';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  data?: any[];
  cleanedSQL?: string;
}

interface ApiResponse {
  data?: any[] | Record<string, any>;
  message?: string;
  cleanedSQL?: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  const [sqlContent, setSqlContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callWebhook = async (userMessage: string): Promise<ApiResponse> => {
    try {
      const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      console.log('Making request to:', config.WEBHOOK_URL);
      console.log('With headers:', {
        'Content-Type': 'application/json',
        [config.AUTH_HEADER.name]: config.AUTH_HEADER.value
      });
      console.log('And body:', {
        user_prompt: userMessage,
        date_time: currentDateTime
      });

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
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log('Received response:', jsonResponse);
      return jsonResponse as ApiResponse;
    } catch (error) {
      console.error('API call failed:', error);
      
      // For demo purposes, return mock data if the API call fails
      return {
        data: [
        ]
      };
    }
  };

  const processApiResponse = (response: ApiResponse): ApiResponse => {
    console.log('Processing API response:', response);
    
    // Case 1: If response.data is an array, use it directly
    if (Array.isArray(response.data)) {
      console.log('Response.data is already an array:', response.data);
      return response;
    }
    
    // Case 2: If response is an array, use it as data
    if (Array.isArray(response)) {
      console.log('Response itself is an array:', response);
      return { data: response };
    }
    
    // Case 3: If response.data is an object but not an array
    if (response && !Array.isArray(response.data) && typeof response.data === 'object' && response.data !== null) {
      console.log('Response.data is an object, converting to array');
      const dataArray: any[] = [];
      const dataObject = response.data as Record<string, any>;
      
      for (const key in dataObject) {
        if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
          dataArray.push(dataObject[key]);
        }
      }
      return { ...response, data: dataArray };
    }
    
    // Case 4: If nothing else matches, check if the response itself has specific properties
    if (response && typeof response === 'object') {
      const keys = Object.keys(response);
      if (keys.some(key => 
        key.startsWith('shop_item_id') || 
        key === '0' || 
        key === '1' || 
        key === '2' || 
        key === 'app_name'
      )) {
        console.log('Response appears to contain direct data items');
        return { data: Array.isArray(response) ? response : [response] };
      }
    }
    
    // Case 5: If response has a data property that's not an array but has a value
    if (response && response.data !== undefined && !Array.isArray(response.data)) {
      console.log('Response has non-array data, wrapping in array');
      return { ...response, data: [response.data] };
    }
    
    console.log('Could not process response into usable data:', response);
    return response;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processing your request...',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Call API or simulate response
      let response = await callWebhook(userMessage.text);
      
      // Process the response to ensure data is in the correct format
      response = processApiResponse(response);
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

      // Add AI response with data
      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: response.message || userMessage.text,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: response.data as any[],
        cleanedSQL: response.cleanedSQL
      };

      setMessages(prev => [...prev, aiResponse]);
      
      console.log('AI response with data:', aiResponse);
      console.log('Processed data:', response.data);

      setSqlContent(aiResponse.cleanedSQL || '');
    } catch (error) {
      console.error('Error handling message:', error);
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat?')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  };

  const renderTable = (data: any[]) => {
    if (!data || data.length === 0) {
      console.log('No data to render table');
      return null;
    }

    console.log('Rendering table with data:', data);

    // If there's only one item, use it directly
    const dataToRender = data;
    
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {Object.keys(dataToRender[0]).map((key) => (
                <th
                  key={key}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-zinc-700"
                >
                  {key.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataToRender.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? '' : 'bg-zinc-800/50'}>
                {Object.keys(dataToRender[0]).map((key) => (
                  <td key={key} className="px-4 py-2 text-sm text-gray-300 border-b border-zinc-700">
                    {String(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleApiResponse = (message: Message) => {
    if (Array.isArray(message.data) && message.data.length > 0) {
      // Check if the first item has a cleanedSQL property
      const hasCleanedSQL = message.data[0]?.cleanedSQL !== undefined;
      const cleanedSQL = hasCleanedSQL ? message.data[0]?.cleanedSQL || '' : '';
      
      // If first item has cleanedSQL, use the rest as table data, otherwise use all items
      const tableData = hasCleanedSQL ? message.data.slice(1) : message.data;

      console.log('Rendering table with data from message:', tableData);
      return (
        <>
          {tableData.length > 0 && renderTable(tableData)}
          {cleanedSQL && (
            <button
              onClick={() => {
                setSqlContent(cleanedSQL);
                setShowSQL(true);
              }}
              className="mt-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show SQL
            </button>
          )}
        </>
      );
    }
    console.log('No valid data to render from message:', message);
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
        <button 
          onClick={clearChat}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[76px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <Avatar className="w-8 h-8 bg-zinc-700">
                {message.sender === 'user' ? (
                  <AvatarFallback>U</AvatarFallback>
                ) : (
                  <AvatarFallback>AI</AvatarFallback>
                )}
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-gray-200'
                }`}
              >
                <p>{message.text}</p>
                {message.sender === 'ai' && handleApiResponse(message)}
                <span className="text-xs text-gray-400 mt-1 block">
                  {message.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-[calc(100% - 2rem)] mx-auto max-w-[calc(100vw-2rem)]" style={{ maxWidth: 'inherit', bottom: '1rem' }}>
        <form
          onSubmit={handleSendMessage}
          className="border border-zinc-700 rounded-lg p-2 bg-zinc-900 shadow-lg mx-4"
        >
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Write a message..."
              disabled={isLoading}
              className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-blue-800"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {showSQL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-4 rounded-lg" style={{ width: '50%' }}>
            <h3 className="text-lg font-semibold text-white">Executed SQL</h3>
            <pre className="mt-2 p-2 bg-gray-700 text-white rounded whitespace-pre-wrap break-words">
              {sqlContent || 'No SQL available'}
            </pre>
            <button
              onClick={() => setShowSQL(false)}
              className="mt-4 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 