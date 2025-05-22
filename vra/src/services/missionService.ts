import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../pages/DetailReport/components';

interface MissionData {
    id: string;
    mission_id: string;
    status: string;
    spent_time: number;
    attempts: number;
    missions: {
        id: string;
        name: string;
        description: string;
        order_in_lesson: number;
    } | null;
}

export class DetailReportService {
    private static supabase: SupabaseClient;
    private static instance: DetailReportService;

    private constructor() {
        if (!DetailReportService.supabase) {
            const supabaseUrl = 'https://inpsegawgmyrhkrbswpv.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHNlZ2F3Z215cmhrcmJzd3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDkzNzksImV4cCI6MjA2MzIyNTM3OX0.mD7Wxan8DhsjvmUWeSKOGuQkE1oOG2yNWyjGwGtLo4o';

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase URL or Key. Please check your environment variables.');
            }

            DetailReportService.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    public static getInstance(): DetailReportService {
        if (!DetailReportService.instance) {
            DetailReportService.instance = new DetailReportService();
        }
        return DetailReportService.instance;
    }

    /**
     * Fetch tasks for a specific lesson progress
     * @param lessonProgressId The ID of the lesson progress
     * @returns Promise<Task[]> Array of tasks
     */
    public async getTasks(lessonProgressId: string): Promise<Task[]> {
        try {
            const { data: missions, error } = await DetailReportService.supabase
                .from('mission_progress')
                .select(`
                    id,
                    mission_id,
                    status,
                    spent_time,
                    attempts,
                    missions (
                        id,
                        name,
                        description,
                        order_in_lesson
                    )
                `)
                .eq('lesson_progress_id', lessonProgressId)
                .order('order_in_lesson', { foreignTable: 'missions', ascending: true });

            if (error) throw error;

            return (missions as unknown as MissionData[]).map((mission, index) => ({
                stt: index + 1,
                name: mission.missions?.name || mission.missions?.description || 'Unknown Task',
                remind: mission.attempts,
                response: mission.spent_time,
                note: this.getNoteFromStatus(mission.status)
            }));
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }

    /**
     * Update task progress and feedback
     * @param missionProgressId The ID of the mission progress
     * @param status The new status
     * @param spentTime The time spent on the task
     * @param attempts The number of attempts
     * @param feedback Optional feedback comment
     */
    public async updateTaskProgress(
        missionProgressId: string,
        status: string,
        spentTime: number,
        attempts: number,
        feedback?: string
    ): Promise<void> {
        try {
            // Update mission progress
            const { error: progressError } = await DetailReportService.supabase
                .from('mission_progress')
                .update({
                    status,
                    spent_time: spentTime,
                    attempts,
                    updated_at: new Date().toISOString()
                })
                .eq('id', missionProgressId);

            if (progressError) throw progressError;

            // Add feedback if provided
            if (feedback) {
                const { error: feedbackError } = await DetailReportService.supabase
                    .from('mission_feedbacks')
                    .insert({
                        mission_id: missionProgressId,
                        comment: feedback,
                        rating: 0, // Default rating
                        submitted_at: new Date().toISOString()
                    });

                if (feedbackError) throw feedbackError;
            }
        } catch (error) {
            console.error('Error updating task progress:', error);
            throw error;
        }
    }

    /**
     * Get a note based on the mission status
     * @param status The mission status
     * @returns string A descriptive note
     */
    private getNoteFromStatus(status: string): string {
        switch (status) {
            case 'COMPLETED':
                return 'Hoàn thành tốt';
            case 'IN_PROGRESS':
                return 'Đang thực hiện';
            case 'FAILED':
                return 'Cần cải thiện';
            default:
                return 'Chưa bắt đầu';
        }
    }
}
