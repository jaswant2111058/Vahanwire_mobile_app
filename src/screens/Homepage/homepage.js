import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getUserData, clearUserData } from '../../utils/storageData';
import { updateDriverStatus } from '../../services/rideBooking';
import socketService from '../../services/socketService';

const Homepage = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [userType, setUserType] = useState('user');
    const [driverStatus, setDriverStatus] = useState('offline');

    useEffect(() => {
        loadUserData();
        socketService.connect();
    }, []);

    const loadUserData = async () => {
        const user = await getUserData();
        if (user) {
            setUserData(user);
            setUserType(user.userType || 'user');
            if (user.userType === 'driver') {
                setDriverStatus(user.status || 'offline');
            }
        }
    };

    const handleDriverStatusToggle = async () => {
        if (userType !== 'driver' || !userData) return;

        const newStatus = driverStatus === 'online' ? 'offline' : 'online';
        
        try {
            const result = await updateDriverStatus(userData.id, { 
                status: newStatus,
                location: {
                    coordinates: [77.3648, 28.6139]
                }
            });

            if (result.success) {
                setDriverStatus(newStatus);
                socketService.updateDriverStatus(userData.id, newStatus);
                Alert.alert('Success', `You are now ${newStatus}`);
            } else {
                Alert.alert('Error', result.error?.message || 'Failed to update status');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };

    const handleLogout = async () => {
        await clearUserData();
        socketService.disconnect();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const renderUserInterface = () => (
        <View style={styles.userInterface}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('RideSearch')}
            >
                <Text style={styles.actionButtonText}>Book a Ride</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#8E44AD' }]}
                onPress={() => navigation.navigate('UserBookings')}
            >
                <Text style={styles.actionButtonText}>My Bookings</Text>
            </TouchableOpacity> */}
        </View>
    );

    const renderDriverInterface = () => (
        <View style={styles.driverInterface}>
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: driverStatus === 'online' ? '#4CAF50' : '#FF3B30' }
                ]}>
                    <Text style={styles.statusText}>{driverStatus.toUpperCase()}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    { backgroundColor: driverStatus === 'online' ? '#FF3B30' : '#4CAF50' }
                ]}
                onPress={handleDriverStatusToggle}
            >
                <Text style={styles.toggleButtonText}>
                    Go {driverStatus === 'online' ? 'Offline' : 'Online'}
                </Text>
            </TouchableOpacity>

            {driverStatus === 'online' && (
                <>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('DriverRides')}
                    >
                        <Text style={styles.actionButtonText}>Find Rides</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#8E44AD' }]}
                        onPress={() => navigation.navigate('DriverBookings')}
                    >
                        <Text style={styles.actionButtonText}>My Bookings</Text>
                    </TouchableOpacity> */}
                </>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    Welcome, {userData?.name || 'User'}!
                </Text>
                <Text style={styles.userTypeText}>
                    {userType === 'driver' ? 'Driver' : 'Passenger'}
                </Text>
            </View>

            <View style={styles.content}>
                {userType === 'driver' ? renderDriverInterface() : renderUserInterface()}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
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
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    userTypeText: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    userInterface: {
        flex: 1,
        justifyContent: 'center',
    },
    driverInterface: {
        flex: 1,
        paddingTop: 50,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    statusLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    statusIndicator: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleButton: {
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    actionButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        margin: 20,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Homepage;