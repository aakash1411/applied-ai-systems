import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

const MAX_SIZE = 5 * 1024 * 1024

export function validateFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const allowed = ['pdf', 'txt', 'md']
  if (!allowed.includes(ext)) {
    return { valid: false, error: `Unsupported file type: .${ext}. Use PDF, TXT, or MD.` }
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 5MB.` }
  }
  return { valid: true }
}

async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str).join(' '))
  }
  return pages.join('\n\n')
}

async function parseText(file) {
  return await file.text()
}

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  switch (ext) {
    case 'pdf': return await parsePdf(file)
    case 'txt':
    case 'md': return await parseText(file)
    default: throw new Error(`Unsupported: .${ext}`)
  }
}
