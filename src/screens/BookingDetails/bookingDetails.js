import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { updateBookingStatus } from '../../services/rideBooking';
import socketService from '../../services/socketService';
import { getUserData } from '../../utils/storageData';

const BookingDetails = ({ route, navigation }) => {
    const { bookingData } = route.params;
    const [booking, setBooking] = useState(bookingData);
    const [userData, setUserData] = useState(null);
    const [userType, setUserType] = useState('user');

    useEffect(() => {
        loadUserData();
        setupSocketListeners();

        return () => {
            socketService.removeAllListeners();
        };
    }, []);

    const loadUserData = async () => {
        const user = await getUserData();
        setUserData(user);
        setUserType(user.userType || 'user');
    };

    const setupSocketListeners = () => {
        socketService.onBookingStatusUpdated((data) => {
            if (data.bookingId === booking.id) {
                setBooking(prev => ({ ...prev, status: data.status, ...data }));
            }
        });

        socketService.onBookingCancelled((data) => {
            if (data.bookingId === booking.id) {
                Alert.alert('Booking Cancelled', data.reason || 'The booking has been cancelled');
                navigation.goBack();
            }
        });
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const result = await updateBookingStatus(booking.id, { status: newStatus });
            
            if (result.success) {
                setBooking(prev => ({ ...prev, status: newStatus, ...result.data }));
            } else {
                Alert.alert('Error', result.error?.message || 'Failed to update status');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };

    const handleCallDriver = () => {
        if (booking.driverPhone) {
            Linking.openURL(`tel:${booking.driverPhone}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#007AFF';
            case 'in-progress': return '#FF9500';
            case 'completed': return '#4CAF50';
            case 'cancelled': return '#FF3B30';
            default: return '#666';
        }
    };

    const renderDriverActions = () => {
        if (userType !== 'driver') return null;

        return (
            <View style={styles.actionsContainer}>
                {booking.status === 'confirmed' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                        onPress={() => handleStatusUpdate('in-progress')}
                    >
                        <Text style={styles.actionButtonText}>Start Ride</Text>
                    </TouchableOpacity>
                )}

                {booking.status === 'in-progress' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleStatusUpdate('completed')}
                    >
                        <Text style={styles.actionButtonText}>Complete Ride</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderUserActions = () => {
        if (userType !== 'user') return null;

        return (
            <View style={styles.actionsContainer}>
                {booking.driverPhone && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                        onPress={handleCallDriver}
                    >
                        <Text style={styles.actionButtonText}>Call Driver</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Booking Details</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.bookingCard}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ride Information</Text>
                    <Text style={styles.routeText}>
                        From: {booking.ride?.from?.address || 'N/A'}
                    </Text>
                    <Text style={styles.routeText}>
                        To: {booking.ride?.to?.address || 'N/A'}
                    </Text>
                </View>

                {userType === 'user' && booking.driver && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Driver Details</Text>
                        <Text style={styles.detailText}>Name: {booking.driverName}</Text>
                        <Text style={styles.detailText}>Phone: {booking.driverPhone}</Text>
                        {booking.vehicleDetails && (
                            <>
                                <Text style={styles.detailText}>
                                    Vehicle: {booking.vehicleDetails.model}
                                </Text>
                                <Text style={styles.detailText}>
                                    Number: {booking.vehicleDetails.number}
                                </Text>
                            </>
                        )}
                    </View>
                )}

                {userType === 'driver' && booking.user && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Customer Details</Text>
                        <Text style={styles.detailText}>Name: {booking.user.name}</Text>
                        <Text style={styles.detailText}>Phone: {booking.user.phone}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <Text style={styles.priceText}>Amount: ₹{booking.finalAmount}</Text>
                    <Text style={styles.detailText}>
                        Payment Status: {booking.paymentStatus || 'pending'}
                    </Text>
                </View>

                {booking.startTime && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Timing</Text>
                        <Text style={styles.detailText}>
                            Started: {new Date(booking.startTime).toLocaleString()}
                        </Text>
                        {booking.endTime && (
                            <Text style={styles.detailText}>
                                Completed: {new Date(booking.endTime).toLocaleString()}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {renderDriverActions()}
            {renderUserActions()}

            {booking.status === 'completed' && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#8E44AD', margin: 20 }]}
                    onPress={() => navigation.navigate('RateRide', { bookingData: booking })}
                >
                    <Text style={styles.actionButtonText}>Rate This Ride</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bookingCard: {
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    section: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    routeText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    detailText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 5,
    },
    actionsContainer: {
        padding: 20,
    },
    actionButton: {
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BookingDetails;