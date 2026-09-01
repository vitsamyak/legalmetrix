import { supabase } from './supabase';

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id?: string;
  conversation_id?: string;
  role: 'user' | 'model';
  content: string;
  created_at?: string;
}

// Keep a local history of the conversation for the widget (fallback)
let localHistory: ChatMessage[] = [];

export const initializeChat = () => {
  localHistory = [];
};

export const fetchConversations = async (): Promise<ChatConversation[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data || [];
};

export const fetchMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data || [];
};

export const createConversation = async (title: string): Promise<ChatConversation | null> => {
  if (!supabase) return null;
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) return null;

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert([{ title, user_id: userAuth.user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
  return data;
};

export const saveMessage = async (conversationId: string, role: 'user' | 'model', content: string) => {
  if (!supabase) return null;
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) return null;

  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ conversation_id: conversationId, user_id: userAuth.user.id, role, content }])
    .select()
    .single();

  if (error) {
    console.error("Error saving message:", error);
  }
  return data;
};

export const sendMessageToBot = async (
  message: string, 
  currentPath: string, 
  conversationId?: string | null,
  history: ChatMessage[] = []
): Promise<{ responseText: string, conversationId: string | null }> => {
  try {
    if (!supabase) {
      return { responseText: "Supabase client is not initialized.", conversationId: conversationId || null };
    }

    let activeConvId = conversationId || null;
    let actualHistory = history.length > 0 ? history : localHistory;

    // Create conversation if none exists
    if (!activeConvId) {
      const generatedTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      const newConv = await createConversation(generatedTitle);
      if (newConv) {
        activeConvId = newConv.id;
      }
    }

    if (activeConvId) {
      // Save user message to DB
      await saveMessage(activeConvId, 'user', message);
    }

    // Call the Edge Function via Supabase
    const { data, error } = await supabase.functions.invoke('chatbot-proxy', {
      body: {
        message,
        history: actualHistory,
        currentPath
      }
    });

    if (error) {
      console.error("Error from Edge Function:", error);
      return { responseText: "I apologize, but I encountered an error while processing your request.", conversationId: activeConvId };
    }

    if (data && data.response) {
      if (activeConvId) {
        // Save model message to DB
        await saveMessage(activeConvId, 'model', data.response);
      }
      
      // Update local history as fallback for widget
      if (!conversationId) {
        localHistory.push({ role: 'user', content: message });
        localHistory.push({ role: 'model', content: data.response });
      }

      return { responseText: data.response, conversationId: activeConvId };
    }
    
    return { responseText: "I received an unexpected response format. Please try again.", conversationId: activeConvId };
  } catch (error) {
    console.error("Error communicating with AI Proxy:", error);
    return { responseText: "I apologize, but I encountered an error while processing your request.", conversationId: conversationId || null };
  }
};

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId);
    
  if (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }
  return true;
};

export const renameConversation = async (conversationId: string, title: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('chat_conversations')
    .update({ title })
    .eq('id', conversationId);
    
  if (error) {
    console.error("Error renaming conversation:", error);
    return false;
  }
  return true;
};
