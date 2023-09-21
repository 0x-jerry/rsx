import BabelCore from '@babel/core'
import syntaxJsx from '@babel/plugin-syntax-jsx'

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
            if (nameNode.name.startsWith('on')) {
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
    },
  }
}
