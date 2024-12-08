import * as log from "@tauri-apps/plugin-log";
import _ from "lodash";
import type { ISlideshowProvider, SlideshowProvider, SlideshowProviderConfig } from "./ISlideshowProvider";

export class StaticSlideshowProvider implements ISlideshowProvider<SlideshowProvider.Static> {
  constructor() {
    log.info("[StaticSlideshowProvider] initialized");
  }

  async fetchImages(fetchCount: number, providerConfig: SlideshowProviderConfig<SlideshowProvider.Static>) {
    const { images } = providerConfig;

    const getShuffledImages = () => _.shuffle([...images]);

    const outputImages = [];
    while (outputImages.length < fetchCount) {
      outputImages.push(...getShuffledImages());
    }

    return outputImages.slice(0, fetchCount);
  }
}
