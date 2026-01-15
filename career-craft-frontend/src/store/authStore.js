// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            rememberMe: true,

            // Actions
            login: (userData, token, rememberMe = true) => {
                set({
                    user: userData,
                    token: token,
                    isAuthenticated: true,
                    isLoading: false,
                    rememberMe: rememberMe
                });
                
                // If rememberMe is false, move auth data to sessionStorage
                if (!rememberMe) {
                    const authData = {
                        user: userData,
                        token: token,
                        isAuthenticated: true
                    };
                    sessionStorage.setItem('auth-session', JSON.stringify(authData));
                    localStorage.removeItem('auth-storage');
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    rememberMe: false
                });
                // Clear both storage types
                localStorage.removeItem('auth-storage');
                sessionStorage.removeItem('auth-session');
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            updateUser: (userData) => {
                const currentUser = get().user;
                set({ user: { ...currentUser, ...userData } });
            },

            // Initialize auth from token
            initializeAuth: async() => {
                const state = get();
                
                // If already authenticated and user exists, no need to re-initialize
                if (state.isAuthenticated && state.user && state.token) {
                    set({ isLoading: false });
                    return;
                }

                // Check sessionStorage first (for non-persistent sessions)
                const sessionData = sessionStorage.getItem('auth-session');
                if (sessionData) {
                    try {
                        const { user, token, isAuthenticated } = JSON.parse(sessionData);
                        if (token && user) {
                            set({
                                user,
                                token,
                                isAuthenticated: true,
                                rememberMe: false,
                                isLoading: false
                            });
                            return;
                        }
                    } catch (error) {
                        sessionStorage.removeItem('auth-session');
                    }
                }

                // Check localStorage (persistent storage from Zustand persist)
                const { token } = state;
                if (token) {
                    try {
                        set({ isLoading: true });
                        const response = await fetch('http://localhost:5000/api/auth2/me', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            set({
                                user: data.data.user,
                                isAuthenticated: true,
                                isLoading: false
                            });
                        } else {
                            // Token invalid, clear auth silently
                            set({
                                user: null,
                                token: null,
                                isAuthenticated: false,
                                isLoading: false
                            });
                            localStorage.removeItem('auth-storage');
                        }
                    } catch (error) {
                        console.error('Auth initialization failed:', error);
                        // Don't logout on network error, keep existing state
                        set({ isLoading: false });
                    }
                } else {
                    set({ isLoading: false });
                }
            }
        }), {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;