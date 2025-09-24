import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';

export const BASE_URL = __DEV__ ? "http://192.168.0.109:6600/api" : "https://vahanwire-server.onrender.com/api";
export const SOCKET_URL = __DEV__ ? "http://192.168.0.109:6600" : "https://vahanwire-server.onrender.com";


export const getUser = async () => {
    try {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};



const createHeaders = async (customHeaders = {}) => {
    try {
        const user = await getUser();

        return {
            'Content-Type': 'application/json',
            ...(user?.accessToken && !customHeaders.Authorization && { 'Authorization': `Bearer ${user.accessToken}` }),
            ...customHeaders
        };
    } catch (error) {
        console.error('Error creating headers:', error);
    }
};



const handleError = (error) => {
    const errorMessage = error?.response?.data.message || error?.message || 'An error occurred';
    showToast(errorMessage);
    console.error('API Error:', errorMessage);
    throw error;
};



export const GET = async (param, headers = {}) => {
    try {
        const finalHeaders = await createHeaders(headers);
        const res = await axios.get(`${BASE_URL}/${param}`, {
            headers: finalHeaders
        });
        return res.data;
    } catch (error) {
        return handleError(error);
    }
};



export const POST = async (param, payload = {}, headers = {}) => {
    try {
        const finalHeaders = await createHeaders(headers);

        const url = `${BASE_URL}/${param}`

        console.log({url, payload})

        const res = await axios.post(`${BASE_URL}/${param}`, payload, {
            headers: finalHeaders
        });
        return res.data;
    } catch (error) {
        return handleError(error);
    }
};



export const PUT = async (param, payload = {}, headers = {}) => {
    try {
        const finalHeaders = await createHeaders(headers);
        const res = await axios.put(`${BASE_URL}/${param}`, payload, {
            headers: finalHeaders
        });
        return res.data;
    } catch (error) {
        return handleError(error);
    }
};



export const DELETE = async (param, payload = {}, headers = {}) => {
    try {
        const finalHeaders = await createHeaders(headers);
        const res = await axios.delete(`${BASE_URL}/${param}`, {
            headers: finalHeaders,
            data: payload
        });
        return res.data;
    } catch (error) {
        return handleError(error);
    }
};



export default {
    GET,
    POST,
    PUT,
    DELETE
};