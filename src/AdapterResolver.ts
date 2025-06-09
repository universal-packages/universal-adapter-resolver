import { PackageJson } from '@universal-packages/package-json'
import { camelCase, pascalCase, snakeCase } from 'change-case'

import { AdapterResolverOptions, GatheredAdapters } from './AdapterResolver.types'

export class AdapterResolver<A = any> {
  public readonly options: AdapterResolverOptions<A>

  public constructor(options: AdapterResolverOptions<A>) {
    this.options = { ...options }
  }

  /**
   * Resolve a specific adapter by name using the configured domain, type, and internal adapters
   * @param name - The name of the adapter to resolve
   * @returns The resolved adapter
   */
  public async resolve(name: string): Promise<A> {
    const { domain, type, internal } = this.options

    if (internal) {
      if (internal[name]) return internal[name]
    }

    const packageJson = new PackageJson()
    packageJson.read()

    const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
    const packageRegExp = `^.*${domain}.*${name}.*$`

    const foundPackageName = dependencyNames.find((dependencyName: string): boolean => !!new RegExp(packageRegExp).exec(dependencyName))
    let errorOnImport = false

    if (foundPackageName) {
      try {
        const importedModule = await import(foundPackageName)
        const baseModuleElementName = `${name}_${type}`
        const moduleElementNameA = pascalCase(baseModuleElementName)
        const moduleElementNameB = camelCase(baseModuleElementName)
        const moduleElementNameC = snakeCase(baseModuleElementName)
        const moduleElement =
          importedModule[baseModuleElementName] || importedModule[moduleElementNameA] || importedModule[moduleElementNameB] || importedModule[moduleElementNameC]

        if (moduleElement) {
          return moduleElement
        } else {
          errorOnImport = true
          throw new Error(
            `Module "${foundPackageName}" does not provide an export that matches "${name}", trying: [${baseModuleElementName}, ${moduleElementNameA}, ${moduleElementNameB}, ${moduleElementNameC},]`
          )
        }
      } catch (error: unknown) {
        if (errorOnImport) throw error

        if (error instanceof Error) {
          error.message = `Module "${foundPackageName}" is a dependency in package.json but there is a problem importing it, try running "npm install"\n\n${error.message}`
        }

        throw error
      }
    } else {
      throw new Error(`There isn't an installed module that matches the adapter specification for: "${name}" under "${domain}" domain of "${type}" type`)
    }
  }

  /**
   * Gather all adapters for the configured domain and type
   * @returns Object containing all gathered adapters
   */
  public async gather(): Promise<GatheredAdapters<A>> {
    const { domain, type, internal } = this.options
    const packageJsonInstance = new PackageJson()
    packageJsonInstance.read()
    const packageJson = packageJsonInstance
    const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
    const packagesNamesInDomain = dependencyNames.filter((dependencyName: string): boolean => dependencyName.includes(domain) && !dependencyName.includes('jest'))
    const gatheredAdapters: GatheredAdapters = { ...internal }

    for (let i = 0; i < packagesNamesInDomain.length; i++) {
      const currentPackageName = packagesNamesInDomain[i]

      try {
        const importedModule = await import(currentPackageName)
        const importedModuleKeys = Object.keys(importedModule)

        const moduleExportNameARegex = `.*_${snakeCase(type)}$`
        const moduleExportNameBRegex = `.*${camelCase(type)}$`
        const moduleExportNameCRegex = `.*${pascalCase(type)}$`

        for (let j = 0; j < importedModuleKeys.length; j++) {
          const currentImportedModuleKey = importedModuleKeys[j]

          if (
            !!new RegExp(moduleExportNameARegex).exec(currentImportedModuleKey) ||
            !!new RegExp(moduleExportNameBRegex).exec(currentImportedModuleKey) ||
            !!new RegExp(moduleExportNameCRegex).exec(currentImportedModuleKey)
          ) {
            const referenceName = snakeCase(currentImportedModuleKey)
              .replace(`_${snakeCase(type)}`, '')
              .replace('_', '-')

            gatheredAdapters[referenceName] = importedModule[currentImportedModuleKey]
          }
        }
      } catch (error: any) {
        error.message = `Module "${currentPackageName}" is a dependency in package.json but there is a problem importing it, try running "npm install"\n\n${error.message}`

        throw error
      }
    }

    return gatheredAdapters
  }
}
