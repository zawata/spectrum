import { ConfigService } from "../Config/ConfigService";
import { ServiceManager } from "../ServiceManager";

import * as log from "@tauri-apps/plugin-log";
import _ from "lodash";

import { type ISlideshowImage, type ISlideshowProvider, SlideshowProvider } from "./ISlideshowProvider";

import { GoogleSlideshowProvider } from "./GoogleSlideshow";
import { StaticSlideshowProvider } from "./StaticSlideshow";
import { NasaSlideshowProvider } from "./NasaSlideshow";
import { UnsplashSlideshowProvider } from "./UnsplashSlideshow";

type ImageAndProvider = {
  provider: SlideshowProvider;
  image: ISlideshowImage;
};

const FETCH_COUNT = 25;

@ServiceManager.registerService()
export class SlideshowService {
  private configService: ConfigService;

  private configuredProviders: Partial<Record<SlideshowProvider, ISlideshowProvider<SlideshowProvider>>> = {};

  private images: {
    provider: SlideshowProvider;
    image: ISlideshowImage;
  }[] = [];

  constructor(serviceManager: ServiceManager) {
    this.configService = serviceManager.getService(ConfigService);

    const config = this.configService.getItem(["slideshowConfig"] as const);

    for (const providerKey in config.providers) {
      switch (providerKey) {
        case SlideshowProvider.Google:
          this.configuredProviders[SlideshowProvider.Google] = new GoogleSlideshowProvider();
          break;
        case SlideshowProvider.Static:
          this.configuredProviders[SlideshowProvider.Static] = new StaticSlideshowProvider();
          break;
        case SlideshowProvider.Nasa:
          this.configuredProviders[SlideshowProvider.Nasa] = new NasaSlideshowProvider();
          break;
        case SlideshowProvider.Unsplash:
          this.configuredProviders[SlideshowProvider.Unsplash] = new UnsplashSlideshowProvider();
          break;
        default:
          continue;
      }

      log.info(`[SlideshowService] Configured provider ${providerKey}`);
    }

    this.fetchImages();

    log.info("[SlideshowService] initialized");
  }

  async fetchImages() {
    const newImages: ImageAndProvider[] = [];

    for (const providerKey in this.configuredProviders) {
      const providerType = providerKey as SlideshowProvider;
      const provider = this.configuredProviders[providerType];

      if (!provider) {
        continue;
      }

      const images = await provider.fetchImages(
        FETCH_COUNT,
        this.configService.getItem(["slideshowConfig", "providers", providerType] as const),
      );

      newImages.push(...images.map((image) => ({ provider: providerType, image })));
    }

    this.images = [...this.images, ..._.shuffle(newImages)];
  }

  async getNextImage() {
    if (this.images.length === 0) {
      await this.fetchImages();
    }

    return this.images.shift();
  }
}
