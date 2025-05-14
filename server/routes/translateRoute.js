const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-southeast-1",
});

const translate = new AWS.Translate();
const polly = new AWS.Polly({ signatureVersion: "v4" });
// Splits `text` into pieces < maxLen characters, breaking on sentence end-punctuation.
function chunkText(text, maxLen = 4500) {
  // Grab sentences (including trailing .!? and whitespace)
  const sentences = text.match(/[^\.!\?]+[\.!\?]+(\s|$)/g) || [];
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      // If single sentence > maxLen, slice it
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.substr(i, maxLen));
        }
      } else {
        current = s;
      }
    } else {
      current += s;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const parts = chunkText(text, 4500);
    const translatedParts = [];

    for (const part of parts) {
      const { TranslatedText } = await translate
        .translateText({
          Text: part,
          SourceLanguageCode: "en",
          TargetLanguageCode: targetLang,
        })
        .promise();
      translatedParts.push(TranslatedText);
    }

    // Reassemble translated chunks
    const translatedText = translatedParts.join(" ");
    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({
      error: "An error occurred during translation.",
      stack: error.stack,
    });
  }
});

router.post("/text-to-speech", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    let voiceId;
    let languageCode;
    let usePolly = true;
    let engine = "standard";

    // Determine voice based on the target language
    switch (targetLang) {
      case "en":
        voiceId = "Jasmine";
        languageCode = "en-SG";
        engine = "neural";
        break;
      case "zh":
        voiceId = "Zhiyu";
        languageCode = "cmn-CN";
        break;

      case "ms":
        console.log("TTS for Malay not supported.");
        usePolly = false;
        break;
      case "ta":
        console.log("TTS for Tamil not supported.");
        usePolly = false;
        break;
      default:
        voiceId = "Jasmine";
        languageCode = "en-SG";
        engine = "neural";
    }

    if (!usePolly) {
      return res.status(400).json({
        error: "TTS is not supported via AWS Polly for the selected language.",
      });
    }
    const MAX = 3000;
    const segments = [];
    for (let i = 0; i < text.length; i += MAX) {
      segments.push(text.slice(i, i + MAX));
    }
    const buffers = [];
    for (const segment of segments) {
      const params = {
        Text: segment,
        OutputFormat: "mp3",
        VoiceId: voiceId,
        LanguageCode: languageCode,
        Engine: engine,
      };
      const { AudioStream } = await polly.synthesizeSpeech(params).promise();
      buffers.push(AudioStream);
    }

    // concatenate all mp3 buffers into one
    const finalAudio = Buffer.concat(buffers);
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": finalAudio.length,
    });
    return res.send(finalAudio);
  } catch (error) {
    console.error("TTS error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during the TTS process." });
  }
});

module.exports = router;
