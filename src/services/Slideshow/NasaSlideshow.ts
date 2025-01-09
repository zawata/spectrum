import { fetch } from "@tauri-apps/plugin-http";
import * as log from "@tauri-apps/plugin-log";

import type { ISlideshowImage, ISlideshowProvider, SlideshowProvider, SlideshowProviderConfig } from "./ISlideshowProvider";

export type RawImageConfig = {
  url: string;
  hdurl: string;
  title: string;
  explanation: string;
  media_type: string;
  service_version: string;
  copyright: string;
};

export class NasaSlideshowImage implements ISlideshowImage {
  imageUrl: string;
  author: string;
  title: string | undefined;

  constructor(init: {
    imageUrl: string;
    author: string;
    title: string | undefined;
  }) {
    this.imageUrl = init.imageUrl;
    this.author = init.author;
    this.title = init.title;
  }

  static fromRawImageConfig(_rawImageConfig: RawImageConfig) {
    console.log(_rawImageConfig);

    const { url, hdurl, copyright, title } = _rawImageConfig;

    return new NasaSlideshowImage({
      imageUrl: hdurl ?? url,
      author: copyright,
      title: title ?? undefined,
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

    return [...body.map((rawTopic: RawImageConfig) => NasaSlideshowImage.fromRawImageConfig(rawTopic))];
  }
}
