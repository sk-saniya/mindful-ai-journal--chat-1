import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityCompletions, session } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

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

    return { id: userSession.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record lookup
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(activityCompletions)
        .where(
          and(
            eq(activityCompletions.id, parseInt(id)),
            eq(activityCompletions.userId, user.id)
          )
        )
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const completedParam = searchParams.get('completed');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const conditions = [eq(activityCompletions.userId, user.id)];

    // Filter by completion status
    if (completedParam !== null) {
      const completedValue = completedParam === 'true';
      conditions.push(eq(activityCompletions.completed, completedValue));
    }

    // Filter by date range
    if (startDate) {
      conditions.push(gte(activityCompletions.completionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(activityCompletions.completionDate, endDate));
    }

    const results = await db
      .select()
      .from(activityCompletions)
      .where(and(...conditions))
      .orderBy(desc(activityCompletions.completionDate))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { activityName, completed, completionDate } = body;

    // Validate required fields
    if (!activityName) {
      return NextResponse.json(
        {
          error: 'activityName is required',
          code: 'MISSING_ACTIVITY_NAME',
        },
        { status: 400 }
      );
    }

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        {
          error: 'completed must be a boolean',
          code: 'INVALID_COMPLETED',
        },
        { status: 400 }
      );
    }

    if (!completionDate) {
      return NextResponse.json(
        {
          error: 'completionDate is required',
          code: 'MISSING_COMPLETION_DATE',
        },
        { status: 400 }
      );
    }

    // Validate activityName is non-empty after trimming
    const trimmedActivityName = activityName.trim();
    if (trimmedActivityName.length === 0) {
      return NextResponse.json(
        {
          error: 'activityName cannot be empty',
          code: 'EMPTY_ACTIVITY_NAME',
        },
        { status: 400 }
      );
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(completionDate)) {
      return NextResponse.json(
        {
          error: 'completionDate must be in YYYY-MM-DD format',
          code: 'INVALID_DATE_FORMAT',
        },
        { status: 400 }
      );
    }

    // Validate it's a valid date
    const parsedDate = new Date(completionDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        {
          error: 'completionDate must be a valid date',
          code: 'INVALID_DATE',
        },
        { status: 400 }
      );
    }

    const newRecord = await db
      .insert(activityCompletions)
      .values({
        userId: user.id,
        activityName: trimmedActivityName,
        completed: completed ? 1 : 0,
        completionDate,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if record exists and belongs to user
    const existing = await db
      .select()
      .from(activityCompletions)
      .where(
        and(
          eq(activityCompletions.id, parseInt(id)),
          eq(activityCompletions.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { activityName, completed, completionDate } = body;
    const updates: Record<string, string | number> = {};

    // Validate and prepare activityName if provided
    if (activityName !== undefined) {
      const trimmedActivityName = activityName.trim();
      if (trimmedActivityName.length === 0) {
        return NextResponse.json(
          {
            error: 'activityName cannot be empty',
            code: 'EMPTY_ACTIVITY_NAME',
          },
          { status: 400 }
        );
      }
      updates.activityName = trimmedActivityName;
    }

    // Validate and prepare completed if provided
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return NextResponse.json(
          {
            error: 'completed must be a boolean',
            code: 'INVALID_COMPLETED',
          },
          { status: 400 }
        );
      }
      updates.completed = completed ? 1 : 0;
    }

    // Validate and prepare completionDate if provided
    if (completionDate !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(completionDate)) {
        return NextResponse.json(
          {
            error: 'completionDate must be in YYYY-MM-DD format',
            code: 'INVALID_DATE_FORMAT',
          },
          { status: 400 }
        );
      }

      const parsedDate = new Date(completionDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            error: 'completionDate must be a valid date',
            code: 'INVALID_DATE',
          },
          { status: 400 }
        );
      }
      updates.completionDate = completionDate;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    const updated = await db
      .update(activityCompletions)
      .set(updates)
      .where(
        and(
          eq(activityCompletions.id, parseInt(id)),
          eq(activityCompletions.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists and belongs to user
    const existing = await db
      .select()
      .from(activityCompletions)
      .where(
        and(
          eq(activityCompletions.id, parseInt(id)),
          eq(activityCompletions.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(activityCompletions)
      .where(
        and(
          eq(activityCompletions.id, parseInt(id)),
          eq(activityCompletions.userId, user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Activity completion deleted successfully',
        record: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}