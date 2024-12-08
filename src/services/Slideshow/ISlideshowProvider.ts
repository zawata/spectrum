export interface ISlideshowImage {
  imageUrl: string;
  author: string;
}

export enum SlideshowProvider {
  Google = "google",
  Unsplash = "unsplash",
  Nasa = "nasa",
  // Flickr = "flickr",
  Static = "static",
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type BaseSlideshowProviderConfig = {};

export type SlideshowConfig = {
  [SlideshowProvider.Google]: unknown;
  [SlideshowProvider.Unsplash]: {
    apiKey: string;
  };
  [SlideshowProvider.Nasa]: {
    apiKey: string;
  };
  [SlideshowProvider.Static]: {
    images: ISlideshowImage[];
  };
};

export type SlideshowProviderConfig<T extends SlideshowProvider> = SlideshowConfig[T];

export interface ISlideshowProvider<T extends SlideshowProvider> {
  fetchImages(fetchCount: number, providerConfig: SlideshowProviderConfig<T>): Promise<ISlideshowImage[]>;
}
