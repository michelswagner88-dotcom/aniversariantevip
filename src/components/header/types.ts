export interface HeaderProps {
  transparent?: boolean;
  showSearch?: boolean;
  cityName?: string;
  onSearchClick?: () => void;
}

export interface HeaderUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const SCROLL_THRESHOLD = 20;
export const HEADER_HEIGHT_EXPANDED = 80;
export const HEADER_HEIGHT_COLLAPSED = 64;
