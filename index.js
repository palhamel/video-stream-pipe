console.log('Starting - hey node.js here!')

const fs = require('fs')
const path = require('path')

const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

// const corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

app.use(cors())

app.listen(port, () => console.log(`CORS-enabled web server listening on http://localhost/${port}`))
// app.get('/', (req, res) => res.send('Hello World!'))

// serve html:
app.get('/', (req, res) => {
  console.log('> http request received')
  try {
    res.sendFile(__dirname + '/public/index.html')
  } catch (error) {
    res.status(500).send('internal server error:', error)
  }
})

// Movie API:
// External movie

app.get('/video', (req, res) => {
  // console.log(typeof(extLink))
  // indicates the part of a document that the server should return
  // on this measure in bytes for example: range = 0-6 bytes.
  const range = req.headers.range
  if (!range) res.status(400).send('Range must be provided')

  const videoPath = path.join(__dirname, 'public/video', 'BigBuckBunny.mp4')
  console.log(videoPath)

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

// serving poster image;
app.get('/:file_name', (req, res) => {
  try {
    res.sendFile(__dirname + '/public/images/' + req.params.file_name)
  } catch (err) {
    res.status(500).send('internal server error occurred')
  }
})
