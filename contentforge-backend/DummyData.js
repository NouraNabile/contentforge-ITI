const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const { User, Brand, Post, Calendar, Trend, ChatMessage } = require('./models/index'); // اتأكدي من المسار الصح للموديلز

// جمّلي الداتا بكلمات مناسبة للبزنس والسوشيال ميديا في مصر والوطن العربي
const dialects = ['المصرية', 'الخليجية', 'البيضاء', 'السعودية'];
const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok'];
const plans = ['free', 'starter', 'growth', 'agency', 'enterprise'];
const postStatuses = ['draft', 'pending_review', 'approved', 'scheduled', 'published'];

async function seedDB() {
  try {
    // 1. الاتصال بقاعدة البيانات (غيري الـ URI حسب جهازك)
    await mongoose.connect('mongodb://Noura:jnkZSqcX2bJ3LLitit2026@ac-vmdhgeq-shard-00-00.diacuvs.mongodb.net:27017,ac-vmdhgeq-shard-00-01.diacuvs.mongodb.net:27017,ac-vmdhgeq-shard-00-02.diacuvs.mongodb.net:27017/?ssl=true&replicaSet=atlas-usupgm-shard-0&authSource=admin&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔌 Connected to MongoDB successfully...');

    // 2. تنظيف الداتا القديمة (اختياري - امسحي السطور دي لو مش عايزة تمسحي الداتا الحالية)
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      Post.deleteMany({}),
      Calendar.deleteMany({}),
      // Trend.deleteMany({}),
      ChatMessage.deleteMany({})
    ]);
    console.log('🧹 Cleaned up existing data.');

    // 3. توليد Trends (مستقلة بذاتها)
    // console.log('📈 Generating Trends...');
    // const trends = [];
    // for (let i = 0; i < 15; i++) {
    //   trends.push({
    //     tag: faker.helpers.arrayElement(['#رمضان_2026', '#كأس_العالم', '#شغل_اونلاين', '#الذكاء_الاصطناعي', '#تجارة_إلكترونية', '#صناع_المحتوى']),
    //     change: `+${faker.number.int({ min: 50, max: 500 })}%`,
    //     velocity: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
    //     region: faker.helpers.arrayElement(['EG', 'SA', 'AE']),
    //     source: faker.helpers.arrayElement(['google', 'twitter', 'manual']),
    //   });
    // }
    // const createdTrends = await Trend.insertMany(trends);

    // 4. توليد مستخدمين (Users)
    console.log('👥 Generating Users...');
    const usersData = [];
    // هنكريت مستخدم مسؤول (Admin) للتجربة أولاً
    usersData.push({
      name: 'Super Admin',
      email: 'admin@app.com',
      password: 'password123', // الـ pre-save hook هيعملها hash تلقائي
      plan: 'enterprise',
      isVerified: true,
      phone: '+201000000000',
      isTrial: false,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isAdmin: true,
    });

    // توليد 10 مستخدمين عاديين (تقدري تزودي الرقم زي ما تحبي)
    for (let i = 1; i <= 10; i++) {
      const trialStartDate = new Date();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialStartDate.getDate() + 14);

      usersData.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123', 
        plan: faker.helpers.arrayElement(plans),
        isVerified: faker.datatype.boolean(0.8), // 80% verified
        phone: faker.phone.number({ style: 'international' }), 
        isTrial: faker.datatype.boolean(0.6),
        trialStartDate,
        trialDurationDays: 14,
        trialEndsAt,
        hasUsedTrial: true,
        isAdmin: false,
        isBlocked: faker.datatype.boolean(0.05), // 5% blocked
      });
    }

    // بنستخدم الميثود العادية مش insertMany عشان يشتغل الـ pre-save hook بتاع الـ bcrypt
    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }

    // 5. توليد البراندات (Brands) مرتبطة بالـ Users
    console.log('🏢 Generating Brands...');
    const createdBrands = [];
    for (const user of createdUsers) {
      if (user.isAdmin) continue; // مش لازم الأدمن يكون عنده براند

      // كل مستخدم هنعمله براند أو اتنين
      const numBrands = faker.number.int({ min: 1, max: 2 });
      for (let b = 0; b < numBrands; b++) {
        const brand = await Brand.create({
          user: user._id,
          name: faker.company.name(),
          industry: faker.company.buzzNoun(),
          website: faker.internet.url(),
          targetAudience: 'شباب من سن 18 لـ 35 مهتمين بالتكنولوجيا والموضة',
          marketSize: faker.helpers.arrayElement(['Small', 'Medium', 'Enterprise']),
          dialects: faker.helpers.arrayElements(dialects, { min: 1, max: 2 }),
          tones: faker.helpers.arrayElements(['احترافي', 'كوميدي', 'حماسي', 'تعليمي'], { min: 1, max: 2 }),
          avoidTopics: 'السياسة والدين',
          platforms: faker.helpers.arrayElements(platforms, { min: 2, max: 4 }),
          guidelinesFile: faker.system.filePath(),
          ragChunks: [
            { content: 'البراند بتاعنا بيركز على تقديم جودة عالية بأسعار مناسبة.', source: 'guidelines' },
            { content: 'كابشن قديم: العيد قرب وعروضنا لسه مخلصتش! استنوا أقوى خصم.', source: 'past_posts' }
          ]
        });
        createdBrands.push(brand);
      }
    }

    // 6. توليد الكالندر والبوستات والمحادثات
    console.log('📅 Generating Calendars, Posts, and Chat Messages...');
    
    for (const brand of createdBrands) {
      // أ) شات عشوائي لكل براند
      for (let c = 0; c < 5; c++) {
        const convId = faker.string.uuid();
        await ChatMessage.create({
          brand: brand._id,
          sender: 'user',
          content: 'عايز أفكار بوستات عن الصيف',
          conversationId: convId
        });
        await ChatMessage.create({
          brand: brand._id,
          sender: 'ai',
          content: 'أهلاً بك! إليك 3 أفكار لبوستات الصيف تناسب جمهورك...',
          conversationId: convId
        });
      }

      // ب) عمل كالندر (Calendar) للبراند
      const calendar = await Calendar.create({
        brand: brand._id,
        user: brand.user,
        title: `خطة محتوى شهر ${faker.date.month()}`,
        brief: 'خطة تسويقية لزيادة التفاعل والمبيعات',
        dialect: faker.helpers.arrayElement(brand.dialects),
        platforms: brand.platforms,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        // trendsUsed: [faker.helpers.arrayElement(createdTrends).tag],
        status: faker.helpers.arrayElement(['generating', 'ready', 'approved']),
        posts: [] // هنملاها حالا بعد ما نكريت البوستات
      });

      // جـ) توليد بوستات (Posts) جوه الكالندر دا
      const postIds = [];
      const numPosts = faker.number.int({ min: 3, max: 7 });

      for (let p = 0; p < numPosts; p++) {
        const post = await Post.create({
          brand: brand._id,
          calendar: calendar._id,
          platform: faker.helpers.arrayElement(brand.platforms),
          dialect: calendar.dialect,
          date: faker.date.future().toISOString().split('T')[0],
          copyAR: 'البوست دا جامد جداً ومكتوب بالعربي عشان يجيب ريتش عالي! 🎉',
          copyEN: 'This is the English version of the post copy for maximum reach!',
          hashtags: ['#تسويق', '#بزنس', brand.name.replace(/\s+/g, '')],
          imagePrompt: 'A futuristic workspace with neon lights, 4k, hyperrealistic',
          imageUrl: faker.image.urlLoremFlickr({ category: 'business' }),
          goal: faker.helpers.arrayElement(['Awareness', 'Conversion', 'Engagement']),
          variantB: {
            copyAR: 'نسخة تانية تجريبية (A/B Testing) عشان نشوف أنهي الأحسن 🤔',
            copyEN: 'Alternative English copy for testing purposes.',
            hashtags: ['#تغيير', '#تطوير']
          },
          status: faker.helpers.arrayElement(postStatuses),
          scheduledAt: faker.date.future(),
          publishedAt: faker.datatype.boolean(0.3) ? faker.date.past() : null
        });
        postIds.push(post._id);
      }

      // تحديث الكالندر بـ IDs البوستات اللي اتعملت
      calendar.posts = postIds;
      await calendar.save();
    }

    console.log('🚀 DONE! Database has been successfully seeded with tons of dummy data.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();