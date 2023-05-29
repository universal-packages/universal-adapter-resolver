import { readPackageJson } from '@universal-packages/package-json'
import { camelCase, pascalCase, snakeCase } from 'change-case'

import { ResolveAdapterOptions } from './types'

export function resolveAdapter<A = any>(name: string, options?: ResolveAdapterOptions<A>): A {
  if (options?.internal) {
    if (options.internal[name]) return options.internal[name]
  }

  const packageJson = readPackageJson()
  const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
  const packageRegExp = `^.*${options?.domain}.*${name}.*$`

  const foundPackageName = dependencyNames.find((dependencyName: string): boolean => !!new RegExp(packageRegExp).exec(dependencyName))

  if (foundPackageName) {
    try {
      const importedModule = require(foundPackageName)
      const baseModuleElementName = options?.type ? `${name}_${options.type}` : name
      const moduleElementNameA = pascalCase(baseModuleElementName)
      const moduleElementNameB = camelCase(baseModuleElementName)
      const moduleElementNameC = snakeCase(baseModuleElementName)
      const moduleElement = importedModule[baseModuleElementName] || importedModule[moduleElementNameA] || importedModule[moduleElementNameB] || importedModule[moduleElementNameC]

      if (moduleElement) {
        return moduleElement
      } else {
        throw new Error(
          `Module "${foundPackageName}" does not provide an export that matches "${name}", trying: [${baseModuleElementName}, ${moduleElementNameA}, ${moduleElementNameB}, ${moduleElementNameC},]`
        )
      }
    } catch (error) {
      error.message = `Module "${foundPackageName}" is declared in package.json but there is a problem importing it, try running "npm install"\n\n${error.message}`

      throw error
    }
  } else {
    throw new Error(`There isn't an installed module that matches the adapter specification for: "${name}"${options?.domain ? ` under "${options?.domain}" domain` : ''}`)
  }
}
