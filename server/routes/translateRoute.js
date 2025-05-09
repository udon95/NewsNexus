const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

// Configure AWS (ensure your AWS credentials are set up properly)
AWS.config.update({
  region: "ap-southeast-1",
});

// Initialize AWS services
const translate = new AWS.Translate();
const polly = new AWS.Polly({ signatureVersion: "v4" });

// Translation endpoint: Translates text to the target language
router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    // Example: assuming text is in English; targetLang should be one of "en", "zh", "ms", or "ta"
    const params = {
      Text: text,
      SourceLanguageCode: "en",
      TargetLanguageCode: targetLang,
    };
    const result = await translate.translateText(params).promise();
    return res.status(200).json({ translatedText: result.TranslatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during translation.", stack: error.stack });
  }
});

// Text-to-Speech endpoint: Synthesize speech from text using AWS Polly if supported
router.post("/text-to-speech", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    let voiceId;
    let languageCode;
    let usePolly = true;

    // Determine voice based on the target language
    switch (targetLang) {
      case "en":
        voiceId = "Joanna"; // or "Matthew"
        languageCode = "en-US";
        break;
      case "zh": // Simplified Chinese
        voiceId = "Zhiyu";
        languageCode = "cmn-CN";
        break;

      case "ms": // Malay – not supported by AWS Polly
        console.log("TTS for Malay not supported.");
        usePolly = false;
        break;
      case "ta": // Tamil – not supported by AWS Polly
        console.log("TTS for Tamil not supported.");
        usePolly = false;
        break;
      default:
        voiceId = "Joanna";
        languageCode = "en-US";
    }

    if (!usePolly) {
      return res.status(400).json({
        error: "TTS is not supported via AWS Polly for the selected language.",
      });
    }

    const params = {
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      LanguageCode: languageCode,
    };

    polly.synthesizeSpeech(params, (err, data) => {
      if (err) {
        console.error("AWS Polly error:", err);
        return res
          .status(500)
          .json({ error: "An error occurred during TTS synthesis." });
      }
      if (data && data.AudioStream instanceof Buffer) {
        res.set({
          "Content-Type": "audio/mpeg",
          "Content-Length": data.AudioStream.length,
        });
        return res.send(data.AudioStream);
      } else {
        return res.status(500).json({ error: "Audio stream is empty." });
      }
    });
  } catch (error) {
    console.error("Synthesize speech error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during the TTS process." });
  }
});

// You can also keep your existing article logic here

module.exports = router;
