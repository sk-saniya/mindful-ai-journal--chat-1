import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { breathingSessions, session } from '@/db/schema';
import { eq, and, gt, gte, lte, desc } from 'drizzle-orm';

// Authenticate user via bearer token
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const userSession = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (userSession.length === 0) {
      return null;
    }

    const sessionData = userSession[0];
    
    // Check if session is expired
    if (sessionData.expiresAt < new Date()) {
      return null;
    }

    return { userId: sessionData.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Validate technique enum
function isValidTechnique(technique: string): boolean {
  return ['box', '4-7-8', 'calm'].includes(technique);
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const stats = searchParams.get('stats');

    // Handle statistics request
    if (stats === 'true') {
      const allSessions = await db.select()
        .from(breathingSessions)
        .where(eq(breathingSessions.userId, auth.userId));

      const totalSessions = allSessions.length;
      const totalDurationSeconds = allSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      
      const sessionsByTechnique: Record<string, number> = {
        'box': 0,
        '4-7-8': 0,
        'calm': 0
      };

      allSessions.forEach(s => {
        if (sessionsByTechnique[s.technique] !== undefined) {
          sessionsByTechnique[s.technique]++;
        }
      });

      return NextResponse.json({
        totalSessions,
        totalDurationSeconds,
        sessionsByTechnique
      }, { status: 200 });
    }

    // Handle single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required', 
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const breathingSession = await db.select()
        .from(breathingSessions)
        .where(and(
          eq(breathingSessions.id, parseInt(id)),
          eq(breathingSessions.userId, auth.userId)
        ))
        .limit(1);

      if (breathingSession.length === 0) {
        return NextResponse.json({ 
          error: 'Breathing session not found', 
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(breathingSession[0], { status: 200 });
    }

    // Handle list with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const technique = searchParams.get('technique');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let conditions = [eq(breathingSessions.userId, auth.userId)];

    // Filter by technique
    if (technique) {
      if (!isValidTechnique(technique)) {
        return NextResponse.json({ 
          error: 'Invalid technique. Must be one of: box, 4-7-8, calm', 
          code: 'INVALID_TECHNIQUE' 
        }, { status: 400 });
      }
      conditions.push(eq(breathingSessions.technique, technique));
    }

    // Filter by date range
    if (startDate) {
      conditions.push(gte(breathingSessions.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(breathingSessions.createdAt, endDate));
    }

    const results = await db.select()
      .from(breathingSessions)
      .where(and(...conditions))
      .orderBy(desc(breathingSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { durationSeconds, technique } = body;

    // Validate required fields
    if (durationSeconds === undefined || durationSeconds === null) {
      return NextResponse.json({ 
        error: 'durationSeconds is required', 
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    if (!technique) {
      return NextResponse.json({ 
        error: 'technique is required', 
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    // Validate durationSeconds is positive integer
    if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
      return NextResponse.json({ 
        error: 'durationSeconds must be a positive integer', 
        code: 'INVALID_DURATION' 
      }, { status: 400 });
    }

    // Validate technique enum
    if (!isValidTechnique(technique)) {
      return NextResponse.json({ 
        error: 'technique must be one of: box, 4-7-8, calm', 
        code: 'INVALID_TECHNIQUE' 
      }, { status: 400 });
    }

    // Create breathing session
    const newSession = await db.insert(breathingSessions)
      .values({
        userId: auth.userId,
        durationSeconds,
        technique,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newSession[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    // Check if session exists and belongs to user
    const existingSession = await db.select()
      .from(breathingSessions)
      .where(and(
        eq(breathingSessions.id, parseInt(id)),
        eq(breathingSessions.userId, auth.userId)
      ))
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json({ 
        error: 'Breathing session not found', 
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { durationSeconds, technique } = body;

    // Validate durationSeconds if provided
    if (durationSeconds !== undefined && durationSeconds !== null) {
      if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
        return NextResponse.json({ 
          error: 'durationSeconds must be a positive integer', 
          code: 'INVALID_DURATION' 
        }, { status: 400 });
      }
    }

    // Validate technique if provided
    if (technique !== undefined && technique !== null) {
      if (!isValidTechnique(technique)) {
        return NextResponse.json({ 
          error: 'technique must be one of: box, 4-7-8, calm', 
          code: 'INVALID_TECHNIQUE' 
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (durationSeconds !== undefined) updates.durationSeconds = durationSeconds;
    if (technique !== undefined) updates.technique = technique;

    // Update breathing session
    const updatedSession = await db.update(breathingSessions)
      .set(updates)
      .where(and(
        eq(breathingSessions.id, parseInt(id)),
        eq(breathingSessions.userId, auth.userId)
      ))
      .returning();

    return NextResponse.json(updatedSession[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
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

    // Check if session exists and belongs to user
    const existingSession = await db.select()
      .from(breathingSessions)
      .where(and(
        eq(breathingSessions.id, parseInt(id)),
        eq(breathingSessions.userId, auth.userId)
      ))
      .limit(1);

    if (existingSession.length === 0) {
      return NextResponse.json({ 
        error: 'Breathing session not found', 
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete breathing session
    const deleted = await db.delete(breathingSessions)
      .where(and(
        eq(breathingSessions.id, parseInt(id)),
        eq(breathingSessions.userId, auth.userId)
      ))
      .returning();

    return NextResponse.json({ 
      message: 'Breathing session deleted successfully',
      deletedSession: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}