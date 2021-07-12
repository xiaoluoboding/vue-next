import { store, File } from '../store'
import {
  SFCDescriptor,
  BindingMetadata,
  SFCScriptBlock
} from '@vue/compiler-sfc'
import * as defaultCompiler from '@vue/compiler-sfc'
import { generateStyles } from './windiCompiler'
import { ref } from 'vue'
import { Node } from '@babel/types'

export const COMP_IDENTIFIER = `__sfc__`

/**
 * The default SFC compiler we are using is built from each commit
 * but we may swap it out with a version fetched from CDNs
 */
let SFCCompiler: typeof defaultCompiler = defaultCompiler

// @ts-ignore
const defaultVueUrl = import.meta.env.PROD
  ? `${location.origin}/vue.runtime.esm-browser.js` // to be copied on build
  : `${location.origin}/src/vue-dev-proxy`

export const vueRuntimeUrl = ref(defaultVueUrl)

export async function setVersion(version: string) {
  const compilerUrl = `https://unpkg.com/@vue/compiler-sfc@${version}/dist/compiler-sfc.esm-browser.js`
  const runtimeUrl = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`
  const [compiler] = await Promise.all([
    import(/* @vite-ignore */ compilerUrl),
    import(/* @vite-ignore */ runtimeUrl)
  ])
  SFCCompiler = compiler
  vueRuntimeUrl.value = runtimeUrl
  console.info(`Now using Vue version: ${version}`)
}

export function resetVersion() {
  SFCCompiler = defaultCompiler
  vueRuntimeUrl.value = defaultVueUrl
}

export async function compileFile({ filename, code, sfc, compiled }: File) {
  if (!code.trim()) {
    store.errors = []
    return
  }

  if (!filename.endsWith('.vue')) {
    compiled.js = compiled.ssr = code
    store.errors = []
    return
  }

  const id = await hashId(filename)
  const { errors, descriptor } = SFCCompiler.parse(code, {
    filename,
    sourceMap: true
  })
  if (errors.length) {
    store.errors = errors
    return
  }

  if (
    descriptor.styles.some(s => s.lang) ||
    (descriptor.template && descriptor.template.lang)
  ) {
    store.errors = [
      `lang="x" pre-processors for <template> or <style> are currently not ` +
        `supported.`
    ]
    return
  }

  const scriptLang =
    (descriptor.script && descriptor.script.lang) ||
    (descriptor.scriptSetup && descriptor.scriptSetup.lang)
  if (scriptLang && scriptLang !== 'ts') {
    store.errors = [`Only lang="ts" is supported for <script> blocks.`]
    return
  }

  const hasScoped = descriptor.styles.some(s => s.scoped)
  let clientCode = ''
  let ssrCode = ''

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  const clientScriptResult = await doCompileScript(descriptor, id, false)
  if (!clientScriptResult) {
    return
  }
  const [clientScript, bindings] = clientScriptResult
  clientCode += clientScript

  // script ssr only needs to be performed if using <script setup> where
  // the render fn is inlined.
  if (descriptor.scriptSetup) {
    const ssrScriptResult = await doCompileScript(descriptor, id, true)
    const scriptResult = await doTranspiledSetupScript(descriptor, id, false)
    sfc.setupScript = scriptResult
    if (ssrScriptResult) {
      ssrCode += ssrScriptResult[0]
    } else {
      ssrCode = `/* SSR compile error: ${store.errors[0]} */`
    }
  } else {
    // when no <script setup> is used, the script result will be identical.
    ssrCode += clientScript
  }

  // template
  // only need dedicated compilation if not using <script setup>
  if (descriptor.template && !descriptor.scriptSetup) {
    const clientTemplateResult = doCompileTemplate(
      descriptor,
      id,
      bindings,
      false
    )
    if (!clientTemplateResult) {
      return
    }
    clientCode += clientTemplateResult

    const ssrTemplateResult = doCompileTemplate(descriptor, id, bindings, true)
    if (ssrTemplateResult) {
      // ssr compile failure is fine
      ssrCode += ssrTemplateResult
    } else {
      ssrCode = `/* SSR compile error: ${store.errors[0]} */`
    }
  }

  if (hasScoped) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`
    )
  }

  if (clientCode || ssrCode) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}` +
        `\nexport default ${COMP_IDENTIFIER}`
    )
    compiled.js = clientCode.trimStart()
    compiled.ssr = ssrCode.trimStart()
  }

  // styles
  let css = ''
  for (const style of descriptor.styles) {
    if (style.module) {
      store.errors = [`<style module> is not supported in the playground.`]
      return
    }

    const styleResult = await SFCCompiler.compileStyleAsync({
      source: style.content,
      filename,
      id,
      scoped: style.scoped,
      modules: !!style.module
    })
    if (styleResult.errors.length) {
      // postcss uses pathToFileURL which isn't polyfilled in the browser
      // ignore these errors for now
      if (!styleResult.errors[0].message.includes('pathToFileURL')) {
        store.errors = styleResult.errors
      }
      // proceed even if css compile errors
    } else {
      css += styleResult.code + '\n'
    }
  }
  if (css) {
    compiled.css = css.trim()
  } else {
    compiled.css = '/* No <style> tags present */'
  }

  // windi css
  const windiCSS = generateStyles(sfc.template)

  if (windiCSS) {
    compiled.windicss = windiCSS
  } else {
    compiled.windicss = '/* No windicss utility classes in template */'
  }

  // clear errors
  store.errors = []
}

async function doCompileScript(
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean
): Promise<[string, BindingMetadata | undefined] | undefined> {
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const compiledScript = SFCCompiler.compileScript(descriptor, {
        id,
        refSugar: true,
        inlineTemplate: true,
        templateOptions: {
          ssr,
          ssrCssVars: descriptor.cssVars
        }
      })
      let code = ''
      if (compiledScript.bindings) {
        code += `\n/* Analyzed bindings: ${JSON.stringify(
          compiledScript.bindings,
          null,
          2
        )} */`
      }
      code +=
        `\n` +
        SFCCompiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER)

      if ((descriptor.script || descriptor.scriptSetup)!.lang === 'ts') {
        code = (await import('sucrase')).transform(code, {
          transforms: ['typescript']
        }).code
      }

      return [code, compiledScript.bindings]
    } catch (e) {
      store.errors = [
        e.stack
          .split('\n')
          .slice(0, 12)
          .join('\n')
      ]
      return
    }
  } else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

export async function doTranspiledSetupScript(
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean
): Promise<string | undefined> {
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      const compiledScript = SFCCompiler.compileScript(descriptor, {
        id,
        refSugar: true,
        inlineTemplate: true,
        templateOptions: {
          ssr,
          ssrCssVars: descriptor.cssVars
        }
      })

      return transpileSetupScript(descriptor, compiledScript)
    } catch (e) {
      store.errors = [
        e.stack
          .split('\n')
          .slice(0, 12)
          .join('\n')
      ]
      return
    }
  } else {
    return ''
  }
}

function transpileSetupScript(
  descriptor: SFCDescriptor,
  scriptBlock: SFCScriptBlock
) {
  const scriptContent = scriptBlock.content.trim()
  const s = new SFCCompiler.MagicString(scriptContent)
  const scriptResult = new SFCCompiler.MagicString('')
  let bindingKeys = Object.keys(scriptBlock.bindings)
  let offset = 0
  let componentMap: Record<string, any> = {}
  let vnodeMap: Record<string, any> = {}

  const scriptAst = SFCCompiler.babelParse(scriptContent, {
    sourceType: 'module'
  })

  for (const node of scriptAst.program.body) {
    const start = node.start!
    let end = node.end!
    // locate comment
    if (node.trailingComments && node.trailingComments.length > 0) {
      const lastCommentNode =
        node.trailingComments[node.trailingComments.length - 1]
      end = lastCommentNode.end
    }
    // locate the end of whitespace between this statement and the next
    while (end <= descriptor.source.length) {
      if (!/\s/.test(descriptor.source.charAt(end))) {
        break
      }
      end++
    }

    if (node.type === 'ImportDeclaration') {
      // Step 1. remove compiled script import declaration using `@vue/runtime-core api`
      if (node.specifiers.length && node.source.value === 'vue') {
        const localSpecs = node.specifiers
          .map(spec => spec.local.name)
          .join(',')

        if (
          /_toDisplayString|_createVNode|_Fragment|_openBlock|_createBlock/.test(
            localSpecs
          )
        ) {
          offset = node.end! - node.start!
          s.remove(node.start!, node.end!)
        }
      }
      // Step 2. record user imported components
      if (node.source.value && node.source.value.endsWith('.vue')) {
        // eg ./HelloWorld.vue
        const localSpecNames = node.specifiers
          .map(spec => spec.local.name)
          .join('')
        // {"./HelloWorld.vue" => "HelloWorld"}
        componentMap[node.source.value] = localSpecNames
      }
    }

    if (node.type === 'VariableDeclaration') {
      // Step 3. remove _withScopedId variable declaration
      const hasWithScoped = node.declarations.some(d => d.id.name === '_withId')
      const hasHoisted = node.declarations.some(d =>
        /_hoisted_/.test(d.id.name)
      )

      if (hasWithScoped || hasHoisted) {
        offset += node.end! - node.start!
        s.remove(node.start!, node.end!)
      }
    }

    if (node.type === 'ExpressionStatement') {
      // Step 4. remove _pushScopeId >---< _popScopeId() expression statement
      const hasPushScopeExpression =
        node.expression.callee.name === '_pushScopeId'
      const hasPopScopeExpression =
        node.expression.callee.name === '_popScopeId'
      if (hasPushScopeExpression || hasPopScopeExpression) {
        offset += node.end! - node.start!
        s.remove(node.start!, node.end!)
      }
    }

    if (node.type === 'ExportDefaultDeclaration') {
      let hasWalkCtx = false
      ;(SFCCompiler.walk as any)(node, {
        enter(node: Node) {
          if (node.type === 'ReturnStatement') {
            ;(SFCCompiler.walk as any)(node, {
              enter(returnNode: Node, returnNodeParent: Node) {
                if (
                  returnNode.type === 'Identifier' &&
                  returnNode.name === '_createBlock'
                ) {
                  const vnodeIdentifier = scriptContent.slice(
                    returnNodeParent.start!,
                    returnNodeParent.end!
                  )
                  vnodeMap[
                    `${returnNode.start!}${returnNode.end!}`
                  ] = vnodeIdentifier
                }

                // Step 5. remove export default return statement
                if (
                  returnNode.type === 'Identifier' &&
                  returnNode.name === '_ctx'
                ) {
                  if (hasWalkCtx) {
                    this.skip()
                  } else {
                    s.remove(node.start!, node.end!)
                    s.appendRight(
                      node.start!,
                      '\treturn {\n\t\t__RETURN__PROPERTY__\n\t}'
                    )
                  }
                  hasWalkCtx = true
                }
              }
            })
          }
        }
      })
    }
  }

  // Step 6. inject components property
  ;(function injectComponentsProperty() {
    const exportDefaultToken = 'export default {'
    const exportDefaultIdx = s.toString().indexOf(exportDefaultToken)
    if (Object.values(componentMap).length > 0) {
      const componentsProperty = `\n\tcomponents: { ${Object.values(
        componentMap
      ).join(',')} },`
      s.appendRight(
        exportDefaultIdx + exportDefaultToken.length + offset,
        componentsProperty
      )
    }
  })()

  // Step 7. inject return property
  ;(function injectReturnProperty() {
    const vnodes = Object.values(vnodeMap).join(',')
    const components = Object.values(componentMap).join(',')
    // choose vnode property, unchoose component property
    const returnBindings = bindingKeys
      .filter(key => {
        return vnodes.indexOf(key) !== -1 && components.indexOf(key) === -1
      })
      .join(',')

    // TODO try yo use s.overwrite()
    const content = s.toString().replace('__RETURN__PROPERTY__', returnBindings)

    scriptResult.append(content)
  })()

  // console.group('--- Transpile SetupScript To Script ---')
  // console.log(offset)
  // console.log(scriptContent)
  // console.log(scriptResult.toString().trim())
  // console.groupEnd()

  return scriptResult.toString().trim()
}

function doCompileTemplate(
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean
) {
  const templateResult = SFCCompiler.compileTemplate({
    source: descriptor.template!.content,
    filename: descriptor.filename,
    id,
    scoped: descriptor.styles.some(s => s.scoped),
    slotted: descriptor.slotted,
    ssr,
    ssrCssVars: descriptor.cssVars,
    isProd: false,
    compilerOptions: {
      bindingMetadata
    }
  })
  if (templateResult.errors.length) {
    store.errors = templateResult.errors
    return
  }

  const fnName = ssr ? `ssrRender` : `render`

  return (
    `\n${templateResult.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      `$1 ${fnName}`
    )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`
  )
}

export async function resetSFCCode({ filename, code, sfc }: File) {
  if (filename && code) {
    const { errors, descriptor } = SFCCompiler.parse(code, {
      filename,
      sourceMap: true
    })

    if (errors.length) {
      store.errors = errors
      return
    }

    let sfcCss = ''
    const dTemplateContent =
      (descriptor.template && descriptor.template.content) || ''
    const dScriptContent =
      (descriptor.script && descriptor.script.content) || ''
    const dScriptSetupContent =
      (descriptor.scriptSetup && descriptor.scriptSetup.content) || ''
    const scriptLang =
      (descriptor.script && descriptor.script.lang) ||
      (descriptor.scriptSetup && descriptor.scriptSetup.lang)

    // console.log(descriptor.template)
    // console.log(descriptor.script)
    // console.log(descriptor.scriptSetup)
    // console.log(descriptor.styles)

    sfc.isSetup =
      (descriptor.scriptSetup && descriptor.scriptSetup.setup) || false
    sfc.isTS = (scriptLang && scriptLang === 'ts') || false
    sfc.hasScoped = descriptor.styles.some(s => s.scoped)
    sfc.template = dTemplateContent.trim()
    sfc.script = sfc.isSetup
      ? dScriptSetupContent.trim()
      : dScriptContent.trim()
    sfc.setupScript = dScriptSetupContent.trim()

    for (const style of descriptor.styles) {
      sfcCss += style.content + '\n'
    }

    if (sfcCss) {
      sfc.style = sfcCss.trim()
    }
  }
}

async function hashId(filename: string) {
  const msgUint8 = new TextEncoder().encode(filename) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex.slice(0, 8)
}
