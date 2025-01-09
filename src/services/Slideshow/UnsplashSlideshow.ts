import { fetch } from "@tauri-apps/plugin-http";
import type { ISlideshowProvider, SlideshowProvider, SlideshowProviderConfig } from "./ISlideshowProvider";

export type RawImageConfig = {
  id: string;
  created_at: string;
  updated_at: string;
  promoted_at: string | null;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  categories: number[];
  likes: number;
  liked_by_user: boolean;
  current_user_collections: number[];
  sponsorship: null;
  user: {
    id: string;
    updated_at: string;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    twitter_username: string | null;
    portfolio_url: string | null;
    bio: string | null;
    location: string | null;
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
      following: string;
      followers: string;
    };
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    instagram_username: string | null;
    total_collections: number;
    total_likes: number;
    total_photos: number;
    accepted_tos: boolean;
  };
};

export class UnsplashSlideshowImage {
  imageUrl: string;
  author: string;

  constructor(init: {
    imageUrl: string;
    author: string;
  }) {
    this.imageUrl = init.imageUrl;
    this.author = init.author;
  }

  static fromRawImageConfig(_rawImageConfig: RawImageConfig) {
    console.log(_rawImageConfig);

    const { urls, user } = _rawImageConfig;

    return new UnsplashSlideshowImage({
      imageUrl: urls.regular,
      author: user.name,
    });
  }
}

export class UnsplashSlideshowProvider implements ISlideshowProvider<SlideshowProvider.Unsplash> {
  constructor() {
    console.log("[UnsplashSlideshowProvider] initialized");
  }

  async fetchImages(fetchCount: number, providerConfig: SlideshowProviderConfig<SlideshowProvider.Unsplash>) {
    const url = new URL("https://api.unsplash.com/photos/random");
    url.searchParams.append("client_id", providerConfig.apiKey);
    url.searchParams.append("count", fetchCount.toString());

    const response = await fetch("https://api.unsplash.com/photos/random");

    if (!response.ok || response.status !== 200) {
      throw new Error("Failed to fetch topics");
    }

    const body = await response.json();

    return [...body.map((rawTopic: RawImageConfig) => UnsplashSlideshowImage.fromRawImageConfig(rawTopic))];
  }
}