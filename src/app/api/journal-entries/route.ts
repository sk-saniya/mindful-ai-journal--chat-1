import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { journalEntries, session } from '@/db/schema';
import { eq, like, or, and, gt } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const sessions = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const userSession = sessions[0];
    
    if (new Date(userSession.expiresAt) <= new Date()) {
      return null;
    }

    return { userId: userSession.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const entry = await db.select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.id, parseInt(id)),
          eq(journalEntries.userId, user.userId)
        ))
        .limit(1);

      if (entry.length === 0) {
        return NextResponse.json({ 
          error: 'Journal entry not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(entry[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.userId));

    if (search) {
      query = db.select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.userId, user.userId),
          or(
            like(journalEntries.title, `%${search}%`),
            like(journalEntries.content, `%${search}%`)
          )
        ));
    }

    const entries = await query
      .limit(limit)
      .offset(offset)
      .orderBy(journalEntries.createdAt);

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { title, content } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: 'Title is required and must be a non-empty string',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ 
        error: 'Content is required and must be a non-empty string',
        code: 'MISSING_CONTENT' 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newEntry = await db.insert(journalEntries)
      .values({
        userId: user.userId,
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const existingEntry = await db.select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.id, parseInt(id)),
        eq(journalEntries.userId, user.userId)
      ))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json({ 
        error: 'Journal entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { title, content } = body;
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ 
          error: 'Title must be a non-empty string',
          code: 'INVALID_TITLE' 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim() === '') {
        return NextResponse.json({ 
          error: 'Content must be a non-empty string',
          code: 'INVALID_CONTENT' 
        }, { status: 400 });
      }
      updates.content = content.trim();
    }

    const updatedEntry = await db.update(journalEntries)
      .set(updates)
      .where(and(
        eq(journalEntries.id, parseInt(id)),
        eq(journalEntries.userId, user.userId)
      ))
      .returning();

    return NextResponse.json(updatedEntry[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const existingEntry = await db.select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.id, parseInt(id)),
        eq(journalEntries.userId, user.userId)
      ))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json({ 
        error: 'Journal entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deletedEntry = await db.delete(journalEntries)
      .where(and(
        eq(journalEntries.id, parseInt(id)),
        eq(journalEntries.userId, user.userId)
      ))
      .returning();

    return NextResponse.json({
      message: 'Journal entry deleted successfully',
      deleted: deletedEntry[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}