// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// console.log("جارٍ تحميل User model...");
// const User = require('../models/User');
// console.log("تم التحميل بنجاح");

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/api/auth/google/callback" // نفس الرابط الذي وضعناه في جوجل
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     // 1. نبحث عن المستخدم في قاعدة بياناتنا باستخدام الـ Google ID
//     let user = await User.findOne({ googleId: profile.id });
    
//     // 2. إذا لم يكن موجوداً، نقوم بإنشاء حساب جديد له
//     if (!user) {
//       user = await User.create({ 
//         googleId: profile.id, 
//         email: profile.emails[0].value,
//         name: profile.displayName 
//       });
//     }
//     return done(null, user); // المستخدم أصبح الآن مسجلاً لدينا
//   }
// ));
