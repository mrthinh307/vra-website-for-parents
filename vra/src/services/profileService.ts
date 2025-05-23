import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Interface cho dữ liệu chi tiết profile
export interface DetailedChildProfile {
    fullName: string;
    avatar: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    language: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    relationship: string;
}

// Interface cho dữ liệu trả về từ Supabase
interface DetailedChildProfileData {
    name: string;
    avatar_url: string;
    date_of_birth: string;
    Supervisor: {
        name: string;
        email: string;
    }[] | null;
}

// Interface cho thống kê học tập của trẻ
export interface ChildLearningStats {
    childName: string;
    age: number;
    totalSessions: number;
    averageScore: number;
    totalLearningTimeHours: number;
}

/**
 * Service quản lý thông tin profile của trẻ
 */
export class ProfileService {
    private static supabase: SupabaseClient;
    private static instance: ProfileService;

    private constructor() {
        if (!ProfileService.supabase) {
            const supabaseUrl = 'https://inpsegawgmyrhkrbswpv.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHNlZ2F3Z215cmhrcmJzd3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDkzNzksImV4cCI6MjA2MzIyNTM3OX0.mD7Wxan8DhsjvmUWeSKOGuQkE1oOG2yNWyjGwGtLo4o';

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase URL or Key. Please check your environment variables.');
            }

            ProfileService.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    public static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

     /**
     * Lấy thông tin chi tiết của trẻ và người giám hộ
     * @param supervisorId ID của supervisor
     * @returns Promise<DetailedChildProfile[]>
     */
     async getDetailedChildProfiles(supervisorId: string): Promise<DetailedChildProfile[]> {
        try {
            const { data, error } = await ProfileService.supabase
                .from('Child')
                .select(`
                    name,
                    avatar_url,
                    date_of_birth,
                    Supervisor:supervisor_id (
                        name,
                        email
                    )
                `)
                .eq('supervisor_id', supervisorId);

            if (error) throw error;
            if (!data) return [];

            return (data as DetailedChildProfileData[]).map(item => {
                const supervisor = Array.isArray(item.Supervisor) ? item.Supervisor[0] : item.Supervisor;
                const birthDate = new Date(item.date_of_birth);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();

                return {
                    fullName: item.name,
                    avatar: item.avatar_url,
                    age: age,
                    dateOfBirth: item.date_of_birth,
                    gender: 'male', // Default value as per SQL query
                    language: 'vietnamese', // Default value as per SQL query
                    guardianName: supervisor?.name || '',
                    guardianPhone: '0123456789', // Default value as per SQL query
                    guardianEmail: supervisor?.email || '',
                    relationship: 'parent' // Default value as per SQL query
                };
            });
        } catch (error) {
            console.error('Error fetching detailed child profiles:', error);
            throw error;
        }
    }
   
    /**
     * Lấy thống kê học tập của trẻ theo supervisor
     * @param supervisorId ID của supervisor
     * @returns Promise<ChildLearningStats[]>
     */
    async getChildLearningStats(supervisorId: string): Promise<ChildLearningStats[]> {
        try {
            const { data, error } = await ProfileService.supabase
                .rpc('get_child_learning_summary', {
                    supervisor_uuid: supervisorId
                });
            console.log("supervisorId", supervisorId);
            console.log("data", data);
            if (error) throw error;
            if (!data) return [];

            return data.map((item: any) => ({
                childName: item.child_name,
                age: item.age,
                totalSessions: item.total_sessions,
                averageScore: item.average_score,
                totalLearningTimeHours: item.total_learning_time_hours
            }));
        } catch (error) {
            console.error('Error fetching child learning stats:', error);
            throw error;
        }
    }
}