export type ScoreType = 'eagle' | 'birdie' | 'par'

export interface UserProfile {
  id: string
  name: string
  email: string
  home_course: string
  club_id: string | null
  created_at: string
}

export interface Course {
  id: string
  name: string
  location: string
  holes: number
  is_landings: boolean
  created_at: string
}

export interface HoleDetail {
  id: string
  course_id: string
  hole_number: number
  par: number
  yardage: number
}

export interface HoleScore {
  id: string
  user_id: string
  course_id: string
  hole_number: number
  score_type: ScoreType
  scored_at: string
}

export interface Club {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  courses: string[]
  leaderboard_enabled: boolean
  signup_code: string
  created_at: string
}

export interface UserClub {
  id: string
  user_id: string
  club_id: string
  joined_at: string
}

export interface UserCourse {
  id: string
  user_id: string
  course_id: string
  added_at: string
  season_start: string | null
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  birdie_count: number
  eagle_count: number
  total_holes: number
  completion_pct: number
}
