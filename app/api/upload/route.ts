import { NextRequest, NextResponse } from 'next/server';
import { createResource } from '@/lib/actions/resources';

export async function POST(request: NextRequest) {
  console.log('Upload API called');
  
  try {
    const formData = await request.formData();
    console.log('Form data parsed');
    
    const files = formData.getAll('files') as File[];
    const agentId = formData.get('agentId') as string || 'general';

    console.log(`Received ${files.length} files for agent ${agentId}`);

    if (!files || files.length === 0) {
      console.log('No files received');
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);
        
        // Simple validation - accept text files and markdown
        const extension = file.name.toLowerCase().split('.').pop();
        const isValidFile = extension === 'txt' || extension === 'md' || extension === 'markdown';
        
        if (!isValidFile) {
          console.log(`Invalid file type: ${extension}`);
          results.push({
            filename: file.name,
            success: false,
            error: 'Unsupported file type. Only text files (.txt, .md) are accepted at the moment.'
          });
          continue;
        }

        // Read file content as text
        const text = await file.text();
        console.log(`File content length: ${text.length} characters`);

        // Create resource with file content
        const result = await createResource({ 
          content: `File: ${file.name}\n\n${text}`,
          agentId
        });

        console.log(`CreateResource result:`, result);

        // Check if result is successful
        if (typeof result === 'string' && result.length > 10) {
          results.push({
            filename: file.name,
            success: true,
            message: 'File processed and added to knowledge base successfully',
            id: result
          });
        } else {
          results.push({
            filename: file.name,
            success: false,
            error: `Error creating resource: ${result}`
          });
        }

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error during processing'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    const response = {
      message: `${successCount}/${totalCount} files processed successfully`,
      results
    };

    console.log('Upload response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('General error uploading files:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}