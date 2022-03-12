console.log('Starting - hey node.js here!')

const fs = require('fs')
const path = require('path')

const express = require('express')
const app = express()
const port = 3000

app.listen(port, () => console.log(`Ready - app listening on http://localhost/${port}`))
// app.get('/', (req, res) => res.send('Hello World!'))

// serve html:
app.get('/', (req, res) => {
  console.log('> http request received');
  try {
    res.sendFile(__dirname + '/public/index.html')
  } catch (error) {
    res.status(500).send('internal server error:', error)
  }
})

app.get('/video', (req, res) => {
  // indicates the part of a document that the server should return
  // on this measure in bytes for example: range = 0-6 bytes.
  const range = req.headers.range
  if (!range) res.status(400).send('Range must be provided')

  const videoPath = path.join(__dirname, 'public/video', 'video.mp4')
  // extract video size by using statSyn()
  const videoSize = fs.statSync(videoPath).size
  // 10 powered by 6 equal 1000000bytes = 1mb
  const chunkSize = 10 ** 6

  // calculating video where to start and where to end.
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + chunkSize, videoSize - 1)
  const contentLength = end - start + 1

  // setup video headers
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  }
  res.writeHead(206, headers)
  // creating readStream (stdin).
  const videoStream = fs.createReadStream(videoPath, { start, end })

  // create live stream pipe line
  videoStream.pipe(res)
})