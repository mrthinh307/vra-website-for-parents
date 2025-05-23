/**
 * Simple in-memory session store
 * This will be cleared when the server restarts
 */
const sessionStore = {
  // Map to store active sessions
  sessions: new Map(),
  
  /**
   * Add a session to the store
   * @param {string} token - The session token
   * @param {string} userId - The user ID associated with the session
   * @param {number} expiresIn - Session expiration time in seconds
   */
  addSession(token, userId, expiresIn = 604800) { // Default 7 days
    const expiresAt = Date.now() + (expiresIn * 1000);
    this.sessions.set(token, {
      userId,
      expiresAt
    });
    console.log(`Session added for user: ${userId} (expires in ${expiresIn} seconds)`);
  },
  
  /**
   * Remove a session from the store
   * @param {string} token - The session token to remove
   */
  removeSession(token) {
    const session = this.sessions.get(token);
    if (session) {
      this.sessions.delete(token);
      console.log(`Session removed for user: ${session.userId}`);
      return true;
    }
    return false;
  },
  
  /**
   * Check if a session exists and is valid
   * @param {string} token - The session token to check
   * @returns {boolean} - Whether the session is valid
   */
  isValidSession(token) {
    const session = this.sessions.get(token);
    if (!session) {
      return false;
    }
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.removeSession(token);
      return false;
    }
    
    return true;
  },
  
  /**
   * Get all active sessions
   * @returns {Array} - Array of all active sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.entries()).map(([token, session]) => ({
      token,
      userId: session.userId,
      expiresAt: new Date(session.expiresAt).toISOString()
    }));
  },
  
  /**
   * Clean expired sessions
   */
  cleanExpiredSessions() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`Cleaned ${expiredCount} expired sessions`);
    }
    
    return expiredCount;
  }
};

// Set up a periodic task to clean expired sessions
setInterval(() => {
  sessionStore.cleanExpiredSessions();
}, 3600000); // Run every hour

module.exports = sessionStore;
