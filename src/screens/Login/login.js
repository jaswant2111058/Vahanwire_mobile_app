import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUser, createDriver } from '../../services/rideBooking';
import { saveUserData } from '../../utils/storageData';

const Login = ({ navigation }) => {
    const [userType, setUserType] = useState('user');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        vehicleModel: '',
        vehicleNumber: '',
        vehicleType: 'sedan'
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.phone) {
            Alert.alert('Error', 'Please fill all required fields');
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            let result;

            if (userType === 'user') {
                result = await createUser({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    avatar: 'blue'
                });
            } else {
                result = await createDriver({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    licenseNumber: formData.licenseNumber,
                    vehicleDetails: {
                        model: formData.vehicleModel,
                        number: formData.vehicleNumber,
                        type: formData.vehicleType
                    }
                });
            }

            if (result.success) {
                const userData = {
                    ...result.data,
                    userType: userType
                };
                
                await saveUserData(userData);
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Homepage' }],
                });
            } else {
                Alert.alert('Error', result.error?.message || 'Login failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const renderUserForm = () => (
        <View style={styles.form}>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={"#999"}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={"#999"}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={"#999"}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
            />
        </View>
    );

    const renderDriverForm = () => (
        <View style={styles.form}>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={"#999"}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                placeholderTextColor={"#999"}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={"#999"}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
            />
            {/* <TextInput
                style={styles.input}
                placeholder="License Number"
                value={formData.licenseNumber}
                onChangeText={(value) => handleInputChange('licenseNumber', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Vehicle Model"
                value={formData.vehicleModel}
                onChangeText={(value) => handleInputChange('vehicleModel', value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Vehicle Number"
                value={formData.vehicleNumber}
                onChangeText={(value) => handleInputChange('vehicleNumber', value)}
                autoCapitalize="characters"
            /> */}
            
            <View style={styles.vehicleTypeContainer}>
                <Text style={styles.vehicleTypeLabel}>Vehicle Type:</Text>
                <View style={styles.vehicleTypeButtons}>
                    {['sedan', 'hatchback', 'suv', 'luxury'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.vehicleTypeButton,
                                formData.vehicleType === type && styles.selectedVehicleType
                            ]}
                            onPress={() => handleInputChange('vehicleType', type)}
                        >
                            <Text style={[
                                styles.vehicleTypeText,
                                formData.vehicleType === type && styles.selectedVehicleTypeText
                            ]}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ride Booking App</Text>
                <Text style={styles.subtitle}>Join as a {userType}</Text>
            </View>

            <View style={styles.userTypeSelector}>
                <TouchableOpacity
                    style={[
                        styles.userTypeButton,
                        userType === 'user' && styles.selectedUserType
                    ]}
                    onPress={() => setUserType('user')}
                >
                    <Text style={[
                        styles.userTypeText,
                        userType === 'user' && styles.selectedUserTypeText
                    ]}>
                        User
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.userTypeButton,
                        userType === 'driver' && styles.selectedUserType
                    ]}
                    onPress={() => setUserType('driver')}
                >
                    <Text style={[
                        styles.userTypeText,
                        userType === 'driver' && styles.selectedUserTypeText
                    ]}>
                        Service Provider
                    </Text>
                </TouchableOpacity>
            </View>

            {userType === 'user' ? renderUserForm() : renderDriverForm()}

            <TouchableOpacity
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.loginButtonText}>
                    {loading ? 'Creating Account...' : 'Get Started'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    userTypeSelector: {
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5,
    },
    userTypeButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    selectedUserType: {
        backgroundColor: '#007AFF',
    },
    userTypeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    selectedUserTypeText: {
        color: '#fff',
    },
    form: {
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        
    },
    vehicleTypeContainer: {
        marginTop: 10,
    },
    vehicleTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    vehicleTypeButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    vehicleTypeButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    selectedVehicleType: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    vehicleTypeText: {
        fontSize: 14,
        color: '#666',
    },
    selectedVehicleTypeText: {
        color: '#fff',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default Login;