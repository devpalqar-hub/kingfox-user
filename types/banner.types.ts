export interface Banner {
  id: number;
  title: string;
  mediaUrl: string;
  redirectLink: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'image' | 'video';

export interface BannerWithMediaType extends Banner {
  mediaType: MediaType;
}