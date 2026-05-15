const OPEN_MARKER_RE = /^:{3,}\s*code-group\s*$/
const CLOSE_MARKER_RE = /^:{3,}\s*$/
const CODE_GROUP_DIRECTIVE_NAME = 'code-group'

export default function remarkCodeGroup() {
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

    if (isCodeGroupDirective(currentNode)) {
      const groupNode = createCodeGroup(currentNode.children ?? [])

      if (groupNode) {
        nextChildren.push(groupNode)
        index += 1
        continue
      }
    }

    if (isMarkerParagraph(currentNode, OPEN_MARKER_RE)) {
      const closeIndex = findCloseMarker(parent.children, index + 1)

      if (closeIndex !== -1) {
        const groupNode = createCodeGroup(parent.children.slice(index + 1, closeIndex))

        if (groupNode) {
          nextChildren.push(groupNode)
          index = closeIndex + 1
          continue
        }
      }
    }

    transformChildren(currentNode)
    nextChildren.push(currentNode)
    index += 1
  }

  parent.children = nextChildren
}

function isCodeGroupDirective(node) {
  return node?.type === 'containerDirective' && node?.name === CODE_GROUP_DIRECTIVE_NAME
}

function findCloseMarker(nodes, startIndex) {
  for (let index = startIndex; index < nodes.length; index += 1) {
    if (isMarkerParagraph(nodes[index], CLOSE_MARKER_RE)) {
      return index
    }
  }

  return -1
}

function isMarkerParagraph(node, marker) {
  if (!node || node.type !== 'paragraph' || node.children?.length !== 1) {
    return false
  }

  const [firstChild] = node.children

  return (
    firstChild?.type === 'text' &&
    typeof firstChild.value === 'string' &&
    marker.test(firstChild.value.trim())
  )
}

function createCodeGroup(nodes) {
  if (nodes.length === 0 || nodes.some(node => node.type !== 'code')) {
    return null
  }

  return createElement(
    'CodeGroup',
    [],
    nodes.map((node, index) => {
      const { label, meta } = extractTabInfo(node.meta, node.lang, index)

      return createElement(
        'CodeGroupItem',
        [{ type: 'mdxJsxAttribute', name: 'label', value: label }],
        [
          {
            ...node,
            meta,
          },
        ]
      )
    })
  )
}

function extractTabInfo(meta, lang, index) {
  const rawMeta = meta?.trim() ?? ''
  const titleMatch = rawMeta.match(/\[([^\]]+)\]/)
  const label = titleMatch?.[1]?.trim() || lang?.trim() || `代码 ${index + 1}`
  const cleanedMeta = rawMeta
    .replace(titleMatch?.[0] ?? '', '')
    .trim()
    .replace(/\s{2,}/g, ' ')

  return {
    label,
    meta: cleanedMeta || null,
  }
}

function createElement(name, attributes, children) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  }
}
