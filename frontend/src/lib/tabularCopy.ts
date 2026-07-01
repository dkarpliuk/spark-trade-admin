import { type RefObject,useEffect } from 'react'

function handleTabularCopy(event: ClipboardEvent, el: HTMLElement) {
  const selection = document.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (!el.contains(range.commonAncestorContainer)) return

  const cells = Array.from(range.cloneContents().querySelectorAll<HTMLElement>('[data-cell]'))
  if (cells.length === 0) return

  const rows = Map.groupBy(cells, (cell) => cell.closest('[data-row]'))
  const data = Array.from(rows.values(), (row) => row.map((cell) => cell.textContent ?? '').join('\t')).join('\n')

  event.clipboardData?.setData('text/plain', data)
  event.preventDefault()
}

export function useTabularCopy(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onCopy = (event: ClipboardEvent) => handleTabularCopy(event, el)
    el.addEventListener('copy', onCopy)
    return () => el.removeEventListener('copy', onCopy)
  }, [ref])
}
