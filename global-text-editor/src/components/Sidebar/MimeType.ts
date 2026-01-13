
const mimeTypes = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'default': 'text/plain'
}

export function computeMimeTypeFromName(trimmedFilename: string): string {

  const lastDot = trimmedFilename.lastIndexOf('.')

  // no dot, or dot is the last character
  if (lastDot === -1 || lastDot === trimmedFilename.length - 1) 
    return mimeTypes['default']

  // extension without the dot
  const ext = trimmedFilename.slice(lastDot + 1).toLowerCase()

  switch (ext) {
    case 'txt':
      return mimeTypes['txt']

    case 'md':
    case 'markdown':
      return mimeTypes['md']

    // unknown extension
    default:
      return mimeTypes['default']
  }
}
