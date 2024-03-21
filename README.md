# Media Looper

Browser extension to allow the creation of loops.

Currently, only supporting Chrome browser and YouTube videos.

## Keyboard shortcuts

`z` - Start loop recording
`z` - End loop recording (after started)
`z` - Seek to begin of loop (when loop is active)

## Development

Here are instructions on how to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have the following installed on your machine:

- Babashka
- Node.js
- Clojure CLI

```bash
npm install
```

### Compiling

Compile the extension with the following command:

```bash
bb dev
```

### Install and test

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable `Developer mode`
4. Click on `Load unpacked`
5. Select the `shells/chrome` folder (inside the project folder)
