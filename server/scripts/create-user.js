const bcrypt = require('bcrypt');
const { query } = require('../db');

async function createUser() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node create-user.js <email> <password> <role> [name]');
      console.log('Example: node create-user.js john@company.com mypassword123 admin "John Admin"');
      console.log('Roles: admin, employee');
      process.exit(1);
    }

    const email = args[0];
    const password = args[1];
    const role = args[2];
    const name = args[3] || email.split('@')[0]; // Use email prefix if name not provided

    // Validate role
    if (!['admin', 'employee'].includes(role)) {
      console.log('❌ Invalid role. Must be "admin" or "employee"');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role]
    );

    const user = result.rows[0];
    console.log('\n✅ User created successfully!');
    console.log('ID:', user.id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('\n🔐 You can now login with these credentials');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  Remember to change your password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

createUser(); 