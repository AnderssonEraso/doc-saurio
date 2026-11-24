export type RecommendationType = 'general' | 'diet' | 'alarm_sign' | 'indication';

export interface Recommendation {
  id: string;
  treatmentId: string;
  type: RecommendationType;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}
