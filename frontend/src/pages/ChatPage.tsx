import React from 'react';
import { Chat } from '../components/chat';

export const ChatPage: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-[calc(100vh-200px)]">
      <Chat />
    </div>
  );
};