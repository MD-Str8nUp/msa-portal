import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock documents data
const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Scout Handbook 2024',
    type: 'handbook',
    fileUrl: '/documents/handbook.pdf',
    uploadDate: new Date('2024-01-15'),
    uploadedBy: 'admin'
  },
  {
    id: 'doc-2',
    title: 'Safety Guidelines',
    type: 'safety',
    fileUrl: '/documents/safety.pdf',
    uploadDate: new Date('2024-02-01'),
    uploadedBy: 'admin'
  }
];

export async function GET(req: NextRequest) {
  // Check if database is disabled or in fallback mode
  if (process.env.DISABLE_DATABASE === 'true') {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    let documents = mockDocuments;
    if (type) {
      documents = mockDocuments.filter(doc => doc.type === type);
    }
    
    return Response.json(documents);
  }

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
    console.error('Error fetching documents, falling back to mock data:', error);
    // Return mock data instead of error
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    let documents = mockDocuments;
    if (type) {
      documents = mockDocuments.filter(doc => doc.type === type);
    }
    
    return Response.json(documents);
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
