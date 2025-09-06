export default function handler(req, res) {
  res.json({ key: process.env.GEMINI_API_KEY });
}
