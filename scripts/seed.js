require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Onboarding = require('../src/models/Onboarding');
const Task = require('../src/models/Task');

const connectDatabase = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/onboarding_db';
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Onboarding.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      {
        email: 'admin@company.com',
        password: 'admin123',
        name: 'HR Admin',
        role: 'hr_admin',
        department: 'Human Resources'
      },
      {
        email: 'manager@company.com',
        password: 'manager123',
        name: 'Engineering Manager',
        role: 'manager',
        department: 'Engineering'
      },
      {
        email: 'john.doe@company.com',
        password: 'password123',
        name: 'John Doe',
        role: 'new_hire',
        department: 'Engineering'
      }
    ]);

    console.log('👥 Created users:', users.map(u => u.email).join(', '));

    // Create onboardings
    const startDate1 = new Date();
    startDate1.setDate(startDate1.getDate() + 7); // Start in 7 days

    const startDate2 = new Date();
    startDate2.setDate(startDate2.getDate() + 14); // Start in 14 days

    const onboardings = await Onboarding.create([
      {
        employeeId: 'EMP-2024-001',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@company.com',
        role: 'Software Engineer',
        department: 'Engineering',
        startDate: startDate1,
        managerId: users[1]._id.toString(),
        location: 'San Francisco',
        status: 'pending',
        progress: 0,
        createdBy: users[0]._id
      },
      {
        employeeId: 'EMP-2024-002',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@company.com',
        role: 'Product Manager',
        department: 'Product',
        startDate: startDate2,
        managerId: users[1]._id.toString(),
        location: 'New York',
        status: 'pending',
        progress: 0,
        createdBy: users[0]._id
      }
    ]);

    console.log('📋 Created onboardings:', onboardings.map(o => o.email).join(', '));

    // Create tasks for first onboarding
    const tasks = await Task.create([
      {
        onboardingId: onboardings[0]._id,
        name: 'Complete IT security training',
        description: 'Complete the mandatory security awareness training module',
        category: 'training',
        status: 'pending',
        priority: 'high',
        dueDate: startDate1,
        order: 1
      },
      {
        onboardingId: onboardings[0]._id,
        name: 'Set up work email',
        description: 'Access your work email and configure your profile',
        category: 'technical',
        status: 'pending',
        priority: 'high',
        dueDate: startDate1,
        order: 2
      },
      {
        onboardingId: onboardings[0]._id,
        name: 'Meet with manager',
        description: 'Initial 1:1 meeting to discuss goals and expectations',
        category: 'meeting',
        status: 'pending',
        priority: 'medium',
        dueDate: startDate1,
        order: 3
      },
      {
        onboardingId: onboardings[0]._id,
        name: 'Team introduction',
        description: 'Meet your team members and learn about ongoing projects',
        category: 'social',
        status: 'pending',
        priority: 'medium',
        dueDate: startDate1,
        order: 4
      },
      {
        onboardingId: onboardings[0]._id,
        name: 'Set up development environment',
        description: 'Install required software, tools, and access repositories',
        category: 'technical',
        status: 'pending',
        priority: 'high',
        dueDate: startDate1,
        order: 5
      },
      {
        onboardingId: onboardings[0]._id,
        name: 'Benefits enrollment',
        description: 'Complete health insurance and 401(k) enrollment',
        category: 'administrative',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(startDate1.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
        order: 6
      }
    ]);

    console.log(`✅ Created ${tasks.length} tasks for Sarah Chen`);

    // Create tasks for second onboarding
    const tasks2 = await Task.create([
      {
        onboardingId: onboardings[1]._id,
        name: 'Complete IT security training',
        description: 'Complete the mandatory security awareness training module',
        category: 'training',
        status: 'pending',
        priority: 'high',
        dueDate: startDate2,
        order: 1
      },
      {
        onboardingId: onboardings[1]._id,
        name: 'Product tools training',
        description: 'Learn to use Jira, Confluence, and Figma',
        category: 'training',
        status: 'pending',
        priority: 'high',
        dueDate: startDate2,
        order: 2
      },
      {
        onboardingId: onboardings[1]._id,
        name: 'Meet with product team',
        description: 'Introduction to the product roadmap and team members',
        category: 'meeting',
        status: 'pending',
        priority: 'high',
        dueDate: startDate2,
        order: 3
      }
    ]);

    console.log(`✅ Created ${tasks2.length} tasks for Michael Johnson`);

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Onboardings: ${onboardings.length}`);
    console.log(`   Tasks: ${tasks.length + tasks2.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@company.com / admin123');
    console.log('   Manager: manager@company.com / manager123');
    console.log('   New Hire: john.doe@company.com / password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const run = async () => {
  await connectDatabase();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
};

run();
