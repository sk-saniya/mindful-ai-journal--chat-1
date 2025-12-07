import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stressTracking, session } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const sessionRecord = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    const userSession = sessionRecord[0];
    const now = new Date();
    
    if (userSession.expiresAt < now) {
      return null;
    }

    return userSession.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(stressTracking)
        .where(and(
          eq(stressTracking.id, parseInt(id)),
          eq(stressTracking.userId, userId)
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Record not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select()
      .from(stressTracking)
      .where(eq(stressTracking.userId, userId));

    if (startDate || endDate) {
      const conditions = [eq(stressTracking.userId, userId)];
      
      if (startDate) {
        conditions.push(gte(stressTracking.createdAt, startDate));
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        conditions.push(lte(stressTracking.createdAt, endDateTime.toISOString()));
      }
      
      query = db.select()
        .from(stressTracking)
        .where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(stressTracking.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
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

    const { stressLevel, notes } = body;

    if (stressLevel === undefined || stressLevel === null) {
      return NextResponse.json({ 
        error: 'Stress level is required',
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    const stressLevelInt = parseInt(stressLevel);
    if (isNaN(stressLevelInt) || stressLevelInt < 1 || stressLevelInt > 10) {
      return NextResponse.json({ 
        error: 'Stress level must be an integer between 1 and 10',
        code: 'INVALID_STRESS_LEVEL' 
      }, { status: 400 });
    }

    const newRecord = await db.insert(stressTracking)
      .values({
        userId,
        stressLevel: stressLevelInt,
        notes: notes ? notes.trim() : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
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

    const existingRecord = await db.select()
      .from(stressTracking)
      .where(and(
        eq(stressTracking.id, parseInt(id)),
        eq(stressTracking.userId, userId)
      ))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { stressLevel, notes } = body;
    const updates: any = {};

    if (stressLevel !== undefined && stressLevel !== null) {
      const stressLevelInt = parseInt(stressLevel);
      if (isNaN(stressLevelInt) || stressLevelInt < 1 || stressLevelInt > 10) {
        return NextResponse.json({ 
          error: 'Stress level must be an integer between 1 and 10',
          code: 'INVALID_STRESS_LEVEL' 
        }, { status: 400 });
      }
      updates.stressLevel = stressLevelInt;
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    const updated = await db.update(stressTracking)
      .set(updates)
      .where(and(
        eq(stressTracking.id, parseInt(id)),
        eq(stressTracking.userId, userId)
      ))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
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

    const existingRecord = await db.select()
      .from(stressTracking)
      .where(and(
        eq(stressTracking.id, parseInt(id)),
        eq(stressTracking.userId, userId)
      ))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(stressTracking)
      .where(and(
        eq(stressTracking.id, parseInt(id)),
        eq(stressTracking.userId, userId)
      ))
      .returning();

    return NextResponse.json({
      message: 'Stress tracking entry deleted successfully',
      record: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}