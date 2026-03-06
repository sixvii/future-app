const cron = require('node-cron');
const Letter = require('../models/Letter');

// Process letter deliveries every minute
const startDeliveryScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const currentTime = new Date();
      
      // Find all letters that should be delivered now
      const letters = await Letter.find({
        deliveryDate: { $lte: currentTime },
        isDelivered: false,
      });

      for (let letter of letters) {
        letter.isDelivered = true;
        letter.deliveredAt = currentTime;
        letter.status = 'delivered';
        await letter.save();
        console.log(`✓ Letter "${letter.title}" delivered to recipient at ${currentTime.toISOString()}`);
      }

      if (letters.length > 0) {
        console.log(`📬 ${letters.length} letter(s) processed for delivery`);
      }
    } catch (error) {
      console.error('❌ Scheduler error:', error.message);
    }
  });

  console.log('✓ Delivery scheduler started (runs every minute)');
};

module.exports = { startDeliveryScheduler };
