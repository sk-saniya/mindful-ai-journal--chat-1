import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sleepTracking, session } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
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

    return { id: userSession.userId };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
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

      const records = await db.select()
        .from(sleepTracking)
        .where(and(
          eq(sleepTracking.id, parseInt(id)),
          eq(sleepTracking.userId, user.id)
        ))
        .limit(1);

      if (records.length === 0) {
        return NextResponse.json({ 
          error: 'Record not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(records[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select()
      .from(sleepTracking)
      .where(eq(sleepTracking.userId, user.id));

    const conditions = [eq(sleepTracking.userId, user.id)];

    if (startDate) {
      if (!isValidDateFormat(startDate)) {
        return NextResponse.json({ 
          error: 'Invalid startDate format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT' 
        }, { status: 400 });
      }
      conditions.push(gte(sleepTracking.sleepDate, startDate));
    }

    if (endDate) {
      if (!isValidDateFormat(endDate)) {
        return NextResponse.json({ 
          error: 'Invalid endDate format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT' 
        }, { status: 400 });
      }
      conditions.push(lte(sleepTracking.sleepDate, endDate));
    }

    const results = await db.select()
      .from(sleepTracking)
      .where(and(...conditions))
      .orderBy(desc(sleepTracking.sleepDate))
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
    const user = await getCurrentUser(request);
    if (!user) {
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

    const { hoursSlept, quality, notes, sleepDate } = body;

    if (hoursSlept === undefined || hoursSlept === null) {
      return NextResponse.json({ 
        error: 'hoursSlept is required',
        code: 'MISSING_HOURS_SLEPT' 
      }, { status: 400 });
    }

    if (!Number.isInteger(hoursSlept) || hoursSlept <= 0) {
      return NextResponse.json({ 
        error: 'hoursSlept must be a positive integer',
        code: 'INVALID_HOURS_SLEPT' 
      }, { status: 400 });
    }

    if (quality === undefined || quality === null) {
      return NextResponse.json({ 
        error: 'quality is required',
        code: 'MISSING_QUALITY' 
      }, { status: 400 });
    }

    if (!Number.isInteger(quality) || quality < 1 || quality > 10) {
      return NextResponse.json({ 
        error: 'quality must be an integer between 1 and 10',
        code: 'INVALID_QUALITY' 
      }, { status: 400 });
    }

    if (!sleepDate) {
      return NextResponse.json({ 
        error: 'sleepDate is required',
        code: 'MISSING_SLEEP_DATE' 
      }, { status: 400 });
    }

    if (!isValidDateFormat(sleepDate)) {
      return NextResponse.json({ 
        error: 'sleepDate must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT' 
      }, { status: 400 });
    }

    const newRecord = await db.insert(sleepTracking)
      .values({
        userId: user.id,
        hoursSlept,
        quality,
        notes: notes ? String(notes).trim() : null,
        sleepDate,
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
    const user = await getCurrentUser(request);
    if (!user) {
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

    const existing = await db.select()
      .from(sleepTracking)
      .where(and(
        eq(sleepTracking.id, parseInt(id)),
        eq(sleepTracking.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { hoursSlept, quality, notes, sleepDate } = body;
    const updates: Record<string, any> = {};

    if (hoursSlept !== undefined) {
      if (!Number.isInteger(hoursSlept) || hoursSlept <= 0) {
        return NextResponse.json({ 
          error: 'hoursSlept must be a positive integer',
          code: 'INVALID_HOURS_SLEPT' 
        }, { status: 400 });
      }
      updates.hoursSlept = hoursSlept;
    }

    if (quality !== undefined) {
      if (!Number.isInteger(quality) || quality < 1 || quality > 10) {
        return NextResponse.json({ 
          error: 'quality must be an integer between 1 and 10',
          code: 'INVALID_QUALITY' 
        }, { status: 400 });
      }
      updates.quality = quality;
    }

    if (notes !== undefined) {
      updates.notes = notes ? String(notes).trim() : null;
    }

    if (sleepDate !== undefined) {
      if (!isValidDateFormat(sleepDate)) {
        return NextResponse.json({ 
          error: 'sleepDate must be in YYYY-MM-DD format',
          code: 'INVALID_DATE_FORMAT' 
        }, { status: 400 });
      }
      updates.sleepDate = sleepDate;
    }

    const updated = await db.update(sleepTracking)
      .set(updates)
      .where(and(
        eq(sleepTracking.id, parseInt(id)),
        eq(sleepTracking.userId, user.id)
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
    const user = await getCurrentUser(request);
    if (!user) {
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

    const existing = await db.select()
      .from(sleepTracking)
      .where(and(
        eq(sleepTracking.id, parseInt(id)),
        eq(sleepTracking.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(sleepTracking)
      .where(and(
        eq(sleepTracking.id, parseInt(id)),
        eq(sleepTracking.userId, user.id)
      ))
      .returning();

    return NextResponse.json({
      message: 'Sleep tracking entry deleted successfully',
      record: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}