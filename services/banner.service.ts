import axiosInstance from "@/lib/axios";
import { Banner, BannerWithMediaType, MediaType } from "@/types/banner.types";

function detectMediaType(url: string): MediaType {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lower = url.toLowerCase().split('?')[0];
  return videoExtensions.some((ext) => lower.endsWith(ext)) ? 'video' : 'image';
}

export async function fetchBanners(): Promise<BannerWithMediaType[]> {
  try {
    const { data } = await axiosInstance.get<Banner[]>('/v1/banners');

    return data
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((banner) => ({
        ...banner,
        mediaType: detectMediaType(banner.mediaUrl),
      }));
  } catch (error) {
    console.error('[BannerService] Error fetching banners:', error);
    return [];
  }
}