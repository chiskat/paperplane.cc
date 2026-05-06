export default function remarkPlainTextDirective() {
  return (tree, file) => {
    transformChildren(tree, file)
  }
}

function transformChildren(parent, file) {
  if (!Array.isArray(parent.children) || parent.children.length === 0) {
    return
  }

  parent.children = parent.children.map(child => {
    if (child?.type === 'textDirective') {
      return {
        type: 'text',
        value: getSourceValue(child, file),
      }
    }

    transformChildren(child, file)

    return child
  })
}

function getSourceValue(node, file) {
  const source = file?.value
  const start = node?.position?.start?.offset
  const end = node?.position?.end?.offset

  if (typeof source === 'string' && Number.isInteger(start) && Number.isInteger(end)) {
    return source.slice(start, end)
  }

  return `:${node?.name ?? ''}`
}
