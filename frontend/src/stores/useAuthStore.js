
import { create } from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/services/authService'


export const useAuthStore = create((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    setAccessToken: (accessToken) => {
        set({ accessToken });
    },

    clearState: () => {
        localStorage.removeItem('accessToken');
        set({ accessToken: null, user: null, loading: false })
    },


    signIn: async (username, password) => {
        try {
            set({ loading: true })
            const { accessToken, user } = await authService.signIn(username, password);
            get().setAccessToken(accessToken);

            await get().fetchMe();
            
            toast.success('Đăng nhập thành công')
        } catch (error) {
            console.error('Lỗi đăng nhập:', error)
            toast.error('Đăng nhập thất bại')
            throw error
        } finally {
            set({ loading: false })
        }
    },

    signOut: async () => {
        try {
            set({ loading: true })
            await authService.signOut()
            get().clearState()
            toast.success('Đăng xuất thành công')
        } catch (error) {
            console.error('Lỗi đăng xuất:', error)
            toast.error('Đăng xuất thất bại')
        }
    },

    fetchMe: async () => {
        try {
            set({ loading: true })
            const user = await authService.fetchMe()
            set({ user })
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error)
            set({ user: null, accessToken: null })
            toast.error('Lỗi xảy ra khi lấy dữ liệu người dùng.')
        } finally {
            set({ loading: false })
        }
    },

    refresh: async () => {
        try {
            set({ loading: true });
            const { user, fetchMe, setAccessToken} = get();
            const accessToken = await authService.refresh();

            setAccessToken(accessToken);

            if (!user) {
                await fetchMe();
            }
        } catch (error) {
            console.error('Lỗi khi làmi mới token:', error)
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
            get().clearState();
        } finally {
            set({ loading: false });
        }
    }
}))
 