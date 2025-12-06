import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, session } from '@/db/schema';
import { eq, and, gt, lt, desc, asc } from 'drizzle-orm';

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
    
    if (userSession.expiresAt < new Date()) {
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

      const task = await db.select()
        .from(tasks)
        .where(and(
          eq(tasks.id, parseInt(id)),
          eq(tasks.userId, user.id)
        ))
        .limit(1);

      if (task.length === 0) {
        return NextResponse.json({ 
          error: 'Task not found',
          code: 'TASK_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(task[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const statusFilter = searchParams.get('status');
    const priorityFilter = searchParams.get('priority');
    const overdue = searchParams.get('overdue');

    const conditions = [eq(tasks.userId, user.id)];

    if (statusFilter) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(statusFilter)) {
        return NextResponse.json({ 
          error: 'Invalid status filter. Must be one of: pending, in_progress, completed',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
      conditions.push(eq(tasks.status, statusFilter));
    }

    if (priorityFilter) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priorityFilter)) {
        return NextResponse.json({ 
          error: 'Invalid priority filter. Must be one of: low, medium, high',
          code: 'INVALID_PRIORITY' 
        }, { status: 400 });
      }
      conditions.push(eq(tasks.priority, priorityFilter));
    }

    let query = db.select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(
        desc(tasks.priority),
        asc(tasks.dueDate)
      )
      .limit(limit)
      .offset(offset);

    let results = await query;

    if (overdue === 'true') {
      const now = new Date().toISOString();
      results = results.filter(task => 
        task.dueDate && 
        task.dueDate < now && 
        task.status !== 'completed'
      );
    }

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

    const { title, description, status, priority, dueDate } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Title is required and must be a non-empty string',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    const taskStatus = status || 'pending';
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(taskStatus)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: pending, in_progress, completed',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    const taskPriority = priority || 'medium';
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(taskPriority)) {
      return NextResponse.json({ 
        error: 'Invalid priority. Must be one of: low, medium, high',
        code: 'INVALID_PRIORITY' 
      }, { status: 400 });
    }

    if (dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateRegex.test(dueDate)) {
        return NextResponse.json({ 
          error: 'Invalid dueDate format. Must be ISO8601 format',
          code: 'INVALID_DUE_DATE' 
        }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    const newTask = await db.insert(tasks)
      .values({
        userId: user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        status: taskStatus,
        priority: taskPriority,
        dueDate: dueDate || null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
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

    const existingTask = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, parseInt(id)),
        eq(tasks.userId, user.id)
      ))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json({ 
        error: 'Task not found',
        code: 'TASK_NOT_FOUND' 
      }, { status: 404 });
    }

    const { title, description, status, priority, dueDate } = body;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ 
          error: 'Title must be a non-empty string',
          code: 'INVALID_TITLE' 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be one of: pending, in_progress, completed',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ 
          error: 'Invalid priority. Must be one of: low, medium, high',
          code: 'INVALID_PRIORITY' 
        }, { status: 400 });
      }
      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        updates.dueDate = null;
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        if (!dateRegex.test(dueDate)) {
          return NextResponse.json({ 
            error: 'Invalid dueDate format. Must be ISO8601 format',
            code: 'INVALID_DUE_DATE' 
          }, { status: 400 });
        }
        updates.dueDate = dueDate;
      }
    }

    const updated = await db.update(tasks)
      .set(updates)
      .where(and(
        eq(tasks.id, parseInt(id)),
        eq(tasks.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Task not found',
        code: 'TASK_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
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

    const existingTask = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.id, parseInt(id)),
        eq(tasks.userId, user.id)
      ))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json({ 
        error: 'Task not found',
        code: 'TASK_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(tasks)
      .where(and(
        eq(tasks.id, parseInt(id)),
        eq(tasks.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Task not found',
        code: 'TASK_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Task deleted successfully',
      task: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}