import { db } from '@/db';
import { session } from '@/db/schema';

async function main() {
    const now = new Date();
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const sampleSessions = [
        {
            id: 'session_1',
            token: 'test_token_alice',
            userId: 'user_1',
            expiresAt: expiryDate,
            createdAt: now,
            updatedAt: now,
            ipAddress: '127.0.0.1',
            userAgent: 'Test Agent',
        },
        {
            id: 'session_2',
            token: 'test_token_bob',
            userId: 'user_2',
            expiresAt: expiryDate,
            createdAt: now,
            updatedAt: now,
            ipAddress: '127.0.0.1',
            userAgent: 'Test Agent',
        },
        {
            id: 'session_3',
            token: 'test_token_charlie',
            userId: 'user_3',
            expiresAt: expiryDate,
            createdAt: now,
            updatedAt: now,
            ipAddress: '127.0.0.1',
            userAgent: 'Test Agent',
        },
    ];

    await db.insert(session).values(sampleSessions);
    
    console.log('✅ Sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});