import { Logger, Module, DynamicModule } from '@nestjs/common'
import { Options, glob } from 'fast-glob'
import { resolve } from 'path'
import { ModuleLoaderService } from './module-loader.service'
import {
  MODULE_LOADER,
  MODULE_LOADER_OPTIONS,
  MODULE_LOADER_NAMES,
  IModuleLoaderOptions,
} from './module-loader.defs'
import { isArray } from 'radash'

export const moduleLoaderFactory = {
  provide: MODULE_LOADER,
  useFactory: () => {},
  inject: [ModuleLoaderService],
}

interface IModuleInfo {
  name: string
  module: DynamicModule
}

/**
 * @description helper static class to load modules dynamically.
 */
class InternalModuleLoader {
  static readonly logger = new Logger(InternalModuleLoader.name)

  /**
   * @param _options for GLOB searches
   * @returns a Promise thats resolves to a list of name and module references based on _options filespec
   */
  static async loadModules(_options: IModuleLoaderOptions): Promise<IModuleInfo[]> {
    const fullPaths = await this.getModuleFileNames(_options)
    if (!fullPaths) return []
    const loadedModules = await Promise.all(fullPaths.map(fullPath => import(fullPath)))
    const moduleInfos = loadedModules.map(module => {
      const moduleField = Object.keys(module).find(key => key.includes('Module'))
      return {
        name: moduleField,
        module: module[moduleField],
      }
    })
    return moduleInfos
  }

  /**
   * @description Uses FatsGlob to load the filenames for the modules
   * @param _options for GLOB searches
   * @returns a list of module's file paths
   */
  private static async getModuleFileNames(_options: IModuleLoaderOptions): Promise<string[]> {
    const spec = toArray(_options.fileSpec).map(fileSpec => resolve(_options.path, fileSpec))
    const options: Options = { onlyFiles: true }
    if (_options.depth) options.deep = _options.depth < 0 ? Infinity : _options.depth
    if (_options.ignoreSpec) options.ignore = toArray(_options.ignoreSpec)
    const files = await glob(spec[0].replaceAll('\\', '/')) //replaceAll is needed for this to work in Linux
    const message =
      files.length > 0 ? `Found modules ${files.join()}` : 'NO LOADABLE MODULES FOUND !!!'
    this.logger.log(message)
    return files
  }
}

function toArray<T>(value: T | T[]): T[] {
  if (isArray(value)) return value
  return [value]
}

@Module({})
export class ModuleLoaderModule {
  /**
   * @description Load Modules dynamically via GLOBs and native import() function.
   * @param moduleLoaderOptions options for GLOB searches
   */
  public static async register(moduleLoaderOptions: IModuleLoaderOptions): Promise<DynamicModule> {
    const moduleInfos = await InternalModuleLoader.loadModules(moduleLoaderOptions)
    const modules = moduleInfos.map(moduleInfo => moduleInfo.module)
    const moduleNames = moduleInfos.map(moduleInfo => moduleInfo.name)

    return {
      module: ModuleLoaderModule,
      imports: [...modules],
      providers: [
        {
          provide: MODULE_LOADER_OPTIONS,
          useValue: moduleLoaderOptions,
        },
        {
          provide: MODULE_LOADER_NAMES,
          useValue: moduleNames,
        },
        ModuleLoaderService,
        moduleLoaderFactory,
      ],
    }
  }
}
