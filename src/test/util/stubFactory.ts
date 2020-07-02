import * as sinon from "sinon";
import Cache from "../../cache";
import Utils from "../../utils";
import Config from "../../config";
import { getExtensionContext, getConfiguration } from "./mockFactory";
import { createStubInstance } from "./stubbedClass";

export function getCacheStub(): Cache {
  const cacheStubTemp: any = sinon.createStubInstance(Cache);
  cacheStubTemp.extensionContext = getExtensionContext();
  return cacheStubTemp as Cache;
}

export function getUtilsStub(): Utils {
  const utilsStubTemp: any = createStubInstance(Utils);
  utilsStubTemp.config = getConfigStub();

  return utilsStubTemp as Utils;
}

export function getConfigStub(): Config {
  const configStub: any = createStubInstance(Config);
  configStub.cache = getCacheStub();
  configStub.default = getConfiguration().searchEverywhere;

  return configStub as Config;
}
