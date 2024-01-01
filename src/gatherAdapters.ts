import { readPackageJson } from '@universal-packages/package-json'
import { camelCase, pascalCase, snakeCase } from 'change-case'

import { GatherAdaptersOptions, GatheredAdapters } from './types'

export function gatherAdapters<A = any>(options: GatherAdaptersOptions): GatheredAdapters<A> {
  const { domain, type, internal } = options
  const packageJson = readPackageJson()
  const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
  const packagesNamesInDomain = dependencyNames.filter((dependencyName: string): boolean => dependencyName.includes(domain) && !dependencyName.includes('jest'))
  const gatheredAdapters: GatheredAdapters = { ...internal }

  for (let i = 0; i < packagesNamesInDomain.length; i++) {
    const currentPackageName = packagesNamesInDomain[i]

    try {
      const importedModule = require(currentPackageName)
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
    } catch (error) {
      error.message = `Module "${currentPackageName}" is a dependency in package.json but there is a problem importing it, try running "npm install"\n\n${error.message}`

      throw error
    }
  }

  return gatheredAdapters
}
