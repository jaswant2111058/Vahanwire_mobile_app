import { GET, POST, PUT, DELETE } from "./index";

export const createUser = async (userData) => {
    try {
        const response = await POST('users', userData);
        return { success: true, data: response.user, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const createDriver = async (driverData) => {
    try {
        const response = await POST('drivers', driverData);
        return { success: true, data: response.driver, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const updateDriverStatus = async (driverId, statusData) => {
    try {
        const response = await PUT(`drivers/${driverId}/status`, statusData);
        return { success: true, data: response.driver, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const createRide = async (rideData) => {
    try {
        const response = await POST('rides', rideData);
        return { success: true, data: response.ride, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getAvailableRides = async (driverId) => {
    try {
        const response = await GET(`rides/available?driverId=${driverId}`);
        return { success: true, data: response.rides };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getRideDetails = async (rideId) => {
    try {
        const response = await GET(`rides/${rideId}`);
        return { success: true, data: response.ride };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const placeBid = async (bidData) => {
    try {
        const response = await POST('bidding/place', bidData);
        return { success: true, data: response.bid, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const acceptBid = async (bidData) => {
    try {
        const response = await POST('bidding/accept', bidData);
        return { success: true, data: response.booking, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getRideBids = async (rideId) => {
    try {
        const response = await GET(`bidding/ride/${rideId}`);
        return { success: true, data: response.bids };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getDriverBids = async (driverId) => {
    try {
        const response = await GET(`bidding/driver/${driverId}`);
        return { success: true, data: response.bids };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getUserBookings = async (userId) => {
    try {
        const response = await GET(`bidding/bookings/user/${userId}`);
        return { success: true, data: response.bookings };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getDriverBookings = async (driverId) => {
    try {
        const response = await GET(`bidding/bookings/driver/${driverId}`);
        return { success: true, data: response.bookings };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const updateBookingStatus = async (bookingId, statusData) => {
    try {
        const response = await PUT(`bidding/bookings/${bookingId}/status`, statusData);
        return { success: true, data: response.booking, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const cancelBooking = async (bookingId, reason) => {
    try {
        const response = await DELETE(`bidding/bookings/${bookingId}`, { reason });
        return { success: true, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const rateBooking = async (bookingId, ratingData) => {
    try {
        const response = await POST(`bidding/bookings/${bookingId}/rate`, ratingData);
        return { success: true, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};