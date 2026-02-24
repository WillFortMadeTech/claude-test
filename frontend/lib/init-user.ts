/**
 * Initialize demo user if it doesn't exist
 * This should be called when the app starts to ensure a user exists for demo purposes
 */
export async function initializeDemoUser(userId: string) {
  try {
    // Check if user exists
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();
    const userExists = users.some((u: any) => u.userId === userId);

    if (!userExists) {
      // Create demo user
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@example.com',
          name: 'Demo User',
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create demo user');
      }

      console.log('Demo user created successfully');
    }
  } catch (error) {
    console.error('Error initializing demo user:', error);
  }
}
