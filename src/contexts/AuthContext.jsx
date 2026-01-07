import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from profiles table
    const fetchProfile = async (userId) => {
        if (!userId) {
            setProfile(null);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);

            // Handle password recovery - redirect to reset password page
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery detected, redirecting to /reset-password');
                window.location.href = '/reset-password';
                return;
            }

            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, fullName, metadata = {}) => {
        // Use window.location.origin to get the correct URL (localhost in dev, production URL when deployed)
        const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/login`
            : 'https://ctrl-c-lms-8f75.vercel.app/login';

        return supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: fullName,
                    ...metadata,
                },
            },
        });
    };

    const signIn = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signOut = async () => {
        return supabase.auth.signOut();
    };

    // Function to refresh profile data
    const refreshProfile = () => {
        if (user?.id) {
            fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, signUp, signIn, signOut, loading, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
