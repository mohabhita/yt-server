import express from "express"
import ytdl from "@distube/ytdl-core"
import yts from "yt-search"
import cors from "cors"

const app = express()
app.use(cors())

// 🔍 search
app.get("/search", async (req, res) => {
  const q = req.query.q
  const result = await yts(q)
  res.json(result.videos.slice(0, 5))
})

// 🎬 download
app.get("/download", async (req, res) => {
  const url = req.query.url

  if (!ytdl.validateURL(url)) {
    return res.json({ error: "invalid url" })
  }

  const info = await ytdl.getInfo(url)

  const format = ytdl.chooseFormat(info.formats, {
    quality: "18"
  })

  res.json({
    title: info.videoDetails.title,
    download: format.url
  })
})

app.listen(3000, () => {
  console.log("YT Server Running 🚀")
})
