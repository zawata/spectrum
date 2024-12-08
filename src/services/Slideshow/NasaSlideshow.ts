import { fetch } from "@tauri-apps/plugin-http";
import * as log from "@tauri-apps/plugin-log";

import type { ISlideshowProvider, SlideshowProvider, SlideshowProviderConfig } from "./ISlideshowProvider";

export type RawTopicConfig = {
  url: string;
};

export class NasaSlideshowImage {
  imageUrl: string;
  author: "NASA";

  constructor(init: {
    imageUrl: string;
  }) {
    this.imageUrl = init.imageUrl;
    this.author = "NASA";
  }

  static fromRawTopic(_rawTopic: RawTopicConfig) {
    console.log(_rawTopic);

    const { url } = _rawTopic;

    return new NasaSlideshowImage({
      imageUrl: url,
    });
  }
}

export class NasaSlideshowProvider implements ISlideshowProvider<SlideshowProvider.Nasa> {
  constructor() {
    log.info("[NasaSlideshowProvider] initialized");
  }

  async fetchImages(fetchCount: number, providerConfig: SlideshowProviderConfig<SlideshowProvider.Nasa>) {
    const url = new URL("https://api.nasa.gov/planetary/apod");
    url.searchParams.append("api_key", providerConfig.apiKey);
    url.searchParams.append("count", fetchCount.toString());

    const response = await fetch("https://api.nasa.gov/planetary/apod");

    if (!response.ok || response.status !== 200) {
      throw new Error("Failed to fetch topics");
    }

    const body = await response.json();

    return [...body.map((rawTopic: RawTopicConfig) => NasaSlideshowImage.fromRawTopic(rawTopic))];
  }
}
