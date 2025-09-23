import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAvailableRides } from '../../services/rideBooking';
import socketService from '../../services/socketService';
import { getUserData } from '../../utils/storageData';

const DriverRides = ({ navigation }) => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [driverData, setDriverData] = useState(null);

    useEffect(() => {
        loadDriverData();
        socketService.connect();
        setupSocketListeners();

        return () => {
            socketService.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        if (driverData) {
            loadAvailableRides();
        }
    }, [driverData]);

    const loadDriverData = async () => {
        const driver = await getUserData();
        setDriverData(driver);
    };

    const loadAvailableRides = async () => {
        if (!driverData) return;

        setLoading(true);
        const result = await getAvailableRides(driverData.id);
        if (result.success) {
            setRides(result.data);
        }
        setLoading(false);
    };

    const setupSocketListeners = () => {
        socketService.onNewRide((rideData) => {
            setRides(prevRides => [rideData, ...prevRides]);
        });

        socketService.onRideCompleted((data) => {
            setRides(prevRides => prevRides.filter(ride => ride.rideId !== data.rideId));
        });

        socketService.onBidAccepted((data) => {
            if (data.driverId === driverData?.id) {
                Alert.alert(
                    'Congratulations!',
                    'Your bid has been accepted!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('BookingDetails', { bookingData: data })
                        }
                    ]
                );
                setRides(prevRides => prevRides.filter(ride => ride.rideId !== data.rideId));
            }
        });
    };

    const handleMakeOffer = (ride) => {
        navigation.navigate('MakeOffer', { rideData: ride });
    };

    const renderRideItem = ({ item }) => (
        <View style={styles.rideItem}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.userAvatar) }]}>
                    <Text style={styles.avatarText}>{item.userName[0]}</Text>
                </View>
                <Text style={styles.userName}>{item.userName}</Text>
            </View>

            <View style={styles.routeContainer}>
                <Text style={styles.routeText}>
                    {item.from.address} → {item.to.address}
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Base Price</Text>
                    <Text style={styles.basePrice}>₹{item.basePrice}</Text>
                </View>
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Max Price</Text>
                    <Text style={styles.maxPrice}>₹{item.customerMaxPrice}</Text>
                </View>
            </View>

            <View style={styles.rideDetails}>
                <Text style={styles.detail}>Distance: {item.distance} km</Text>
                <Text style={styles.detail}>Duration: {item.estimatedDuration} min</Text>
            </View>

            <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Bidding ends in:</Text>
                <Text style={styles.timeValue}>
                    {getTimeRemaining(item.biddingEndTime)}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.offerButton, item.hasBid && styles.alreadyBid]}
                onPress={() => handleMakeOffer(item)}
                disabled={item.hasBid}
            >
                <Text style={styles.offerButtonText}>
                    {item.hasBid ? 'Bid Placed' : 'Make Offer'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const getAvatarColor = (color) => {
        const colors = {
            yellow: '#FFD700',
            blue: '#007AFF',
            green: '#4CAF50',
            red: '#FF3B30',
            purple: '#8E44AD'
        };
        return colors[color] || colors.blue;
    };

    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = Math.max(0, end - now);
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Available Rides</Text>
                <TouchableOpacity onPress={loadAvailableRides} style={styles.refreshButton}>
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading rides...</Text>
                </View>
            ) : rides.length === 0 ? (
                <View style={styles.noRidesContainer}>
                    <Text style={styles.noRidesText}>No rides available for bidding</Text>
                </View>
            ) : (
                <FlatList
                    data={rides}
                    renderItem={renderRideItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={loadAvailableRides}
                />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    refreshButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    refreshText: {
        color: '#fff',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    noRidesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noRidesText: {
        fontSize: 16,
        color: '#666',
    },
    rideItem: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    routeContainer: {
        marginBottom: 15,
    },
    routeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    priceInfo: {
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    basePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    maxPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    rideDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    detail: {
        fontSize: 14,
        color: '#666',
    },
    timeInfo: {
        alignItems: 'center',
        marginBottom: 15,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
    },
    timeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    offerButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    alreadyBid: {
        backgroundColor: '#ccc',
    },
    offerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default DriverRides;