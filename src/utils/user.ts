// src/utils/User.ts
import axios, { AxiosResponse } from 'axios';

// Define interfaces
interface LoginRequest {
    phoneNumber: string;
    password: string;
}

interface LoginResponse {
    code: number;
    result: {
        token: string;
        authenticated: boolean;
    };
}

interface UserResponse {
    id: number;
    name: string | null;
    phone_number: string;
    email: string;
    password: string; // Note: Consider excluding this for security
    age: number | null;
    height: number | null;
    weight: number | null;
    role_id: number | null;
    is_active: boolean;
    description: string | null;
}

// API base URL
const API_URL = 'http://localhost:8080/gym';

// LocalStorage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_response';

// Login function
export const login = async (phoneNumber: string, password: string): Promise<LoginResponse> => {
    try {
        // Call login API
        const loginResponse: AxiosResponse<LoginResponse> = await axios.post(`${API_URL}/auth/login`, {
            phoneNumber,
            password,
        } as LoginRequest, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000',
                'Accept-Language': 'vi',
            },
            withCredentials: true,
        });

        if (loginResponse.data.code === 0 && loginResponse.data.result.authenticated) {
            const token = loginResponse.data.result.token;
            localStorage.setItem(TOKEN_KEY, token);

            // Fetch user details
            let userResponse: UserResponse;
            try {
                const userDetailResponse: AxiosResponse<{ code: number; result: UserResponse }> = await axios.get(
                    `${API_URL}/api/v1/users/myInfo`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept-Language': 'vi',
                        },
                    }
                );
                if (userDetailResponse.data.code === 0) {
                    userResponse = userDetailResponse.data.result;
                } else {
                    throw new Error('Failed to fetch user details');
                }
            } catch (error) {
                console.warn('Failed to fetch user details, using mock UserResponse:', error);
                userResponse = {
                    id: 0,
                    name: null,
                    phone_number: phoneNumber,
                    email: '',
                    password: '',
                    age: null,
                    height: null,
                    weight: null,
                    role_id: null,
                    is_active: false,
                    description: null,
                };
            }

            saveUserResponseToLocalStorage(userResponse);
        }

        return loginResponse.data;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Login failed. Please check your credentials.');
    }
};

// Logout function
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Get token from localStorage
export const getTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Get token from localStorage
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Save UserResponse to localStorage
export const saveUserResponseToLocalStorage = (userResponse?: UserResponse): void => {
    try {
        if (!userResponse) return;
        const userResponseJSON = JSON.stringify(userResponse);
        localStorage.setItem(USER_KEY, userResponseJSON);
        console.log('User response saved to localStorage:', userResponse);
    } catch (error) {
        console.error('Error saving user response to localStorage:', error);
    }
};

// Get UserResponse from localStorage
export const getUserResponseFromLocalStorage = (): UserResponse | null => {
    try {
        const userResponseJSON = localStorage.getItem(USER_KEY);
        if (!userResponseJSON) return null;
        return JSON.parse(userResponseJSON);
    } catch (error) {
        console.error('Error getting user response from localStorage:', error);
        return null;
    }
};

export const getUserId = (): number | null => {
    const userResponse = getUserResponseFromLocalStorage();
    return userResponse ? userResponse.id : null;
};

// Remove UserResponse from localStorage
export const removeUserResponseFromLocalStorage = (): void => {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error removing user response from localStorage:', error);
    }
};