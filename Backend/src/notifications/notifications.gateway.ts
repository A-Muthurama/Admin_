import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: [
            'https://admin.jewellersparadise.com',
            'https://www.admin.jewellersparadise.com',
            'https://jewellersparadise.com',
        ],
        credentials: true,
    },
    transports: ['polling', 'websocket'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('NotificationsGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Helper method to broadcast to all connected admins
    broadcastNotification(event: string, data: any) {
        this.logger.log(`Broadcasting event: ${event}`);
        this.server.emit(event, data);
    }
}
