import React from 'react';
import { Message } from '../lib/types';
import { MessageBubble } from './MessageBubble';
import { DataTable } from './DataTable';

interface MessageListProps {
  messages: Message[];
  onShowSQL?: (sql: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onShowSQL }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col">
          <MessageBubble message={message} onShowSQL={onShowSQL} />
          {message.data && message.data.length > 0 && (
            <div className="mt-2">
              <DataTable data={message.data} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 