import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals, session } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest): Promise<string | null> {
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const goal = await db.select()
        .from(goals)
        .where(and(
          eq(goals.id, parseInt(id)),
          eq(goals.userId, userId)
        ))
        .limit(1);

      if (goal.length === 0) {
        return NextResponse.json({ 
          error: 'Goal not found',
          code: 'GOAL_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(goal[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select()
      .from(goals)
      .where(eq(goals.userId, userId));

    const conditions = [eq(goals.userId, userId)];

    if (status) {
      if (!['active', 'completed', 'archived'].includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be active, completed, or archived',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
      conditions.push(eq(goals.status, status));
    }

    if (startDate) {
      conditions.push(gte(goals.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(goals.createdAt, endDate));
    }

    const results = await db.select()
      .from(goals)
      .where(and(...conditions))
      .orderBy(desc(goals.createdAt))
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

    const { title, description, status, targetDate } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Title is required and must be a non-empty string',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    const sanitizedTitle = title.trim();
    const sanitizedDescription = description ? String(description).trim() : null;
    const goalStatus = status || 'active';

    if (!['active', 'completed', 'archived'].includes(goalStatus)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be active, completed, or archived',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    const sanitizedTargetDate = targetDate ? String(targetDate).trim() : null;

    const now = new Date().toISOString();

    const newGoal = await db.insert(goals)
      .values({
        userId: userId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        status: goalStatus,
        targetDate: sanitizedTargetDate,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });

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

    const searchParams = request.nextUrl.searchParams;
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

    const existingGoal = await db.select()
      .from(goals)
      .where(and(
        eq(goals.id, parseInt(id)),
        eq(goals.userId, userId)
      ))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND' 
      }, { status: 404 });
    }

    const { title, description, status, targetDate } = body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ 
          error: 'Title must be a non-empty string',
          code: 'INVALID_TITLE' 
        }, { status: 400 });
      }
    }

    if (status !== undefined) {
      if (!['active', 'completed', 'archived'].includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be active, completed, or archived',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description ? String(description).trim() : null;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (targetDate !== undefined) {
      updates.targetDate = targetDate ? String(targetDate).trim() : null;
    }

    const updatedGoal = await db.update(goals)
      .set(updates)
      .where(and(
        eq(goals.id, parseInt(id)),
        eq(goals.userId, userId)
      ))
      .returning();

    if (updatedGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updatedGoal[0], { status: 200 });

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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const existingGoal = await db.select()
      .from(goals)
      .where(and(
        eq(goals.id, parseInt(id)),
        eq(goals.userId, userId)
      ))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND' 
      }, { status: 404 });
    }

    const deletedGoal = await db.delete(goals)
      .where(and(
        eq(goals.id, parseInt(id)),
        eq(goals.userId, userId)
      ))
      .returning();

    if (deletedGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Goal deleted successfully',
      goal: deletedGoal[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}