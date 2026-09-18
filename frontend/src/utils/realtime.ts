import { io, type Socket } from 'socket.io-client';
import { getSocketUrl } from './socketUrl';

/**
 * One authenticated Socket.IO connection shared by every screen.
 *
 * The server refuses anonymous sockets: the JWT goes in the handshake and is
 * re-read on every reconnect, so a fresh sign-in is picked up automatically.
 * Screens call `acquireSocket()` on mount and `releaseSocket()` on unmount;
 * the connection closes when nobody needs it any more.
 */
let shared: Socket | null = null;
let users = 0;

export function acquireSocket(): Socket {
  if (!shared) {
    shared = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      auth: cb => cb({ token: localStorage.getItem('token') || '' }),
      reconnectionDelayMax: 8000,
    });
  }
  users += 1;
  return shared;
}

export function releaseSocket(): void {
  users = Math.max(0, users - 1);
  if (users === 0 && shared) {
    shared.disconnect();
    shared = null;
  }
}

export type { Socket };
