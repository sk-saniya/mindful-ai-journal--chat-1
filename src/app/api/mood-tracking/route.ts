import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { moodTracking, session } from '@/db/schema';
import { eq, and, gt, gte, lte, desc } from 'drizzle-orm';

const VALID_MOOD_LABELS = ["anxious", "calm", "happy", "sad", "stressed", "peaceful", "energetic", "tired"] as const;

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
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
    const auth = await authenticateRequest(request);
    if (!auth) {
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

      const entries = await db.select()
        .from(moodTracking)
        .where(
          and(
            eq(moodTracking.id, parseInt(id)),
            eq(moodTracking.userId, auth.userId)
          )
        )
        .limit(1);

      if (entries.length === 0) {
        return NextResponse.json({ 
          error: 'Mood entry not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(entries[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const moodLabel = searchParams.get('moodLabel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [eq(moodTracking.userId, auth.userId)];

    if (moodLabel) {
      if (!VALID_MOOD_LABELS.includes(moodLabel as any)) {
        return NextResponse.json({ 
          error: `Invalid mood label. Must be one of: ${VALID_MOOD_LABELS.join(', ')}`,
          code: 'INVALID_MOOD_LABEL' 
        }, { status: 400 });
      }
      conditions.push(eq(moodTracking.moodLabel, moodLabel));
    }

    if (startDate) {
      conditions.push(gte(moodTracking.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(moodTracking.createdAt, endDate));
    }

    const entries = await db.select()
      .from(moodTracking)
      .where(and(...conditions))
      .orderBy(desc(moodTracking.createdAt))
      .limit(limit)
      .offset(offset);

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
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { moodValue, moodLabel, notes } = body;

    if (moodValue === undefined || moodValue === null) {
      return NextResponse.json({ 
        error: 'moodValue is required',
        code: 'MISSING_MOOD_VALUE' 
      }, { status: 400 });
    }

    if (!moodLabel) {
      return NextResponse.json({ 
        error: 'moodLabel is required',
        code: 'MISSING_MOOD_LABEL' 
      }, { status: 400 });
    }

    const parsedMoodValue = parseInt(moodValue);
    if (isNaN(parsedMoodValue) || parsedMoodValue < 1 || parsedMoodValue > 10) {
      return NextResponse.json({ 
        error: 'moodValue must be an integer between 1 and 10',
        code: 'INVALID_MOOD_VALUE' 
      }, { status: 400 });
    }

    if (!VALID_MOOD_LABELS.includes(moodLabel)) {
      return NextResponse.json({ 
        error: `Invalid mood label. Must be one of: ${VALID_MOOD_LABELS.join(', ')}`,
        code: 'INVALID_MOOD_LABEL' 
      }, { status: 400 });
    }

    const newEntry = await db.insert(moodTracking)
      .values({
        userId: auth.userId,
        moodValue: parsedMoodValue,
        moodLabel: moodLabel,
        notes: notes ? notes.trim() : null,
        createdAt: new Date().toISOString()
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
    const auth = await authenticateRequest(request);
    if (!auth) {
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
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingEntries = await db.select()
      .from(moodTracking)
      .where(
        and(
          eq(moodTracking.id, parseInt(id)),
          eq(moodTracking.userId, auth.userId)
        )
      )
      .limit(1);

    if (existingEntries.length === 0) {
      return NextResponse.json({ 
        error: 'Mood entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { moodValue, moodLabel, notes } = body;
    const updates: any = {};

    if (moodValue !== undefined) {
      const parsedMoodValue = parseInt(moodValue);
      if (isNaN(parsedMoodValue) || parsedMoodValue < 1 || parsedMoodValue > 10) {
        return NextResponse.json({ 
          error: 'moodValue must be an integer between 1 and 10',
          code: 'INVALID_MOOD_VALUE' 
        }, { status: 400 });
      }
      updates.moodValue = parsedMoodValue;
    }

    if (moodLabel !== undefined) {
      if (!VALID_MOOD_LABELS.includes(moodLabel)) {
        return NextResponse.json({ 
          error: `Invalid mood label. Must be one of: ${VALID_MOOD_LABELS.join(', ')}`,
          code: 'INVALID_MOOD_LABEL' 
        }, { status: 400 });
      }
      updates.moodLabel = moodLabel;
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    const updatedEntry = await db.update(moodTracking)
      .set(updates)
      .where(
        and(
          eq(moodTracking.id, parseInt(id)),
          eq(moodTracking.userId, auth.userId)
        )
      )
      .returning();

    if (updatedEntry.length === 0) {
      return NextResponse.json({ 
        error: 'Mood entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

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
    const auth = await authenticateRequest(request);
    if (!auth) {
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

    const existingEntries = await db.select()
      .from(moodTracking)
      .where(
        and(
          eq(moodTracking.id, parseInt(id)),
          eq(moodTracking.userId, auth.userId)
        )
      )
      .limit(1);

    if (existingEntries.length === 0) {
      return NextResponse.json({ 
        error: 'Mood entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deletedEntry = await db.delete(moodTracking)
      .where(
        and(
          eq(moodTracking.id, parseInt(id)),
          eq(moodTracking.userId, auth.userId)
        )
      )
      .returning();

    return NextResponse.json({ 
      message: 'Mood entry deleted successfully',
      entry: deletedEntry[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}