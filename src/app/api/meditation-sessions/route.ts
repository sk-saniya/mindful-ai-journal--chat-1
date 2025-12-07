import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meditationSessions, session } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const sessions = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const userSession = sessions[0];
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
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single meditation session by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const sessions = await db.select()
        .from(meditationSessions)
        .where(
          and(
            eq(meditationSessions.id, parseInt(id)),
            eq(meditationSessions.userId, userId)
          )
        )
        .limit(1);

      if (sessions.length === 0) {
        return NextResponse.json(
          { error: 'Meditation session not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(sessions[0], { status: 200 });
    }

    // List meditation sessions with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const completedParam = searchParams.get('completed');

    let whereConditions = [eq(meditationSessions.userId, userId)];

    // Date range filtering
    if (startDate) {
      whereConditions.push(gte(meditationSessions.createdAt, startDate));
    }
    if (endDate) {
      // Add one day to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      whereConditions.push(lte(meditationSessions.createdAt, endDateTime.toISOString()));
    }

    // Type filtering
    if (type) {
      if (!['guided', 'breathing', 'mindfulness'].includes(type)) {
        return NextResponse.json(
          { error: 'Invalid type. Must be one of: guided, breathing, mindfulness', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      whereConditions.push(eq(meditationSessions.type, type));
    }

    // Completed filtering
    if (completedParam !== null) {
      const completedValue = completedParam === 'true';
      whereConditions.push(eq(meditationSessions.completed, completedValue ? 1 : 0));
    }

    const sessions = await db.select()
      .from(meditationSessions)
      .where(and(...whereConditions))
      .orderBy(desc(meditationSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const { duration, type, completed } = body;

    // Validate duration
    if (!duration || typeof duration !== 'number' || duration <= 0 || !Number.isInteger(duration)) {
      return NextResponse.json(
        { error: 'Duration is required and must be a positive integer', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    // Validate type
    if (!type) {
      return NextResponse.json(
        { error: 'Type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (!['guided', 'breathing', 'mindfulness'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be one of: guided, breathing, mindfulness', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Validate completed
    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Completed is required and must be a boolean', code: 'INVALID_COMPLETED' },
        { status: 400 }
      );
    }

    const newSession = await db.insert(meditationSessions)
      .values({
        userId,
        duration,
        type,
        completed: completed ? 1 : 0,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}