import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createRide } from '../../services/rideBooking';
import socketService from '../../services/socketService';
import { getUserData } from '../../utils/storageData';

const RideSearch = ({ navigation }) => {
    const [fromAddress, setFromAddress] = useState('Noida Sector 62');
    const [toAddress, setToAddress] = useState('Delhi T1');
    const [customerMaxPrice, setCustomerMaxPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
        socketService.connect();
    }, []);

    const loadUserData = async () => {
        const user = await getUserData();
        setUserData(user);
    };

    const handleCreateRide = async () => {
        if (!fromAddress || !toAddress || !customerMaxPrice) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!userData) {
            Alert.alert('Error', 'User data not found');
            return;
        }

        setLoading(true);

        const rideData = {
            userId: userData.id,
            from: {
                address: fromAddress,
                coordinates: [77.3648, 28.6139]
            },
            to: {
                address: toAddress,
                coordinates: [77.1025, 28.5562]
            },
            distance: 45.5,
            estimatedDuration: 75,
            customerMaxPrice: parseFloat(customerMaxPrice)
        };

        try {
            const result = await createRide(rideData);

            console.log('Ride created:', result);
            
            if (result.success) {
                socketService.joinRoom(result.data.id, 'user', userData.id);
                navigation.navigate('BiddingScreen', { 
                    rideData: result.data 
                });
            } else {
                Alert.alert('Error', result.error?.message || 'Failed to create ride');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Book a Ride</Text>
            
            <View style={styles.inputContainer}>
                <Text style={styles.label}>From</Text>
                <TextInput
                    style={styles.input}
                    value={fromAddress}
                    onChangeText={setFromAddress}
                    placeholder="Pickup location"
                    placeholderTextColor={"#999"}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>To</Text>
                <TextInput
                    style={styles.input}
                    value={toAddress}
                    onChangeText={setToAddress}
                    placeholder="Destination"
                    placeholderTextColor={"#999"}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Maximum Price (₹)</Text>
                <TextInput
                    style={styles.input}
                    value={customerMaxPrice}
                    onChangeText={setCustomerMaxPrice}
                    placeholder="Enter max price you're willing to pay"
                    keyboardType="numeric"
                    placeholderTextColor={"#999"}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleCreateRide}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Creating Ride...' : 'Find Service'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
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
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default RideSearch;