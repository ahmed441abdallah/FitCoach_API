import cron from 'node-cron';
import Subscription from '../models/Subscription.js';

export const startCronJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('⏳ Running daily check for expired subscriptions...');
        try {
            const currentDate = new Date();

            // ابحث عن كل الاشتراكات النشطة التي انتهى تاريخها
            // وقم بتحديث حالتها إلى منتهية
            const result = await Subscription.updateMany(
                {
                    status: 'active',
                    endDate: { $lt: currentDate } // $lt تعني Less Than (أقدم من تاريخ اليوم)
                },
                {
                    $set: { status: 'expired' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Successfully expired ${result.modifiedCount} subscriptions.`);
            } else {
                console.log('👌 No subscriptions expired today.');
            }
        } catch (error) {
            console.error('❌ Error updating expired subscriptions:', error);
        }
    });
};