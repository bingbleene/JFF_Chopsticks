import api from '@/lib/axios';

export const authService = {
    signIn: async (username, password) => {
        const res = await api.post('/auth/sign-in', { username, password }, { withCredentials: true });
        return res.data;
    },

    signOut: async () => {
        await api.post('/auth/sign-out', {}, { withCredentials: true });
    },

    fetchMe: async () => {
        const res = await api.get('/users/me', { withCredentials: true });
        return res.data.user;
    },

    refresh: async () => {
        const res = await api.post('auth/refresh-token', {}, { withCredentials: true });
        return res.data.accessToken;
    }
}