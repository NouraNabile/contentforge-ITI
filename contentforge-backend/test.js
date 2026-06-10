require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ MongoDB connected');
  
  const { User } = require('./models');
  const { sendTrialExpiryWarningEmail } = require('./services/emailService');

  const now = new Date();
  const threeDaysFromNowStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  threeDaysFromNowStart.setHours(0, 0, 0, 0);
  const threeDaysFromNowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  threeDaysFromNowEnd.setHours(23, 59, 59, 999);

  const users = await User.find({
    isTrial: true,
    trialEndsAt: { $gte: threeDaysFromNowStart, $lte: threeDaysFromNowEnd }
  });

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    await sendTrialExpiryWarningEmail(user.email, user.name, user.trialEndsAt);
    console.log(`✅ Email sent to ${user.email}`);
  }
    await new Promise(resolve => setTimeout(resolve, 3000)); // ← ضيفي السطر ده
  process.exit();
}).catch(err => {
  console.error('MongoDB error:', err.message);
  process.exit(1);
});