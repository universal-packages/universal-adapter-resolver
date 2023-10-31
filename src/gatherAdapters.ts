import { readPackageJson } from '@universal-packages/package-json'
import { camelCase, pascalCase, snakeCase } from 'change-case'

import { GatherAdaptersOptions } from './types'

export function gatherAdapters<A = any>(options: GatherAdaptersOptions): A[] {
  const { domain, type, internal } = options
  const packageJson = readPackageJson()
  const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
  const packagesNamesInDomain = dependencyNames.filter((dependencyName: string): boolean => dependencyName.includes(domain))
  const gatheredAdapters: A[] = [].concat(internal ? internal : [])

  for (let i = 0; i < packagesNamesInDomain.length; i++) {
    const currentPackageName = packagesNamesInDomain[i]

    try {
      const importedModule = require(currentPackageName)
      const moduleExportNameARegex = `.*_${snakeCase(type)}$`
      const moduleExportNameBRegex = `.*${camelCase(type)}$`
      const moduleExportNameCRegex = `.*${pascalCase(type)}$`
      const moduleExportNameA = Object.keys(importedModule).find((key: string): boolean => !!new RegExp(moduleExportNameARegex).exec(key))
      const moduleExportNameB = Object.keys(importedModule).find((key: string): boolean => !!new RegExp(moduleExportNameBRegex).exec(key))
      const moduleExportNameC = Object.keys(importedModule).find((key: string): boolean => !!new RegExp(moduleExportNameCRegex).exec(key))

      if (moduleExportNameA) {
        gatheredAdapters.push(importedModule[moduleExportNameA])
      } else if (moduleExportNameB) {
        gatheredAdapters.push(importedModule[moduleExportNameB])
      } else if (moduleExportNameC) {
        gatheredAdapters.push(importedModule[moduleExportNameC])
      }
    } catch {
      // Nothing to gather if the package can't be imported
    }
  }

  return gatheredAdapters
}
