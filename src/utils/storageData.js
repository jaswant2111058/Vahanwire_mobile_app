import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = 'userData';

export const saveUserData = async (userData) => {
    try {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
};

export const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

export const clearUserData = async () => {
    try {
        await AsyncStorage.removeItem(USER_DATA_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing user data:', error);
        return false;
    }
};

export const updateUserData = async (updates) => {
    try {
        const currentData = await getUserData();
        if (currentData) {
            const updatedData = { ...currentData, ...updates };
            await saveUserData(updatedData);
            return updatedData;
        }
        return null;
    } catch (error) {
        console.error('Error updating user data:', error);
        return null;
    }
};