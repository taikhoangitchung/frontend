export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  clientUrl: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  clientIp: process.env.NEXT_PUBLIC_IP_CLIENT || '127.0.0.1',
  clientPort: process.env.NEXT_PUBLIC_PORT_CLIENT || '3000',
  serverPort: process.env.NEXT_PUBLIC_PORT_SERVER || '8080',
  socket: {
    baseUrl: process.env.NEXT_PUBLIC_SOCKET_BASE_URL || 'ws://localhost:8080/ws',
    kickUrl: process.env.NEXT_PUBLIC_SOCKET_KICK_URL || 'ws://localhost:8080/ws/kick',
  }
};
