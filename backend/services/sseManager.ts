import type { Response } from "express";

class SSEManager {
  private connections = new Map<string, Set<Response>>();

  addConnection(userId: string, res: Response) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }

    this.connections.get(userId)!.add(res);
  }

  removeConnection(userId: string, res: Response) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(res);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  broadcastToUser(userId: string, data: object) {
    const userConnections = this.connections.get(userId);
    if (!userConnections) return;

    const message = `data: ${JSON.stringify(data)}\n\n`;

    for (const res of userConnections) {
      if (!res.writableEnded) {
        res.write(message);
      } else {
        userConnections.delete(res);
      }
    }
  }
}

export const sseManager = new SSEManager();
