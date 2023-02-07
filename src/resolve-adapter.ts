import { readPackageJson } from '@universal-packages/package-json'
import { camelCase, pascalCase, snakeCase } from 'change-case'
import { ResolveAdapterOptions } from './types'

export async function resolveAdapter<P = any>(name: string, options?: ResolveAdapterOptions): Promise<P> {
  const packageJson = readPackageJson()
  const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
  const packageRegExp = `^.*${options?.domain}.*${name}.*$`

  const foundPackageName = dependencyNames.find((dependencyName: string): boolean => !!new RegExp(packageRegExp).exec(dependencyName))

  if (foundPackageName) {
    try {
      const importedModule = await import(foundPackageName)
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
