const ALERT_TYPES = new Set(['info', 'tip', 'warning', 'danger', 'note', 'important', 'caution'])
const OPEN_MARKER_RE = /^:{3,}\s+([A-Za-z][\w-]*)(?:\s+(.*))?$/
const CLOSE_MARKER_RE = /^:{3,}\s*$/

export default function remarkAlertDirective() {
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
    const inlineAlert = createInlineAlert(currentNode)

    if (inlineAlert) {
      nextChildren.push(inlineAlert)
      index += 1
      continue
    }

    const openMarker = getOpenMarker(currentNode)

    if (openMarker) {
      const closeIndex = findCloseMarker(parent.children, index + 1)

      if (closeIndex !== -1) {
        nextChildren.push(createAlertNode(openMarker, parent.children.slice(index + 1, closeIndex)))
        index = closeIndex + 1
        continue
      }
    }

    transformChildren(currentNode)
    nextChildren.push(currentNode)
    index += 1
  }

  parent.children = nextChildren
}

function createInlineAlert(node) {
  if (!node || node.type !== 'paragraph' || !Array.isArray(node.children)) {
    return null
  }

  const firstText = node.children[0]
  const lastText = node.children.at(-1)

  if (firstText?.type !== 'text' || lastText?.type !== 'text') {
    return null
  }

  const firstLines = firstText.value.split('\n')
  const openMarker = parseOpenMarker(firstLines[0]?.trim())

  if (!openMarker) {
    return null
  }

  const lastLines = lastText.value.split('\n')
  const closingLine = lastLines.at(-1)?.trim()

  if (!CLOSE_MARKER_RE.test(closingLine ?? '')) {
    return null
  }

  const nextChildren = node.children.map(child => ({ ...child }))
  nextChildren[0].value = firstLines.slice(1).join('\n').replace(/^\n+/, '')
  nextChildren[nextChildren.length - 1].value = lastLines
    .slice(0, -1)
    .join('\n')
    .replace(/\n+$/, '')

  const contentChildren = nextChildren.filter(child => child.type !== 'text' || child.value !== '')

  return createAlertNode(
    openMarker,
    contentChildren.length > 0 ? [{ ...node, children: contentChildren }] : []
  )
}

function getOpenMarker(node) {
  if (!node || node.type !== 'paragraph' || node.children?.length !== 1) {
    return null
  }

  const [firstChild] = node.children

  if (firstChild?.type !== 'text' || typeof firstChild.value !== 'string') {
    return null
  }

  return parseOpenMarker(firstChild.value.trim())
}

function parseOpenMarker(value) {
  const matched = value?.match(OPEN_MARKER_RE)

  if (!matched) {
    return null
  }

  const type = matched[1].toLowerCase()

  if (!ALERT_TYPES.has(type)) {
    return null
  }

  return {
    type,
    title: matched[2]?.trim() ?? '',
  }
}

function findCloseMarker(nodes, startIndex) {
  for (let index = startIndex; index < nodes.length; index += 1) {
    if (isCloseMarker(nodes[index])) {
      return index
    }
  }

  return -1
}

function isCloseMarker(node) {
  if (!node || node.type !== 'paragraph' || node.children?.length !== 1) {
    return false
  }

  const [firstChild] = node.children

  return firstChild?.type === 'text' && CLOSE_MARKER_RE.test(firstChild.value.trim())
}

function createAlertNode(marker, children) {
  return createElement(
    'MdxAlert',
    [
      { type: 'mdxJsxAttribute', name: 'type', value: marker.type },
      ...(marker.title ? [{ type: 'mdxJsxAttribute', name: 'title', value: marker.title }] : []),
    ],
    children
  )
}

function createElement(name, attributes, children) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  }
}
