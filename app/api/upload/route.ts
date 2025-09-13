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
        { error: 'Nessun file caricato' },
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
            error: 'Tipo di file non supportato. Solo file di testo (.txt, .md) sono accettati al momento.'
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
            message: 'File processato e aggiunto alla knowledge base con successo',
            id: result
          });
        } else {
          results.push({
            filename: file.name,
            success: false,
            error: `Errore nella creazione della risorsa: ${result}`
          });
        }

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto durante il processamento'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    const response = {
      message: `${successCount}/${totalCount} file processati con successo`,
      results
    };

    console.log('Upload response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore generale nell\'upload dei file:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}