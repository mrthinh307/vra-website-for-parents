import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Supervisor {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    phone_numbers: string | null;
    relationship: string | null;
}

export class SupervisorService {
    private static supabase: SupabaseClient;
    private static instance: SupervisorService;

    private constructor() {
        if (!SupervisorService.supabase) {
            const supabaseUrl = 'https://inpsegawgmyrhkrbswpv.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHNlZ2F3Z215cmhrcmJzd3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDkzNzksImV4cCI6MjA2MzIyNTM3OX0.mD7Wxan8DhsjvmUWeSKOGuQkE1oOG2yNWyjGwGtLo4o';

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase URL or Key. Please check your environment variables.');
            }

            SupervisorService.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    public static getInstance(): SupervisorService {
        if (!SupervisorService.instance) {
            SupervisorService.instance = new SupervisorService();
        }
        return SupervisorService.instance;
    }

    public async getSupervisorByEmail(email: string): Promise<Supervisor | null> {
        try {
            const { data, error } = await SupervisorService.supabase
                .from('Supervisor')
                .select('id, email, name, avatar_url, phone_numbers, relationship')
                .eq('email', email)
                .single();

            if (error) {
                console.error('Error fetching supervisor:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getSupervisorByEmail:', error);
            return null;
        }
    }

    async updateSupervisor(supervisorId: string, updateData: {
        name?: string;
        email?: string;
        avatar_url?: string;
        phone_numbers?: string;
        relationship?: string;
    }): Promise<any> {
        try {
            console.log('Bắt đầu cập nhật thông tin supervisor:', updateData);
            
            const { data, error } = await SupervisorService.supabase
                .from('Supervisor')
                .update(updateData)
                .eq('id', supervisorId)
                .select()
                .single();

            if (error) {
                console.error('Lỗi khi cập nhật thông tin supervisor:', error);
                throw error;
            }

            if (!data) {
                throw new Error('Không tìm thấy thông tin supervisor để cập nhật');
            }

            console.log('Cập nhật thông tin supervisor thành công:', data);
            return data;
        } catch (error) {
            console.error('Lỗi chi tiết khi cập nhật thông tin supervisor:', error);
            throw error;
        }
    }
} 