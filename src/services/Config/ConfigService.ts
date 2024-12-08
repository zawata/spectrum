import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/plugin-fs";
import _ from "lodash";

import { invoke } from "@tauri-apps/api/core";
import type { Get } from "type-fest";
import { ServiceManager } from "../ServiceManager";
import type { SlideshowProvider } from "../Slideshow/ISlideshowProvider";

type Config = {
  slideshowConfig: {
    transitionInterval: number;
    providers: Partial<{
      [SlideshowProvider.Static]: {
        images: string[];
      };
      [SlideshowProvider.Google]: Record<string, void>;
      [SlideshowProvider.Nasa]: {
        enabled: true;
      };
      [SlideshowProvider.Nasa]: {
        enabled: true;
      };
    }>;
  };
};

const DEFAULT_CONFIG: Config = {
  slideshowConfig: {
    transitionInterval: 1000,
    providers: {},
  },
};

@ServiceManager.registerService()
export class ConfigService {
  private configFilePath: string | null;
  private config: Config;

  private initPromise: Promise<void> | null = null;
  private writeConfigFileDebounced: _.DebouncedFunc<typeof this.writeConfigFile>;

  constructor(_serviceManager: ServiceManager) {
    this.config = DEFAULT_CONFIG;
    this.configFilePath = null;
    this.writeConfigFileDebounced = _.debounce(this.writeConfigFile, 1000);

    this.initPromise = this.readConfigFile();
  }

  async findConfigFile(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    if (this.configFilePath) {
      return;
    }

    const possiblePaths: Promise<string>[] = [
      path.appConfigDir().then((configDir) => path.join(configDir, "spectrum.json")),
      path.homeDir().then((homeDir) => path.join(homeDir, "spectrum.json")),
      invoke<string>("get_app_cwd")
        .catch(() => path.resolve("."))
        .then((cwd) => cwd && path.join(cwd, "spectrum.json")),
    ];

    const foundPaths = (
      await Promise.all(
        possiblePaths.map((possiblePathPromise) =>
          possiblePathPromise.then(async (possiblePath) => {
            console.log("searching path", possiblePath);
            if (await fs.exists(possiblePath)) {
              return possiblePath;
            }

            return null;
          }),
        ),
      )
    ).filter((maybeFoundPath): maybeFoundPath is string => maybeFoundPath !== null);

    this.configFilePath = foundPaths[0] ?? null;
  }

  private async createConfigFile() {
    if (this.configFilePath) {
      return;
    }

    try {
      this.configFilePath = await path.join(await path.appConfigDir(), "spectrum.json");
      await fs.writeTextFile(this.configFilePath, JSON.stringify(DEFAULT_CONFIG));
    } catch (e) {
      console.error("failed to write config file", e);
      this.configFilePath = null;
    }
  }

  private async readConfigFile() {
    await this.findConfigFile();
    if (!this.configFilePath) {
      return;
    }

    try {
      const configText = await fs.readTextFile(this.configFilePath);
      this.config = _.merge(DEFAULT_CONFIG, JSON.parse(configText));
    } catch (e) {
      console.error("failed to read config file", e);
      this.configFilePath = null;
    }
  }

  private async writeConfigFile() {
    await this.findConfigFile();
    if (!this.configFilePath) {
      await this.createConfigFile();
      return;
    }

    try {
      await fs.writeTextFile(this.configFilePath, JSON.stringify(this.config));
    } catch (e) {
      console.error("failed to write config file", e);
      this.configFilePath = null;
    }
  }

  getItem<T extends string[]>(key: T): Get<Config, T> {
    return _.get(this.config, key);
  }

  setItem<T extends string[]>(key: T, value: Get<Config, T>) {
    _.set(this.config, key, value);
    this.writeConfigFileDebounced();
  }
}
