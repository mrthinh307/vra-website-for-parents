export { default as FeedbackDetailModal } from './FeedbackDetailModal';
export { default as EvaluationChatModal } from './EvaluationChatModal';
export { default as TaskList } from './TaskList';

export interface Task {
  stt: number;
  name: string;
  remind: number;
  response: number;
  note: string;
}