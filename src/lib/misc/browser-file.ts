export function download(filename: string, blob: Blob) {
  const link = document.createElement('a')

  link.setAttribute('download', filename)
  link.setAttribute('href', window.URL.createObjectURL(blob))

  link.click()
}

export function pickFile({accept = ".json"}): Promise<File> {
  return new Promise((resolve) => {
    const input = document.createElement('input')

    input.setAttribute('type', 'file')
    input.setAttribute('accept', accept)
    input.onchange = (e: any) => {
      resolve(e.target?.files[0])
    }

    input.click()
  })
}

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }

    reader.readAsText(file)
  })
}
