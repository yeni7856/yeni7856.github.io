
export interface Project {
  id: number;
  title: string;
  category: 'GAME' | 'APP' | 'WEB' | 'XR';
  year: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string[];
  importance: 1 | 2 | 3;
  description?: string;
  tools?: string[];
  showInMain?: boolean;
  websiteUrl?: string;
}
