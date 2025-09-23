import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getRideBids, acceptBid } from '../../services/rideBooking';
import socketService from '../../services/socketService';
import { getUserData } from '../../utils/storageData';

const BiddingScreen = ({ route, navigation }) => {
    const { rideData } = route.params;
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(600);

    useEffect(() => {
        loadUserData();
        loadBids();
        setupSocketListeners();
        startTimer();

        return () => {
            socketService.removeAllListeners();
        };
    }, []);

    const loadUserData = async () => {
        const user = await getUserData();
        setUserData(user);
    };

    const loadBids = async () => {
        const result = await getRideBids(rideData.id);

        console.log('Bids fetched:', result);

        if (result.success) {
            setBids(result.data);
        }
    };

    const setupSocketListeners = () => {
        socketService.onNewBid((bidData) => {
            setBids(prevBids => [...prevBids, bidData].sort((a, b) => a.bidAmount - b.bidAmount));
        });

        socketService.onBidUpdated((bidData) => {
            setBids(prevBids => 
                prevBids.map(bid => 
                    bid.bidId === bidData.bidId ? bidData : bid
                ).sort((a, b) => a.bidAmount - b.bidAmount)
            );
        });

        socketService.onBidAccepted((data) => {
            Alert.alert(
                'Booking Confirmed!',
                `Your ride has been confirmed with ${data.driverName}`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('BookingDetails', { bookingData: data })
                    }
                ]
            );
        });
    };

    const startTimer = () => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    Alert.alert('Bidding Ended', 'The bidding time has expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAcceptBid = async (bid) => {
        if (!userData) {
            Alert.alert('Error', 'User data not found');
            return;
        }

        setLoading(true);

        try {
            const result = await acceptBid({
                bidId: bid.id,
                userId: userData.id
            });

            if (result.success) {
                Alert.alert(
                    'Success',
                    result.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('BookingDetails', { 
                                bookingData: result.data 
                            })
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.error?.message || 'Failed to accept bid');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderBidItem = ({ item }) => (
        <View style={[styles.bidItem, item.isWinning && styles.winningBid]}>
            <View style={styles.bidHeader}>
                <Text style={styles.driverName}>{item.driverName}</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>★ {item.rating}</Text>
                </View>
            </View>
            
            <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleText}>
                    {item.vehicleDetails.model} - {item.vehicleDetails.number}
                </Text>
            </View>

            <View style={styles.bidDetails}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Bid Amount</Text>
                    <Text style={styles.price}>₹{item.bidAmount}</Text>
                </View>
                
                <View style={styles.arrivalContainer}>
                    <Text style={styles.arrivalLabel}>Arrival Time</Text>
                    <Text style={styles.arrival}>{item.estimatedArrival} min</Text>
                </View>
            </View>

            {item.message && (
                <Text style={styles.message}>{item.message}</Text>
            )}

            <TouchableOpacity
                style={[styles.acceptButton, loading && styles.buttonDisabled]}
                onPress={() => handleAcceptBid(item)}
                disabled={loading}
            >
                <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>

            {item.isWinning && (
                <View style={styles.winningBadge}>
                    <Text style={styles.winningText}>Lowest Bid</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Available Bids</Text>
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>Time Left: {formatTime(timeLeft)}</Text>
                </View>
            </View>

            <View style={styles.rideInfo}>
                <Text style={styles.route}>{rideData.from.address} → {rideData.to.address}</Text>
                <Text style={styles.maxPrice}>Your Max Price: ₹{rideData.customerMaxPrice}</Text>
            </View>

            {bids.length === 0 ? (
                <View style={styles.noBidsContainer}>
                    <Text style={styles.noBidsText}>Waiting for drivers to bid...</Text>
                </View>
            ) : (
                <FlatList
                    data={bids}
                    renderItem={renderBidItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
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
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    rideInfo: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
    },
    route: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    maxPrice: {
        fontSize: 14,
        color: '#666',
    },
    noBidsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noBidsText: {
        fontSize: 16,
        color: '#666',
    },
    bidItem: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    winningBid: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    bidHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    ratingContainer: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
    },
    vehicleInfo: {
        marginBottom: 10,
    },
    vehicleText: {
        fontSize: 14,
        color: '#666',
    },
    bidDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    priceContainer: {
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    arrivalContainer: {
        alignItems: 'center',
    },
    arrivalLabel: {
        fontSize: 12,
        color: '#666',
    },
    arrival: {
        fontSize: 16,
        fontWeight: '600',
    },
    message: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        marginBottom: 10,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    winningBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    winningText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default BiddingScreen;