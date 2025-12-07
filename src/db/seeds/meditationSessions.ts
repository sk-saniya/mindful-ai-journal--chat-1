import { db } from '@/db';
import { meditationSessions } from '@/db/schema';

async function main() {
    const sampleSessions = [
        // Recent days (last 5 days) - 8 sessions
        {
            userId: 'user_1',
            duration: 600,
            type: 'guided',
            completed: 1,
            createdAt: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_2',
            duration: 900,
            type: 'breathing',
            completed: 1,
            createdAt: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_3',
            duration: 1200,
            type: 'mindfulness',
            completed: 1,
            createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_1',
            duration: 300,
            type: 'breathing',
            completed: 0,
            createdAt: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_2',
            duration: 1800,
            type: 'mindfulness',
            completed: 1,
            createdAt: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_3',
            duration: 600,
            type: 'guided',
            completed: 1,
            createdAt: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_1',
            duration: 900,
            type: 'mindfulness',
            completed: 1,
            createdAt: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_2',
            duration: 1200,
            type: 'guided',
            completed: 1,
            createdAt: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
        },

        // Middle days (days 6-10) - 6 sessions
        {
            userId: 'user_3',
            duration: 600,
            type: 'breathing',
            completed: 1,
            createdAt: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_1',
            duration: 1800,
            type: 'guided',
            completed: 1,
            createdAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_2',
            duration: 300,
            type: 'mindfulness',
            completed: 0,
            createdAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_3',
            duration: 900,
            type: 'guided',
            completed: 1,
            createdAt: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_1',
            duration: 1200,
            type: 'breathing',
            completed: 1,
            createdAt: new Date(Date.now() - (9 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_2',
            duration: 600,
            type: 'breathing',
            completed: 1,
            createdAt: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        },

        // Earlier days (days 11-14) - 4 sessions
        {
            userId: 'user_3',
            duration: 1800,
            type: 'mindfulness',
            completed: 1,
            createdAt: new Date(Date.now() - (11 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_1',
            duration: 300,
            type: 'mindfulness',
            completed: 1,
            createdAt: new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_2',
            duration: 900,
            type: 'breathing',
            completed: 0,
            createdAt: new Date(Date.now() - (13 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            userId: 'user_3',
            duration: 1200,
            type: 'mindfulness',
            completed: 1,
            createdAt: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)).toISOString(),
        },
    ];

    await db.insert(meditationSessions).values(sampleSessions);
    
    console.log('✅ Meditation sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});