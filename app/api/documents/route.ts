import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    let documents;
    
    if (type) {
      documents = await prisma.document.findMany({
        where: { type },
        orderBy: { uploadDate: 'desc' }
      });
    } else {
      documents = await prisma.document.findMany({
        orderBy: { uploadDate: 'desc' }
      });
    }
    
    return Response.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const documentData = await req.json();
    
    if (!documentData.title || !documentData.fileUrl || !documentData.uploadedBy) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const document = await prisma.document.create({
      data: documentData
    });
    
    return Response.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return Response.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
