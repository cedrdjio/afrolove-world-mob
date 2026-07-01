export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  gender: string | null;
  looking_for: string | null;
  birth_date: string | null;
  interests: string[];
  lifestyle: Record<string, string>;
  photos: string[];
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
