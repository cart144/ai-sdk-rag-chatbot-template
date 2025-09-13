'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings as embeddingsTable } from '../db/schema/embeddings';
import { eq, desc, and } from 'drizzle-orm';

export const createResource = async (input: NewResourceParams & { agentId?: string; category?: string }) => {
  try {
    console.log('createResource called with input:', input);
    const { content, agentId = 'general', category = 'general' } = input;
    const validatedInput = insertResourceSchema.parse({ content, agentId, category });
    console.log('Validated input:', validatedInput);

    const [resource] = await db
      .insert(resources)
      .values({ content: validatedInput.content, agentId, category })
      .returning();
    console.log('Resource created with ID:', resource.id);

    const embeddings = await generateEmbeddings(content);
    console.log('Generated embeddings count:', embeddings.length);
    
    const embeddingResult = await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        agentId,
        ...embedding,
      })),
    );
    console.log('Embeddings inserted:', embeddingResult);

    return resource.id;
  } catch (error) {
    console.error('Error in createResource:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};

export const getResourcesByAgent = async (agentId: string) => {
  try {
    const agentResources = await db
      .select()
      .from(resources)
      .where(eq(resources.agentId, agentId))
      .orderBy(desc(resources.createdAt));
    
    return agentResources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
};

export const deleteResource = async (resourceId: string) => {
  try {
    // Delete embeddings first
    await db
      .delete(embeddingsTable)
      .where(eq(embeddingsTable.resourceId, resourceId));
    
    // Then delete the resource
    await db
      .delete(resources)
      .where(eq(resources.id, resourceId));
    
    return 'Resource deleted successfully.';
  } catch (error) {
    console.error('Error deleting resource:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error deleting resource.';
  }
};

export const updateResource = async (resourceId: string, content: string) => {
  try {
    console.log('updateResource called with ID:', resourceId, 'content length:', content.length);
    
    // Update the resource content
    const [updatedResource] = await db
      .update(resources)
      .set({ content, updatedAt: new Date() })
      .where(eq(resources.id, resourceId))
      .returning();
    
    if (!updatedResource) {
      throw new Error('Resource not found');
    }
    
    // Delete old embeddings
    await db
      .delete(embeddingsTable)
      .where(eq(embeddingsTable.resourceId, resourceId));
    
    // Generate new embeddings
    const embeddings = await generateEmbeddings(content);
    console.log('Generated new embeddings count:', embeddings.length);
    
    // Insert new embeddings
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: updatedResource.id,
        agentId: updatedResource.agentId,
        ...embedding,
      })),
    );
    
    console.log('Resource updated successfully:', updatedResource.id);
    return updatedResource.id;
  } catch (error) {
    console.error('Error updating resource:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error updating resource.';
  }
};

export const findResourceByCategory = async (category: string, agentId: string) => {
  try {
    const result = await db
      .select()
      .from(resources)
      .where(and(eq(resources.category, category), eq(resources.agentId, agentId)))
      .orderBy(desc(resources.updatedAt))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error finding resource by category:', error);
    return null;
  }
};

export const upsertResource = async (input: NewResourceParams & { agentId?: string; category?: string }) => {
  try {
    const { content, agentId = 'general', category = 'general' } = input;
    console.log('upsertResource called with category:', category, 'agentId:', agentId);
    
    // Look for existing resource in this category for this agent
    const existingResource = await findResourceByCategory(category, agentId);
    
    if (existingResource) {
      console.log('Found existing resource, updating:', existingResource.id);
      return await updateResource(existingResource.id, content);
    } else {
      console.log('No existing resource found, creating new one');
      return await createResource({ content, agentId, category });
    }
  } catch (error) {
    console.error('Error in upsertResource:', error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error saving resource.';
  }
};