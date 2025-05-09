const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

router.use(express.json());
const { JSDOM } = require("jsdom");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;

// async function moderateText(content) {
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 8000);
//   try {
//     const res = await fetch("https://api.openai.com/v1/moderations", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${OPENAI_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ input: content }),
//       signal: controller.signal,
//     });
//     clearTimeout(timeout);
//     if (!res.ok) {
//       throw new Error(`OpenAI error: ${res.status} ${res.statusText}`);
//     }
//     const data = await res.json();
//     return data.results?.[0];
//   } catch (err) {
//     console.error("Moderation error: ", err.message || err);
//     return { flagged: false, error: "Moderation failed or timed out." };
//   }
// }

function extractTextFromHTML(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent || "";
}

async function moderateText(content) {
  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: content,
      }),
    });

    const data = await response.json();
    console.log("Moderation results:", JSON.stringify(data, null, 2));

    const flagged = data.results[0].flagged;
    return {
      flagged,
      details: data.results[0].categories,
      confidence: data.results[0].category_scores,
    };
  } catch (err) {
    console.error("Moderation error:", err.message || err);
    return { flagged: false, error: "Moderation failed." };
  }
}

async function moderateImages(imageUrls) {
  const client = new ImageAnnotatorClient();
  const flagged = [];
  const results = [];

  const levels = [
    "UNKNOWN",
    "VERY_UNLIKELY",
    "UNLIKELY",
    "POSSIBLE",
    "LIKELY",
    "VERY_LIKELY",
  ];

  for (const url of imageUrls) {
    const [res] = await client.safeSearchDetection(url);
    const safeSearch = res.safeSearchAnnotation || {};

    const isFlagged =
      levels.indexOf(safeSearch.adult) >= 3 ||
      levels.indexOf(safeSearch.violence) >= 3 ||
      levels.indexOf(safeSearch.racy) >= 3;

    results.push({ imageUrl: url, safeSearch, isFlagged });
    if (isFlagged) flagged.push(url);
  }

  return { flagged, results };
}

const deleteImagesFromSupabase = async (imageUrls) => {
  const articleBucket = "articles-images";
  const roomBucket = "room-article-images";
  const articlePaths = [];
  const roomPaths = [];

  for (const url of imageUrls) {
    if (url.includes(articleBucket)) {
      const parts = url.split(`${articleBucket}/`);
      if (parts[1]) articlePaths.push(parts[1]);
    } else if (url.includes(roomBucket)) {
      const parts = url.split(`${roomBucket}/`);
      if (parts[1]) roomPaths.push(parts[1]);
    }
  }

  if (articlePaths.length > 0) {
    const { error } = await supabase.storage
      .from(articleBucket)
      .remove(articlePaths);
    if (error) {
      console.error("Failed to delete from articles-images:", error.message);
    }
  }

  if (roomPaths.length > 0) {
    const { error } = await supabase.storage.from(roomBucket).remove(roomPaths);
    if (error) {
      console.error(
        "Failed to delete from room-article-images:",
        error.message
      );
    }
  }
};

const generateCategoryPrompt = (content, category) => `
You are a category validation assistant.

Determine if the following article content is relevant to the category "${category}".

Relevance includes people, places, events, policies, or topics that originate from or strongly affect the category.

Respond with one word only: "yes" or "no".
EXAMPLE 1
Category: Technology  
Article: “Modern GPU architectures push 4 nm transistors, AI inference on-chip…”  
Answer: Yes

EXAMPLE 2
Category: Technology  
Article: “Baking sourdough with wild yeast, tips on kneading dough…”  
Answer: No

NOW EVALUATE
Category: ${category} 
Article:
${content}
Answer:
`;

