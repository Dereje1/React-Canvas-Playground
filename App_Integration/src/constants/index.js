module.exports = {
  USER_CONNECTED: 'USER_CONNECTED',
  SOCKET_EVENTS: [
    'USER_CONNECTED',
    'USER_DISCONNECTED',
  ],
  GET_USER_STATUS: 'GET_USER_STATUS',
  serverUrl: () => process.env.SERVER_URL || 'http://localhost:5000',
  clientUrl: () => process.env.CLIENT_URL || 'http://localhost:3000',
};
