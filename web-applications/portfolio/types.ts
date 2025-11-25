export enum AppStage {
  WELCOME = 'WELCOME',
  INPUT_P1 = 'INPUT_P1',
  INPUT_P2 = 'INPUT_P2',
  ANALYZING = 'ANALYZING',
  GAME_HUB = 'GAME_HUB',
  QUIZ = 'QUIZ',
  VERDICT = 'VERDICT',
}

export enum BoredStage {
  START = 'START',
  SCENARIO_GENERATION = 'SCENARIO_GENERATION',
  INPUT = 'INPUT',
  JUDGING = 'JUDGING',
  RESULT = 'RESULT',
}

export type AppMode = 'LANDING' | 'COUNSELLOR' | 'BORED_GAME';

export interface Player {
  name: string;
  statement: string;
  score: number;
  color: string;
  action?: string; // For the bored game
}

export interface QuizQuestion {
  targetPlayer: 'p1' | 'p2'; // Who should answer this
  aboutPlayer: 'p1' | 'p2'; // Who the question is about
  question: string;
  options: string[];
  correctIndex: number;
  reasoning: string;
}

export interface AnalysisResult {
  summary: string;
  p1Perspective: string;
  p2Perspective: string;
  questions: QuizQuestion[];
  verdict: string;
  compatibilityScore: number;
  funTip: string;
}

export interface ScenarioResult {
  scenario: string;
  imagePrompt: string;
}

export interface ScenarioJudgment {
  winner: string;
  compatibility: number;
  analysis: string;
  funnyComment: string;
}
