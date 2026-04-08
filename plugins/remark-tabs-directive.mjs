const TABS_DIRECTIVE_NAME = 'tabs'
const TAB_DIRECTIVE_NAME = 'tab'
const CLOSE_MARKER_RE = /^:::\s*$/

export default function remarkTabsDirective() {
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
    const child = parent.children[index]

    if (isTabsDirective(child)) {
      transformChildren(child)
      const { tabsNode, consumed } = createTabsNodeFromSequence(parent.children, index)

      if (tabsNode) {
        nextChildren.push(tabsNode)
        index += consumed
        continue
      }
    } else {
      transformChildren(child)
    }

    nextChildren.push(child)
    index += 1
  }

  parent.children = nextChildren
}

function isTabsDirective(node) {
  return node?.type === 'containerDirective' && node?.name === TABS_DIRECTIVE_NAME
}

function isTabDirective(node) {
  return node?.type === 'containerDirective' && node?.name === TAB_DIRECTIVE_NAME
}

function isCloseMarkerParagraph(node) {
  if (!node || node.type !== 'paragraph' || node.children?.length !== 1) {
    return false
  }

  const [firstChild] = node.children

  return (
    firstChild?.type === 'text' &&
    typeof firstChild.value === 'string' &&
    CLOSE_MARKER_RE.test(firstChild.value.trim())
  )
}

function createTabsNodeFromSequence(nodes, startIndex) {
  const tabsContainer = nodes[startIndex]
  const ownChildren = tabsContainer?.children ?? []

  if (ownChildren.length === 0 || ownChildren.some(child => !isTabDirective(child))) {
    return { tabsNode: null, consumed: 1 }
  }

  const collectedTabs = [...ownChildren]
  let cursor = startIndex + 1
  let sawExtraTabs = false
  let foundCloseMarker = false

  while (cursor < nodes.length) {
    const node = nodes[cursor]

    if (isTabDirective(node)) {
      transformChildren(node)
      collectedTabs.push(node)
      sawExtraTabs = true
      cursor += 1
      continue
    }

    if (isCloseMarkerParagraph(node)) {
      foundCloseMarker = true
      cursor += 1
    }

    break
  }

  if (sawExtraTabs && !foundCloseMarker) {
    return {
      tabsNode: createTabsNode(tabsContainer, ownChildren),
      consumed: 1,
    }
  }

  const tabsNode = createTabsNode(tabsContainer, collectedTabs)
  const consumed = foundCloseMarker || sawExtraTabs ? cursor - startIndex : 1

  return { tabsNode, consumed }
}

function createTabsNode(tabsContainer, tabDirectives) {
  if (tabDirectives.length === 0) {
    return null
  }

  const tabs = tabDirectives.map((tabNode, index) => createTabNode(tabNode, index))

  return createElement('MdxTabs', toMdxAttributes(tabsContainer.attributes), tabs)
}

function createTabNode(node, index) {
  const { contentChildren, directiveLabel } = splitDirectiveLabel(node.children ?? [])
  const attributes = normalizeAttributes(node.attributes)
  const label = pickTabLabel(directiveLabel, attributes, index)
  const value = pickTabValue(attributes, index)

  return createElement(
    'MdxTab',
    toMdxAttributes({
      ...attributes,
      label,
      value,
    }),
    contentChildren
  )
}

function pickTabLabel(directiveLabel, attributes, index) {
  return (
    toStringOrEmpty(attributes.label) ||
    toStringOrEmpty(attributes.title) ||
    toStringOrEmpty(directiveLabel) ||
    `选项 ${index + 1}`
  )
}

function pickTabValue(attributes, index) {
  const rawValue = toStringOrEmpty(attributes.value) || toStringOrEmpty(attributes.id)
  const baseValue = rawValue || `tab-${index + 1}`

  return slugify(baseValue) || `tab-${index + 1}`
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toStringOrEmpty(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function normalizeAttributes(attributes) {
  if (!attributes) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [key === 'class' ? 'className' : key, value])
  )
}

function toMdxAttributes(attributes = {}) {
  return Object.entries(attributes).map(([name, value]) => ({
    type: 'mdxJsxAttribute',
    name,
    value: value === undefined ? null : value,
  }))
}

function splitDirectiveLabel(children) {
  const [firstChild] = children

  if (isDirectiveLabelParagraph(firstChild)) {
    return {
      directiveLabel: toPlainText(firstChild).trim(),
      contentChildren: children.slice(1),
    }
  }

  return {
    directiveLabel: '',
    contentChildren: children,
  }
}

function isDirectiveLabelParagraph(node) {
  return node?.type === 'paragraph' && node?.data?.directiveLabel === true
}

function toPlainText(node) {
  if (!node) {
    return ''
  }

  if (typeof node.value === 'string') {
    return node.value
  }

  if (!Array.isArray(node.children)) {
    return ''
  }

  return node.children.map(toPlainText).join('')
}

function createElement(name, attributes, children) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  }
}
