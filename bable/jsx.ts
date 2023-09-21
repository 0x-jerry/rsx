import BabelCore from '@babel/core'
import syntaxJsx from '@babel/plugin-syntax-jsx'
import t from '@babel/types'

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
            convertJSXExpressionContainer(valueNode)
          }
        },
      },
      JSXElement: {
        enter(path) {
          for (const child of path.node.children) {
            if (t.isJSXExpressionContainer(child)) {
              convertJSXExpressionContainer(child)
            }
          }
        },
      },
    },
  }
}

function convertJSXExpressionContainer(node: t.JSXExpressionContainer) {
  if (t.isJSXEmptyExpression(node.expression)) {
    return
  }

  if (t.isLiteral(node.expression)) {
    return
  }

  const arrowFnExpress = t.arrowFunctionExpression([], node.expression)

  node.expression = arrowFnExpress

  return node
}
