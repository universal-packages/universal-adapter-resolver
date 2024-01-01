import { readPackageJson } from '@universal-packages/package-json'
import { camelCase, pascalCase, snakeCase } from 'change-case'

import { GatherAdaptersOptions } from './types'

export function gatherAdapters<A = any>(options: GatherAdaptersOptions): A[] {
  const { domain, type, internal } = options
  const packageJson = readPackageJson()
  const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
  const packagesNamesInDomain = dependencyNames.filter((dependencyName: string): boolean => dependencyName.includes(domain) && !dependencyName.includes('jest'))
  const gatheredAdapters: A[] = [].concat(internal ? internal : [])

  for (let i = 0; i < packagesNamesInDomain.length; i++) {
    const currentPackageName = packagesNamesInDomain[i]

    try {
      const importedModule = require(currentPackageName)
      const moduleExportNameARegex = `.*_${snakeCase(type)}$`
      const moduleExportNameBRegex = `.*${camelCase(type)}$`
      const moduleExportNameCRegex = `.*${pascalCase(type)}$`

      const matchingExportKeys = Object.keys(importedModule)
        .filter((key: string): boolean => {
          return !!new RegExp(moduleExportNameARegex).exec(key) || !!new RegExp(moduleExportNameBRegex).exec(key) || !!new RegExp(moduleExportNameCRegex).exec(key)
        })
        .map((moduleName: string): any => importedModule[moduleName])

      gatheredAdapters.push(...matchingExportKeys)
    } catch (error) {
      error.message = `Module "${currentPackageName}" is a dependency in package.json but there is a problem importing it, try running "npm install"\n\n${error.message}`

      throw error
    }
  }

  return gatheredAdapters
}
