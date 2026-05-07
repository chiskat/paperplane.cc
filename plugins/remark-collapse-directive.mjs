const OPEN_MARKER_RE = /^:{3,}\s*collapse(?:\s+(.*))?$/i
const CLOSE_MARKER_RE = /^:{3,}\s*$/

export default function remarkCollapseDirective() {
  return tree => {
    transformChildren(tree)
  }
}

function transformChildren(parent) {
  if (!Array.isArray(parent.children) || parent.children.length === 0) {
    return
  }

  const nextChildren = []

  for (let index = 0; index < parent.children.length; ) {
    const currentNode = parent.children[index]
    const marker = parseOpenMarker(currentNode)

    if (marker) {
      const closeMarker = findCloseMarker(parent.children, index + 1)

      if (closeMarker) {
        const contentChildren = [
          ...marker.inlineContent,
          ...parent.children.slice(index + 1, closeMarker.index),
        ]
        if (closeMarker.trailingContent) {
          contentChildren.push(closeMarker.trailingContent)
        }
        contentChildren.forEach(transformChildren)
        nextChildren.push(createCollapseNode(marker, contentChildren))
        index = closeMarker.index + 1
        continue
      }
    }

    transformChildren(currentNode)
    nextChildren.push(currentNode)
    index += 1
  }

  parent.children = nextChildren
}

function parseOpenMarker(node) {
  if (
    !node ||
    node.type !== 'paragraph' ||
    !Array.isArray(node.children) ||
    node.children.length === 0
  ) {
    return null
  }

  const firstTextIndex = node.children.findIndex(child => child?.type === 'text')

  if (firstTextIndex === -1) {
    return null
  }

  const firstText = node.children[firstTextIndex]
  const lines = firstText.value.split('\n')
  const matched = lines[0]?.trim().match(OPEN_MARKER_RE)

  if (!matched) {
    return null
  }

  const title = matched[1]?.trim() ?? ''
  const inlineParagraph = {
    ...node,
    children: node.children.map(child => ({ ...child })),
  }
  const inlineText = inlineParagraph.children[firstTextIndex]
  inlineText.value = lines.slice(1).join('\n').replace(/^\n+/, '')

  const inlineContent = hasMeaningfulChildren(inlineParagraph.children) ? [inlineParagraph] : []

  return {
    title,
    inlineContent,
  }
}

function findCloseMarker(nodes, startIndex) {
  for (let index = startIndex; index < nodes.length; index += 1) {
    const closeResult = parseCloseMarker(nodes[index])

    if (closeResult) {
      return {
        index,
        trailingContent: closeResult.trailingContent,
      }
    }
  }

  return null
}

function parseCloseMarker(node) {
  if (
    !node ||
    node.type !== 'paragraph' ||
    !Array.isArray(node.children) ||
    node.children.length === 0
  ) {
    return null
  }

  const lastTextIndex = findLastTextIndex(node.children)

  if (lastTextIndex === -1) {
    return null
  }

  const lastText = node.children[lastTextIndex]
  const lines = lastText.value.split('\n')
  const closingLine = lines.at(-1)?.trim() ?? ''

  if (!CLOSE_MARKER_RE.test(closingLine)) {
    return null
  }

  const nextParagraph = {
    ...node,
    children: node.children.map(child => ({ ...child })),
  }
  const nextLastText = nextParagraph.children[lastTextIndex]
  nextLastText.value = lines.slice(0, -1).join('\n').replace(/\n+$/, '')

  return {
    trailingContent: hasMeaningfulChildren(nextParagraph.children) ? nextParagraph : null,
  }
}

function createCollapseNode(marker, children) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'MdxCollapse',
    attributes: marker.title
      ? [{ type: 'mdxJsxAttribute', name: 'title', value: marker.title }]
      : [],
    children,
  }
}

function hasMeaningfulChildren(children) {
  return children.some(child => child?.type !== 'text' || child.value.trim() !== '')
}

function findLastTextIndex(children) {
  for (let index = children.length - 1; index >= 0; index -= 1) {
    if (children[index]?.type === 'text') {
      return index
    }
  }

  return -1
}
