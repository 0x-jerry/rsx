import BabelCore from '@babel/core'
import syntaxJsx from '@babel/plugin-syntax-jsx'

const config = {
  excludePrefixReg: /^(on|_)/,
}

export function jsxPlugin({ types: t }: typeof BabelCore): BabelCore.PluginObj {
  return {
    name: 'babel-plugin-jsx',
    inherits: syntaxJsx.default,
    visitor: {
      JSXAttribute: {
        enter(path, state) {
          const valueNode = path.node.value
          const nameNode = path.node.name

          if (t.isJSXIdentifier(nameNode)) {
            const nodeName = nameNode.name

            if (config.excludePrefixReg.test(nodeName)) {
              return
            }
          }

          if (t.isJSXExpressionContainer(valueNode)) {
            if (t.isJSXEmptyExpression(valueNode.expression)) {
              return
            }
            const arrowFnExpress = t.arrowFunctionExpression(
              [],
              valueNode.expression,
            )

            valueNode.expression = arrowFnExpress
          }
        },
      },
      JSXElement: {
        enter(path) {
          for (const child of path.node.children) {
            if (t.isJSXExpressionContainer(child)) {
              const expression = child.expression
              if (t.isJSXEmptyExpression(expression)) {
                return
              }

              const arrowFnExpress = t.arrowFunctionExpression([], expression)

              child.expression = arrowFnExpress
            }
          }
        },
      },
    },
  }
}