async function factCheck(content, topicName) {
  const catRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a category validation assistant." },
        { role: "user", content: generateCategoryPrompt(content, topicName) },
      ],
      temperature: 0.0,
    }),
  });

  const catData = await catRes.json();
  const rawCategory = catData.choices?.[0]?.message?.content;
  const categoryMatch = rawCategory ? rawCategory.trim().toLowerCase() : "";

  if (categoryMatch.startsWith("y")) {
  } else {
    throw {
      status: 400,
      error: `Article content does not match category: ${topicName}`,
    };
  }
  const threshold = 75;
  let result;

  //  Perplexity factual check
  try {
    const pxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant. 
                      Please review the following article and verify its factual accuracy using up-to-date knowledge as of today.

                      For any false, misleading, or dubious claims:
                      - Wrap only the false or misleading text in <mark> tags.
                      - Immediately after each <mark> section, on a new line preceded by a <br> tag, provide an explanation in parentheses that details why the text is inaccurate.

                      In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 0 means it is entirely inaccurate.

                      You must return _only_ a single JSON object, no arrays, no markdown, no code fences, no extra text.
                      Use this exact shape:
                      {"accuracy":<0 – 100>,"feedback":"The article contains false claims. 
                      Article: <original article HTML with <mark> around the inaccuracies>" 
                      \n Explanation: <explanation/correction of the inaccuracies highlighted>"}
                      
                      Article:
                      ${content}`,
          },
          { role: "user", content },
        ],
      }),
    });
    const pxData = await pxRes.json();

    const raw = pxData.choices?.[0]?.message?.content;

    if (/i['’]?m not sure|unknown|cannot verify/i.test(raw)) {
      throw new Error("Perplexity unsure");
    }
    let start = raw.indexOf("{");
    let end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error(
        "—couldn't find JSON braces in the model output!—\n" + raw
      );
    }

    const parsed = raw.substring(start, end + 1);
    result = JSON.parse(parsed);
  } catch (perpErr) {
    console.warn(
      "Perplexity fail to determine, falling back to ChatGPT:",
      perpErr.message
    );

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant.
                     Review the following article and highlight any **false or misleading** statements.
                     For any inaccuracies, describe the issues. 
                     Then, provide an overall factual accuracy score as a number between 0 and 100.
                     If some parts are ambiguous but overall the article is largely accurate, note this in your score.
                     Return your response only in a valid JSON object in this exact structure:
                    {"accuracy": <0 - 100>, "feedback": "The article contains false claims. 
                    Article: <original article HTML with <mark> around the inaccuracies>" 
                    \n Explanation: <explanation/correction of the inaccuracies highlighted>}
                    
                    Article: 
                    ${content}`,
          },
          { role: "user", content },
        ],
        temperature: 0.2,
      }),
    });
    const gptData = await gptRes.json();
    const parsed = JSON.parse(gptData.choices[0].message.content);
    result = parsed;
  }

  console.log("parsed result:", result);
  if (typeof result.accuracy !== "number" || result.accuracy < threshold) {
    throw {
      status: 400,
      error: "Article failed fact-checking.",
      ...result,
    };
  }
  return result;
}

router.post("/submit-article", async (req, res) => {
  try {
    const {
      title,
      content: updatedHTML,
      authorId,
      topicid,
      topicName,
      imageUrls = [],
    } = req.body;

    const strippedText = extractTextFromHTML(updatedHTML);

    if (!title || !updatedHTML || !authorId || !topicid || !topicName) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const modResult = await moderateText(strippedText);
    if (modResult?.flagged) {
      await deleteImagesFromSupabase(imageUrls);

      return res.status(400).json({
        error: "Content flagged as inappropriate by text moderation.",
        details: modResult,
      });
    }
    const visionResult = await moderateImages(imageUrls);
    if (visionResult.flagged.length > 0) {
      await deleteImagesFromSupabase(imageUrls);

      return res.status(400).json({
        error: "One or more images failed moderation.",
        flagged: visionResult.flagged,
        details: visionResult.results,
      });
    }

    let factResult;
    try {
      factResult = await factCheck(updatedHTML, topicName);
    } catch (err) {
      console.error("Fact-check error:", err);

      return res.status(err.status || 400).json({
        error: err.error,
        ...(typeof err.accuracy === "number" && { accuracy: err.accuracy }),
        ...(err.feedback && { feedback: err.feedback }),
      });
    }

    const imagepath = imageUrls.length > 0 ? imageUrls[0] : null;

    // Insert into `articles`
    const { data: inserted, error } = await supabase
      .from("articles")
      .insert([
        {
          title,
          text: updatedHTML,
          userid: authorId,
          topicid,
          accuracy_score: factResult.accuracy,
          imagepath,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("General insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      message: "Article saved successfully.",
      article: inserted,
      accuracy: factResult.accuracy,
      feedback: factResult.feedback,
    });
  } catch (err) {
    console.error("Failed submitting article error:", err);
    return res.status(500).json({ error: "Error during submission." });
  }
});

router.post("/moderate", async (req, res) => {
  const { content, imageUrls = [] } = req.body;
  if (!content) return res.status(400).json({ error: "No content provided." });

  const result = await moderateText(content);

  if (result?.flagged) {
    await deleteImagesFromSupabase(imageUrls);

    return res.status(400).json({
      error: "Content flagged as inappropriate.",
      details: result.details,
    });
  }

  const visionResult = await moderateImages(imageUrls);

  if (visionResult.flagged.length > 0) {
    await deleteImagesFromSupabase(imageUrls);

    return res.status(400).json({
      error: "Images flagged as inappropriate.",
      flagged: visionResult.flagged,
      details: visionResult.results,
    });
  }
  return res
    .status(200)
    .json({ message: "Content passed all moderation checks." });
});

router.post("/vision", async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res
        .status(400)
        .json({ error: "imageUrls must be a non-empty array." });
    }

    const { flagged, results } = await moderateImages(imageUrls);

    return res.status(200).json({
      message: " Google Vision SafeSearch completed",
      flagged,
      results,
    });
  } catch (err) {
    console.error("Vision API error:", err);
    return res.status(500).json({ error: "Failed to process Vision API." });
  }
});

module.exports = router;
