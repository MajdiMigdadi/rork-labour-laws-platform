import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContactMessage } from '@/types';

const CONTACT_MESSAGES_KEY = '@contact_messages';

export const [ContactProvider, useContact] = createContextHook(() => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACT_MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      }
    } catch (error) {
      console.error('Failed to load contact messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessages = async (newMessages: ContactMessage[]) => {
    try {
      await AsyncStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(newMessages));
      setMessages(newMessages);
    } catch (error) {
      console.error('Failed to save contact messages:', error);
    }
  };

  const sendMessage = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    userId?: string;
  }) => {
    const newMessage: ContactMessage = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'unread',
    };

    const updatedMessages = [newMessage, ...messages];
    await saveMessages(updatedMessages);
    return true;
  };

  const markAsRead = async (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, status: 'read' as const } : msg
    );
    await saveMessages(updatedMessages);
  };

  const replyToMessage = async (messageId: string, reply: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            status: 'replied' as const,
            adminReply: reply,
            repliedAt: new Date().toISOString(),
          }
        : msg
    );
    await saveMessages(updatedMessages);
  };

  const deleteMessage = async (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    await saveMessages(updatedMessages);
  };

  const getUnreadCount = () => {
    return messages.filter(msg => msg.status === 'unread').length;
  };

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    replyToMessage,
    deleteMessage,
    getUnreadCount,
  };
});
