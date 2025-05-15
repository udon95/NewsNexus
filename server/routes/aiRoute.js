const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

router.use(express.json());
const { JSDOM } = require("jsdom");
//const { RolesAnywhere } = require("aws-sdk");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;

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
    //console.log("Moderation results:", JSON.stringify(data, null, 2));

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
      Even if the content could fit into several different categories, if the chosen category is one of them, answer "yes".

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

      EXAMPLE 3
      Category: Culinary  
      Article:
      “When is a restaurant like a handbag? A private dining room reservation … used.”  
      Answer: Yes

      NOW EVALUATE
      Category: ${category} 
      Article:
      ${content}
      Answer:
      `;

const jsonSchema = {
  schema: {
    type: "object",
    properties: {
      accuracy: { type: "number" },
      feedback: { type: "string" },
    },
    required: ["accuracy", "feedback"],
    additionalProperties: false,
  },
};

function extractFirstJsonObject(str) {
  // Find the first {...} block in the string
  const match = str.match(/{[\s\S]*}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", match[0]);
      throw new Error("Extracted JSON is not valid.");
    }
  }
  throw new Error("No JSON object found in response.");
}

function decodeUnicodeEscapes(str) {
  if (typeof str !== "string") return str;
  // Replace \xHH and \uHHHH with their actual characters
  return str
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

function cleanText(str) {
  const decoded = decodeUnicodeEscapes(str);
  // Replace non-breaking space (\u00A0) and soft hyphen (\u00AD) with a regular space
  return decoded.replace(/[\u00A0\u00AD]/g, " ");
}

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
      temperature: 0.2,
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
  let finalResult;

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
                      For every sentence or claim in the article, if it is false or unverifiable, wrap only the false or unverifiable part in <mark> tags. 
                      After each <mark> section, on a new line with a <br> tag, provide a parenthetical explanation of why it is inaccurate or cannot be verified. 
                      If the entire article is fictional, mark the entire article in <mark> tags and explain why.
                      
                      In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 0 means it is entirely inaccurate.
                      **Do not include any Markdown formatting, code blocks, or extra text** in your response.
                      Please return the following **exactly in a clean JSON format**:
                      {
                        "accuracy": <1 - 100>, 
                        "feedback": "The article contains false claims. 
                        Article: <original article HTML with <mark> around the inaccuracies> 
                        \n Explanation: <explanation/correction of the inaccuracies highlighted>"
                      }
                      The response must be **only** a single valid JSON object, no markdown, no code fences, no extra text.

                      Article:
                      ${content}
                      **If this article is fictional or based on fabricated events, set accuracy to 1.** `,
          },
          { role: "user", content },
        ],
        response_format: {
          type: "json_schema",
          json_schema: jsonSchema,
        },
      }),
    });
    console.log("Status code from Perplexity:", pxRes.status); // Check status code
    if (!pxRes.ok) {
      throw new Error(`Perplexity API error with status ${pxRes.status}`);
    }

    const pxData = await pxRes.json();
    const parsed = pxData.choices?.[0]?.message?.content;

    let presult = parsed;
    if (typeof presult === "string") {
      let cleaned = parsed.trim();
      cleaned = cleaned.replace(/^``````$/g, "");
      try {
        presult = JSON.parse(cleaned);
      } catch (e) {
        presult = extractFirstJsonObject(cleaned);
      }
    } else if (typeof presult === "object" && presult !== null) {
    } else {
      throw new Error("Perplexity response is neither string nor object.");
    }

    if (
      typeof presult.accuracy === "number" &&
      typeof presult.feedback === "string"
    ) {
      finalResult = {
        accuracy: presult.accuracy,
        feedback: presult.feedback,
      };
      console.log("perplexity final result:", finalResult);
    } else {
      throw new Error("Perplexity response missing expected fields.");
    }
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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant. For the following article, verify every claim using only information you can confirm from reliable, up-to-date sources. 
                    
                    If a claim refers to events after October 2023, clearly state that you cannot verify it because your knowledge only goes up to October 2023. Do not label such claims as fictional or fabricated-simply mark them as unverifiable due to your knowledge cutoff.
                    Only label an article as fictional if it describes events that are clearly invented or impossible, not merely because they are recent or outside your knowledge cutoff.
                    If you cannot find evidence for a claim within your knowledge, mark it as unverifiable and explain that it may be true but cannot be confirmed due to your knowledge cutoff.

                    For every sentence or claim in the article, if it is false or unverifiable, wrap only the false or unverifiable part in <mark> tags. 
                    After each <mark> section, on a new line with a <br> tag, provide a parenthetical explanation of why it is inaccurate or cannot be verified. 
                    If the entire article is fictional, mark the entire article in <mark> tags and explain why.

                    In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 1 means it is entirely inaccurate.
                    **If this article is fictional or based on fabricated events, set accuracy to 1.**
                    **If the content refers to recent events and ChatGPT cannot verify it, reduce the accuracy score.**
                    Please provide the analysis accordingly.

                    You must return only a single JSON object, no arrays, no markdown, no code fences, no extra text.
                    Use this exact shape:
                    {"accuracy":<1 - 100>,
                    "feedback":"The article contains false claims. 
                    Article: <original article HTML with <mark> around the inaccuracies>" 
                    \n Explanation: <explanation/correction of the inaccuracies highlighted>"}
                    The response must be **only** a single valid JSON object, no markdown, no code fences, no extra text.
                    
                    Article: 
                    ${content}
                    `,
          },
          { role: "user", content },
        ],
        temperature: 0.0,
      }),
    });
    console.log("Status code from Chatgpt:", gptRes.status);
    if (!gptRes.ok) {
      throw new Error(`Chatgpt API error with status ${gptRes.status}`);
    }
    const gptData = await gptRes.json();
    let gptParsed = gptData.choices[0].message.content;

    if (typeof gptParsed === "string") {
      let cleaned = gptParsed.trim().replace(/^``````$/g, "");
      try {
        gptParsed = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse ChatGPT response:", cleaned);
        throw new Error("ChatGPT response content is not valid JSON.");
      }
    } else if (typeof gptParsed === "object" && gptParsed !== null) {
    } else {
      throw new Error("ChatGPT response is neither string nor object.");
    }

    finalResult = {
      accuracy: gptParsed.accuracy,
      feedback: cleanText(gptParsed.feedback),
    };
    console.log("gpt final results", finalResult);
  }

  //console.log("parsed result:", result);
  const threshold = 75;
  if (!finalResult || typeof finalResult.accuracy !== "number") {
    throw {
      status: 500,
      error: "Fact-checking failed: result is missing or invalid.",
      result: finalResult,
    };
  }
  if (finalResult.accuracy < threshold) {
    throw {
      status: 400,
      error: "Article failed fact-checking.",
      ...finalResult,
    };
  }
  return finalResult;
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
    //console.log("stripped text for fact check", strippedText);

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
      factResult = await factCheck(strippedText, topicName);
      //console.log("stripped text", strippedText);
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

router.post("/check-article", async (req, res) => {
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
      factResult = await factCheck(strippedText, topicName);
    } catch (err) {
      console.error("Fact-check error:", err);

      return res.status(err.status || 400).json({
        error: err.error,
        ...(typeof err.accuracy === "number" && { accuracy: err.accuracy }),
        ...(err.feedback && { feedback: err.feedback }),
      });
    }

    return res.json({
      message: "Article fact checked successfully.",
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
