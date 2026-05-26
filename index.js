import { Platform, Innertube } from "youtubei.js"
import express from "express"
import yts from "yt-search"

Platform.shim.eval = (data, _env) => new Function(data.output)()

const app = express()
const yt = await Innertube.create()

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

app.get("/", (req, res) => {
  res.send("Server is working 🚀")
})

app.get("/search", async (req, res) => {
  const q = req.query.q
  if (!q) return res.send([])

  const r = await yts(q)
  res.send(r.videos.slice(0, 5).map(v => ({
    title: v.title,
    url: v.url
  })))
})

app.get("/download", async (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).json({ error: "Missing url parameter" })

  const videoId = extractVideoId(url)
  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" })

  try {
    const info = await yt.getBasicInfo(videoId)
    const formats = (info.streaming_data?.formats ?? [])
      .filter(f => f.mime_type?.startsWith("video/"))
      .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))
    
