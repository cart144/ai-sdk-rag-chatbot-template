const PDFParse = require('pdf-parse');

export interface ProcessedFile {
  content: string;
  filename: string;
  type: 'pdf' | 'markdown';
}

export async function processPDF(buffer: Buffer, filename: string): Promise<ProcessedFile> {
  try {
    const data = await PDFParse(buffer);
    return {
      content: data.text,
      filename,
      type: 'pdf'
    };
  } catch (error) {
    throw new Error(`Error processing PDF ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function processMarkdown(content: string, filename: string): ProcessedFile {
  // Remove markdown syntax for better text processing
  const cleanedContent = content
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list bullets
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/^\s*>\s+/gm, '') // Remove blockquotes
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();

  return {
    content: cleanedContent,
    filename,
    type: 'markdown'
  };
}

export function isValidFileType(filename: string): boolean {
  const extension = filename.toLowerCase().split('.').pop();
  return extension === 'pdf' || extension === 'md' || extension === 'markdown';
}

export function getFileType(filename: string): 'pdf' | 'markdown' | null {
  const extension = filename.toLowerCase().split('.').pop();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'md' || extension === 'markdown') return 'markdown';
  return null;
}