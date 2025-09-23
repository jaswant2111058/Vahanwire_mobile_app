import { GET, POST, DELETE, PUT } from ".";

// User Management
export const createUser = async (userData) => {
    try {
        const response = await POST('api/users', userData);
        return { success: true, data: response.user, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getUserProfile = async (userId) => {
    try {
        const response = await GET(`api/users/${userId}`);
        return { success: true, data: response.user };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const updateUserProfile = async (userId, userData) => {
    try {
        const response = await PUT(`api/users/${userId}`, userData);
        return { success: true, data: response.user, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Ride Management
export const createRide = async (rideData) => {
    try {
        const response = await POST('api/rides', rideData);
        return { success: true, data: response.ride, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getAvailableRides = async (driverId = null) => {
    try {
        const queryParams = driverId ? `?driverId=${driverId}` : '';
        const response = await GET(`api/rides/available${queryParams}`);
        return { success: true, data: response.rides };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getRideDetails = async (rideId) => {
    try {
        const response = await GET(`api/rides/${rideId}`);
        return { success: true, data: response.ride };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getUserRides = async (userId, status = null) => {
    try {
        const queryParams = status ? `?status=${status}` : '';
        const response = await GET(`api/rides/user/${userId}${queryParams}`);
        return { success: true, data: response.rides };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const updateRideStatus = async (rideId, status) => {
    try {
        const response = await PUT(`api/rides/${rideId}/status`, { status });
        return { success: true, data: response.ride, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Driver Management (for user interface)
export const getNearbyDrivers = async (longitude, latitude, maxDistance = 10000) => {
    try {
        const response = await GET(`api/drivers/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`);
        return { success: true, data: response.drivers };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getDriverProfile = async (driverId) => {
    try {
        const response = await GET(`api/drivers/${driverId}`);
        return { success: true, data: response.driver };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Bidding System - User Functions
export const getRideBids = async (rideId) => {
    try {
        const response = await GET(`api/bidding/ride/${rideId}`);
        return { success: true, data: response.bids };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const acceptBid = async (bidId, userId) => {
    try {
        const response = await POST('api/bidding/accept', { bidId, userId });
        return { success: true, data: response.booking, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Driver Functions
export const createDriver = async (driverData) => {
    try {
        const response = await POST('api/drivers', driverData);
        return { success: true, data: response.driver, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const updateDriverStatus = async (driverId, status, location = null) => {
    try {
        const requestData = { status };
        if (location) requestData.location = location;
        
        const response = await PUT(`api/drivers/${driverId}/status`, requestData);
        return { success: true, data: response.driver, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const placeBid = async (bidData) => {
    try {
        const response = await POST('api/bidding/place', bidData);
        return { success: true, data: response.bid, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getDriverBids = async (driverId, status = null) => {
    try {
        const queryParams = status ? `?status=${status}` : '';
        const response = await GET(`api/bidding/driver/${driverId}${queryParams}`);
        return { success: true, data: response.bids };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Booking Management
export const getAllBookings = async (status = null, paymentStatus = null) => {
    try {
        const queryParams = new URLSearchParams();
        if (status) queryParams.append('status', status);
        if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
        
        const queryString = queryParams.toString();
        const response = await GET(`api/bidding/bookings${queryString ? `?${queryString}` : ''}`);
        return { success: true, data: response.bookings, totalBookings: response.totalBookings };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getUserBookings = async (userId, status = null) => {
    try {
        const queryParams = status ? `?status=${status}` : '';
        const response = await GET(`api/bidding/bookings/user/${userId}${queryParams}`);
        return { success: true, data: response.bookings };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const getDriverBookings = async (driverId, status = null) => {
    try {
        const queryParams = status ? `?status=${status}` : '';
        const response = await GET(`api/bidding/bookings/driver/${driverId}${queryParams}`);
        return { success: true, data: response.bookings };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const updateBookingStatus = async (bookingId, status) => {
    try {
        const response = await PUT(`api/bidding/bookings/${bookingId}/status`, { status });
        return { success: true, data: response.booking, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const cancelBooking = async (bookingId, reason = null) => {
    try {
        const requestData = {};
        if (reason) requestData.reason = reason;
        
        const response = await DELETE(`api/bidding/bookings/${bookingId}`, requestData);
        return { success: true, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

export const rateBooking = async (bookingId, rating, feedback, ratedBy) => {
    try {
        const response = await POST(`api/bidding/bookings/${bookingId}/rate`, {
            rating,
            feedback,
            ratedBy
        });
        return { success: true, message: response.message };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Search and Filter Functions
export const searchRides = async (params) => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.from) queryParams.append('from', params.from);
        if (params?.to) queryParams.append('to', params.to);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.userId) queryParams.append('userId', params.userId);
        if (params?.driverId) queryParams.append('driverId', params.driverId);

        const response = await GET(`api/rides/available?${queryParams.toString()}`);
        return { success: true, data: response.rides };
    } catch (error) {
        return { success: false, error: error?.response?.data };
    }
};

// Price Calculation Helper
export const calculateRidePrice = (distance, duration, vehicleType = 'sedan') => {
    const pricingConfig = {
        sedan: { baseFare: 50, perKmRate: 12, perMinuteRate: 2 },
        hatchback: { baseFare: 40, perKmRate: 10, perMinuteRate: 1.5 },
        suv: { baseFare: 70, perKmRate: 15, perMinuteRate: 2.5 },
        luxury: { baseFare: 100, perKmRate: 20, perMinuteRate: 3 }
    };

    const config = pricingConfig[vehicleType] || pricingConfig.sedan;
    const basePrice = config.baseFare + (distance * config.perKmRate) + (duration * config.perMinuteRate);
    
    return {
        basePrice: Math.round(basePrice),
        suggestedMaxPrice: Math.round(basePrice * 1.5),
        minPrice: Math.round(basePrice * 0.7)
    };
};