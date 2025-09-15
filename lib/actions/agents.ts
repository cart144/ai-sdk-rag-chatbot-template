'use server';

import { db } from '../db';
import { agentConfigs, conversations, messages, insertAgentConfigSchema, insertConversationSchema, insertMessageSchema, type NewAgentConfigParams, type NewConversationParams, type NewMessageParams } from '../db/schema/agents';
import { eq, desc, count, and } from 'drizzle-orm';
import { AGENTS } from '../agents/config';

// Agent Configuration Actions
export const saveAgentConfig = async (input: NewAgentConfigParams) => {
  try {
    const { agentId, systemPrompt, name, avatar } = insertAgentConfigSchema.parse(input);

    // Check if config exists
    const existingConfig = await db
      .select()
      .from(agentConfigs)
      .where(eq(agentConfigs.agentId, agentId))
      .limit(1);

    if (existingConfig.length > 0) {
      // Update existing config
      const updateData: any = { 
        systemPrompt,
        updatedAt: new Date()
      };
      
      if (name !== undefined) updateData.name = name;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      await db
        .update(agentConfigs)
        .set(updateData)
        .where(eq(agentConfigs.agentId, agentId));
    } else {
      // Create new config
      await db
        .insert(agentConfigs)
        .values({ agentId, systemPrompt, name, avatar });
    }

    return 'Agent configuration saved successfully.';
  } catch (error) {
    console.error('Error saving agent config:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error saving agent configuration.';
  }
};

export const getAgentConfig = async (agentId: string) => {
  try {
    const config = await db
      .select()
      .from(agentConfigs)
      .where(eq(agentConfigs.agentId, agentId))
      .limit(1);

    if (config.length > 0) {
      return config[0];
    }

    // Return default config if none exists
    const agent = AGENTS.find(a => a.id === agentId);
    if (agent) {
      return {
        id: '',
        agentId,
        systemPrompt: agent.systemPrompt,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting agent config:', error);
    return null;
  }
};

// Conversation Actions
export const createConversation = async (input: NewConversationParams) => {
  try {
    const { title, agentId } = insertConversationSchema.parse(input);

    const [conversation] = await db
      .insert(conversations)
      .values({ title, agentId })
      .returning();

    return conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
};

export const getConversationsByAgent = async (agentId: string) => {
  try {
    const convs = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        agentId: conversations.agentId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        messageCount: count(messages.id)
      })
      .from(conversations)
      .leftJoin(messages, eq(conversations.id, messages.conversationId))
      .where(eq(conversations.agentId, agentId))
      .groupBy(conversations.id, conversations.title, conversations.agentId, conversations.createdAt, conversations.updatedAt)
      .orderBy(desc(conversations.updatedAt));

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      convs.map(async (conv) => {
        const lastMessage = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...conv,
          lastMessage: lastMessage.length > 0 ? lastMessage[0].content : 'No messages',
          timestamp: conv.updatedAt
        };
      })
    );

    return conversationsWithLastMessage;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    await db
      .delete(conversations)
      .where(eq(conversations.id, conversationId));

    return 'Conversation deleted successfully.';
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return 'Error deleting conversation.';
  }
};

// Message Actions
export const addMessage = async (input: NewMessageParams) => {
  try {
    const { conversationId, role, content } = insertMessageSchema.parse(input);

    const [message] = await db
      .insert(messages)
      .values({ conversationId, role, content })
      .returning();

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return message;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message');
  }
};

export const getConversationMessages = async (conversationId: string) => {
  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return msgs.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt
    }));
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
};

export const updateConversationTitle = async (conversationId: string, title: string) => {
  try {
    await db
      .update(conversations)
      .set({ 
        title,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId));

    return 'Conversation title updated successfully.';
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return 'Error updating conversation title.';
  }
};