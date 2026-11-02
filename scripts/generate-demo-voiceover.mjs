import fs from "node:fs/promises";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const outputDirectory = new URL("../video/chatgeist-demo/assets/", import.meta.url);

const clips = [
  {
    filename: "narration-intro.mp3",
    text: "On Twitch, communities move faster than streamers can read. Chatgeist turns that flood into a living, accountable decision co-host."
  },
  {
    filename: "narration-proof.mp3",
    text: "These are real Twitch messages arriving through EventSub. A poll reduces people to percentages. A chatbot adds another speaker. Chatgeist opens a timed natural-language evidence window, forms supported factions, and keeps every source visible. The streamer can choose the next challenge, rule, or story direction without hiding the minority voice."
  },
  {
    filename: "narration-outro.mp3",
    text: "For creators, this turns audience participation into repeatable content: a decision ritual, an on-stream objective, and a shareable artifact. For Twitch, chat stops being a disappearing sidebar and becomes a co-author of the show. Codex designed, implemented, tested, and visually reviewed the complete system. Chatgeist: summon your community, lock the outcome."
  }
];

for (const clip of clips) {
  const speech = await client.audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
    voice: "coral",
    input: clip.text,
    instructions: "Confident product-film narrator. Warm, intelligent, precise, cinematic but restrained. Brisk pace. Clear consonants. No exaggerated trailer voice.",
    response_format: "mp3"
  });
  await fs.writeFile(new URL(clip.filename, outputDirectory), Buffer.from(await speech.arrayBuffer()));
  console.log(`generated ${clip.filename}`);
}
