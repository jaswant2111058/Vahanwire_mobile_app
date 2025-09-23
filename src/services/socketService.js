import { io } from 'socket.io-client';
import { SOCKET_URL } from '.';


class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect(serverUrl = SOCKET_URL) {
        if (this.socket && this.isConnected) {
            return;
        }

        this.socket = io(serverUrl, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    joinRoom(roomId, userType, userId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-room', { roomId, userType, userId });
        }
    }

    leaveRoom(roomId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-room', roomId);
        }
    }

    onNewRide(callback) {
        console.log('Setting up new ride listener');
        if (this.socket) {
            this.socket.on('new-ride', callback);
        }
    }

    onNewBid(callback) {

        console.log('Setting up onNewBid listener');
        if (this.socket) {
            this.socket.on('new-bid', callback);
        }

    }

    onBidUpdated(callback) {
        if (this.socket) {
            this.socket.on('bid-updated', callback);
        }
    }

    onBidAccepted(callback) {
        if (this.socket) {
            this.socket.on('bid-accepted', callback);
        }
    }

    onRideStatusUpdated(callback) {
        if (this.socket) {
            this.socket.on('ride-status-updated', callback);
        }
    }

    onBookingStatusUpdated(callback) {
        if (this.socket) {
            this.socket.on('booking-status-updated', callback);
        }
    }

    onRideCompleted(callback) {
        if (this.socket) {
            this.socket.on('ride-completed', callback);
        }
    }

    onBookingCancelled(callback) {
        if (this.socket) {
            this.socket.on('booking-cancelled', callback);
        }
    }

    updateDriverLocation(driverId, location, rideId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('driver-location-update', { driverId, location, rideId });
        }
    }

    updateDriverStatus(driverId, status) {
        if (this.socket && this.isConnected) {
            this.socket.emit('driver-status-update', { driverId, status });
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    removeListener(eventName) {
        if (this.socket) {
            this.socket.off(eventName);
        }
    }
}

export default new SocketService();