import { fetch } from "@tauri-apps/plugin-http";
import * as log from "@tauri-apps/plugin-log";
import { uuid } from "../../utils/uuid";
import type { ServiceManager } from "../ServiceManager";
import type {
  ISlideshowImage,
  ISlideshowProvider,
  SlideshowProvider,
  SlideshowProviderConfig,
} from "./ISlideshowProvider";

type RawAlbumType = [
  number, // album id ??
  string, // album type ??
  string, // album name ??
];

type RawTopicConfig = [
  string, // image url
  string, // author,
  null,
  null,
  number, // 120
  number, // 7
  null,
  null,
  string, // author
  null,
  null,
  null,
  number, // 0
  string, // "FEATURED_GPLUS_TITLE"
  string, // "AF1QipNTqDqUngxhDxU8gw_NOLhjNhHAwV62kDEMqt_Q"
  null,
  null,
  number, // 0
  null,
  null,
  null,
  number, // 46
  RawAlbumType[],
  number, // 3287288894177512
  [9700053],
  null,
  null,
  RawAlbumType[],
];

export class GoogleSlideshowImage implements ISlideshowImage {
  imageUrl: string;
  author: string;

  constructor(init: {
    imageUrl: string;
    author: string;
  }) {
    this.imageUrl = init.imageUrl;
    this.author = init.author;
  }

  static fromRawTopic(_rawTopic: RawTopicConfig) {
    console.log(_rawTopic);

    const [imageUrl, author] = _rawTopic;

    return new GoogleSlideshowImage({
      imageUrl,
      author,
    });
  }
}

export class GoogleSlideshowProvider implements ISlideshowProvider<SlideshowProvider.Google> {
  private clientId: string;
  private clientInitDate: number;
  private clientFetchIndex: number;

  constructor() {
    this.clientId = uuid();
    this.clientInitDate = Date.now() / 1000;
    this.clientFetchIndex = 0;
  }

  async fetchImages(fetchCount: number, _providerConfig: SlideshowProviderConfig<SlideshowProvider.Google>) {
    log.info("[GoogleSlideshowProvider] Fetching images");
    const request = JSON.stringify([
      this.clientFetchIndex,
      fetchCount,
      [this.clientId, this.clientInitDate],
      1, //TODO: figure out what this is
    ]);

    const body = new URLSearchParams({ request });
    const response = await fetch("https://clients3.google.com/cast/chromecast/home", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok || response.status !== 200) {
      console.log(response);
      throw new Error("Failed to fetch topics");
    }

    console.log("Fetched topics");
    // google's response contains a CSRF defense which needs to be dropped since it breaks the json parser
    const bodyText = (await response.text()).slice(4).trim();
    console.log(bodyText);
    const topicResponse = JSON.parse(bodyText);
    const [
      rawTopicsArray,
      _responseClientInfo,
      _2,
      _3,
      _4,
      _5, // something to do with fetching the weather
      _6, // || 0
      _7, // \\ ''
      _8,
      _9, // emit "settingUpdated"
      _10, // emit "weatherInfoUpdated"
      _11,
      _12,
      _13,
      _14,
      _15, // emit "gothamDiscoveryKeyCodeUpdated"
    ] = topicResponse;

    this.clientFetchIndex++;

    return [...rawTopicsArray.map((rawTopic: RawTopicConfig) => GoogleSlideshowImage.fromRawTopic(rawTopic))];
  }
}
