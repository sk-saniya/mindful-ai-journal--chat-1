import { db } from '@/db';
import { goals } from '@/db/schema';

async function main() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const fortyFiveDaysFromNow = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const sampleGoals = [
        {
            userId: 'user_1',
            title: 'Meditate daily for 10 minutes',
            description: 'Establish a consistent meditation practice to reduce stress and improve focus. Start with guided meditations and gradually build up to longer sessions for maximum mental clarity.',
            status: 'active',
            targetDate: thirtyDaysFromNow.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_1',
            title: 'Exercise 3 times per week',
            description: 'Commit to regular physical activity to improve cardiovascular health and energy levels. Mix cardio, strength training, and flexibility exercises for a well-rounded fitness routine.',
            status: 'active',
            targetDate: sixtyDaysFromNow.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_2',
            title: 'Sleep 8 hours each night',
            description: 'Prioritize quality sleep to enhance cognitive function and overall wellbeing. Establish a consistent bedtime routine and optimize sleep environment for better rest.',
            status: 'active',
            targetDate: ninetyDaysFromNow.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_2',
            title: 'Journal every evening',
            description: 'Reflect on daily experiences and emotions through consistent evening journaling. This practice helps process thoughts, track progress, and cultivate gratitude.',
            status: 'completed',
            targetDate: fifteenDaysAgo.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_3',
            title: 'Drink 8 glasses of water daily',
            description: 'Maintain proper hydration to support physical performance and mental clarity. Track daily water intake and set reminders throughout the day to meet hydration goals.',
            status: 'active',
            targetDate: fortyFiveDaysFromNow.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_3',
            title: 'Practice gratitude daily',
            description: 'Cultivate a positive mindset by acknowledging three things to be grateful for each day. This ongoing practice helps shift focus toward appreciation and contentment.',
            status: 'active',
            targetDate: null,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_1',
            title: 'Reduce screen time before bed',
            description: 'Eliminate electronic devices at least one hour before bedtime to improve sleep quality. Replace screen time with reading, stretching, or other calming activities.',
            status: 'completed',
            targetDate: sevenDaysAgo.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'user_2',
            title: 'Take a 20-minute walk daily',
            description: 'Incorporate daily walks to boost mood, improve circulation, and enjoy nature. Use this time for reflection, listening to podcasts, or simply being present in the moment.',
            status: 'archived',
            targetDate: ninetyDaysAgo.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
    ];

    await db.insert(goals).values(sampleGoals);
    
    console.log('✅ Goals seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});