import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { placeBid } from '../../services/rideBooking';
import socketService from '../../services/socketService';
import { getUserData } from '../../utils/storageData';

const MakeOffer = ({ route, navigation }) => {
    const { rideData } = route.params;
    const [bidAmount, setBidAmount] = useState('');
    const [message, setMessage] = useState('');
    const [estimatedArrival, setEstimatedArrival] = useState('');
    const [loading, setLoading] = useState(false);
    const [driverData, setDriverData] = useState(null);

    useEffect(() => {
        loadDriverData();
        setBidAmount(rideData.basePrice.toString());
        setEstimatedArrival('5');
    }, []);

    const loadDriverData = async () => {
        const driver = await getUserData();
        setDriverData(driver);
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || !estimatedArrival) {
            Alert.alert('Error', 'Please fill bid amount and arrival time');
            return;
        }

        if (!driverData) {
            Alert.alert('Error', 'Driver data not found');
            return;
        }

        const bidAmountNum = parseFloat(bidAmount);

        if (bidAmountNum > rideData.customerMaxPrice) {
            Alert.alert('Error', `Bid amount cannot exceed customer's maximum price of ₹${rideData.customerMaxPrice}`);
            return;
        }

        if (bidAmountNum < rideData.basePrice * 0.5) {
            Alert.alert('Error', 'Bid amount is too low');
            return;
        }

        setLoading(true);

        const bidData = {
            rideId: rideData.id,
            driverId: driverData.id,
            bidAmount: bidAmountNum,
            message: message,
            estimatedArrival: parseInt(estimatedArrival)
        };

        try {
            const result = await placeBid(bidData);
            
            if (result.success) {
                Alert.alert(
                    'Success',
                    'Your bid has been placed successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.error?.message || 'Failed to place bid');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Make an Offer</Text>
            </View>

            <View style={styles.rideInfo}>
                <Text style={styles.userName}>{rideData.userName}</Text>
                <Text style={styles.route}>
                    {rideData.from.address} → {rideData.to.address}
                </Text>
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Base Price: ₹{rideData.basePrice}</Text>
                    <Text style={styles.priceLabel}>Max Price: ₹{rideData.customerMaxPrice}</Text>
                </View>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Your Bid Amount (₹)</Text>
                    <TextInput
                        style={styles.input}
                        value={bidAmount}
                        onChangeText={setBidAmount}
                        placeholder="Enter your bid amount"
                        placeholderTextColor={"#999"}
                        keyboardType="numeric"
                    />
                    <Text style={styles.helperText}>
                        Must be between ₹{Math.round(rideData.basePrice * 0.5)} and ₹{rideData.customerMaxPrice}
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Estimated Arrival Time (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={estimatedArrival}
                        onChangeText={setEstimatedArrival}
                        placeholder="Enter arrival time in minutes"
                        keyboardType="numeric"
                        placeholderTextColor={"#999"}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Message (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Add a message for the customer"
                        multiline
                        numberOfLines={3}
                        placeholderTextColor={"#999"}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.bidButton, loading && styles.buttonDisabled]}
                    onPress={handlePlaceBid}
                    disabled={loading}
                >
                    <Text style={styles.bidButtonText}>
                        {loading ? 'Placing Bid...' : 'Offer Price'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    rideInfo: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    route: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    priceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    form: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    messageInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    bidButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    bidButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default MakeOffer;