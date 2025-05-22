import { createClient, SupabaseClient } from '@supabase/supabase-js';

export enum DifficultyLevel {
    NORMAL = 'normal',
    EASY = 'easy',
    HARD = 'hard'
}

export enum LessonStatus {
    COMPLETED = 'completed',
    IN_PROGRESS = 'in_progress',
    NEW = 'new'
}

// Interface cho dữ liệu hiển thị trên UI
export interface LessonListItem {
    id: number;               
    device: string;           
    date: string;            
    title: string;           
    level: string;           
    status: string;          
}

// Interface cho dữ liệu trả về từ Supabase
interface LessonProgressWithLesson {
    id: number;
    child_device_profile_id: number;
    started_at: string;
    status: string;
    lessons: {
        title: string;
        difficulty_level: string;
    };
}

/**
 * Service quản lý danh sách bài học
 */
export class LessonListService {
    private static supabase: SupabaseClient;
    private static instance: LessonListService;

    private constructor() {
        if (!LessonListService.supabase) {
            const supabaseUrl = 'https://inpsegawgmyrhkrbswpv.supabase.co'
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHNlZ2F3Z215cmhrcmJzd3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDkzNzksImV4cCI6MjA2MzIyNTM3OX0.mD7Wxan8DhsjvmUWeSKOGuQkE1oOG2yNWyjGwGtLo4o';

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase URL or Key. Please check your environment variables.');
            }

            LessonListService.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    public static getInstance(): LessonListService {
        if (!LessonListService.instance) {
            LessonListService.instance = new LessonListService();
        }
        return LessonListService.instance;
    }

    async getLessonList(supervisorId: string, status?: string): Promise<LessonListItem[]> {
        try {
            let query = LessonListService.supabase
                .from('lesson_progress')
                .select(`
                    id,
                    device_profile_id,
                    started_at,
                    status,
                    lessons!inner (
                        title,
                        difficulty_level
                    ),
                    Device_Profile!inner (
                        id,
                        Child!inner (
                            Supervisor!inner (
                                id
                            )
                        )
                    )
                `)
                .eq('Device_Profile.Child.Supervisor.id', supervisorId);

            // Thêm điều kiện lọc theo status nếu có
            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            const { data, error } = await query.order('started_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data.map((item: any) => ({
                id: item.id,
                device: `device_${item.device_profile_id.toString().padStart(2, '0')}`,
                date: new Date(item.started_at).toLocaleDateString('vi-VN'),
                title: item.lessons?.title || 'Không có tiêu đề',
                level: item.lessons?.difficulty_level || 'Không xác định',
                status: item.status
            }));
        } catch (error) {
            console.error('Error in getLessonList:', error);
            throw error;
        }
    }

    async getLessonStats(supervisorId: string) {
        const { data, error } = await LessonListService.supabase
            .from('lesson_progress')
            .select(`
                id,
                status,
                Device_Profile!inner (
                    id,
                    Child!inner (
                        Supervisor!inner (
                            id
                        )
                    )
                )
            `)
            .eq('Device_Profile.Child.Supervisor.id', supervisorId);

        if (error) {
            console.error('Lỗi khi lấy thống kê:', error);
            throw error;
        }

        const total = data.length;
        const completed = data.filter(lesson => lesson.status === 'Completed').length;
        const inProgress = data.filter(lesson => lesson.status === 'In Progress').length;
        const notStarted = total - (completed + inProgress);

        return {
            total,
            completed,
            inProgress,
            notStarted,
            completionRate: total > 0 ? (completed / total) * 100 : 0
        };
    }
}

