export function setTextContent(parent, selector, text) {
  if (!parent) return;
  const element = parent.querySelector(`[data-id="${selector}"]`);
  if (element) element.textcontent = text;
}
