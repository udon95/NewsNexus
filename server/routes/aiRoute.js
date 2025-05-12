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
                      **Do not include any Markdown formatting, code blocks, or extra text** in your response.
                      Please return the following **exactly in a clean JSON format**:
                      {
                        "accuracy": <0 - 100>, 
                        "feedback": "The article contains false claims. 
                        Article: <original article HTML with <mark> around the inaccuracies> 
                        \n Explanation: <explanation/correction of the inaccuracies highlighted>"
                      }
                      The response must be **only** a single valid JSON object, no markdown, no code fences, no extra text.

                      Article:
                      ${content}
                      **If this article is fictional or based on fabricated events, set accuracy to 0.**
                      `,
          },
          { role: "user", content },
        ],
      }),
    });
    console.log("Status code from Perplexity:", pxRes.status); // Check status code
    const raw = await pxRes.text(); // Get raw response text first
    //console.log("Raw response from Perplexity:", raw);
    // const choices = pxData.choices?.[0]?.message?.content;
    // console.log("Status code from Perplexity:", pxRes.status); // Check status code
    //let cleanResponse = raw.replace(/```json\n|\n```/g, ""); // Strip the markdown block (```json...```)

    // If the status code is not 2xx, throw an error
    // if (!pxRes.ok) {
    //   const errorText = await pxRes.text(); // Get the error message if response is not okay
    //   console.error("Error response from Perplexity:", errorText);
    //   throw new Error(`Perplexity request failed with status ${pxRes.status}`);
    // }
    // if (/i['’]?m not sure|unknown|cannot verify/i.test(raw)) {
    //   throw new Error("Perplexity unsure");
    // }
    // let start = raw.indexOf("{");
    // let end = raw.lastIndexOf("}");
    // if (start === -1 || end === -1) {
    //   throw new Error(
    //     "—couldn't find JSON braces in the model output!—\n" + raw
    //   );
    // }
    // console.log("Raw response from Perplexity:", raw);
    const test = await pxRes.json();
    console.log("test json", test);

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
      console.log("parsed from perplexity", parsed);
    } catch (err) {
      console.error("Error parsing JSON response:", err.message);
      throw new Error("Failed to parse Perplexity response as JSON.");
    }

    if (
      !parsed ||
      !parsed.choices ||
      !parsed.choices[0] ||
      !parsed.choices[0].message
    ) {
      throw new Error(
        "Perplexity response does not contain the expected structure."
      );
    }
    let feedback = parsed.choices[0].message.content || "";
    //const accuracyMatch = feedback.match(/"accuracy":\s*(\d+)/); // Look for accuracy in the feedback

    //let accuracy = accuracyMatch ? parseInt(accuracyMatch[1], 10) : null;
    let accuracy = parsed.accuracy;
    console.log("parsed choice 0", feedback);

    if (accuracy === null) {
      console.warn("Accuracy field not found in the response.");
      accuracy = 1;
    }
    if (feedback.toLowerCase().includes("fictional")) {
      accuracy = 1; // Set accuracy to 0 if "fictional" is mentioned
    }
    try {
      const feedback = JSON.parse(feedback);
      //console.log("Parsed Perplexity response:", parsed);
      result = {
        accuracy: accuracy,
        feedback: feedback,
      };
    } catch (err) {
      console.error("Error cleaning feedback:", err.message);
      result = {
        accuracy: accuracy,
        feedback: feedback, // Default to raw feedback if it's not valid JSON
      };
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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant. Please review the following article and verify its factual accuracy using up-to-date knowledge as of today.

                    For any false, misleading, or dubious claims:
                    - Wrap only the false or misleading text in <mark> tags.
                    - Immediately after each <mark> section, on a new line preceded by a <br> tag, provide an explanation in parentheses that details why the text is inaccurate.

                    In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 0 means it is entirely inaccurate.

                    You must return only a single JSON object, no arrays, no markdown, no code fences, no extra text.
                    Use this exact shape:
                    {"accuracy":<0 - 100>,
                    "feedback":"The article contains false claims. 
                    Article: <original article HTML with <mark> around the inaccuracies>" 
                    \n Explanation: <explanation/correction of the inaccuracies highlighted>"}
                    The response must be **only** a single valid JSON object, no markdown, no code fences, no extra text.

                    Article: 
                    ${content}
                    **If this article is fictional or based on fabricated events, set accuracy to 1.**
                    **If the content refers to recent events and ChatGPT cannot verify it, reduce the accuracy score.**
                    Please provide the analysis accordingly.`,
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

  //console.log("parsed result:", result);
  const threshold = 75;

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
