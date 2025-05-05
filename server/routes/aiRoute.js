const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

router.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;

async function moderateText(content) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: content }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`OpenAI error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.results?.[0];
  } catch (err) {
    console.error("Moderation error: ", err.message || err);
    return { flagged: false, error: "Moderation failed or timed out." };
  }
}

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
  const { title, content, authorId, topicid, topicName } = req.body;

  if (!title || !content || !authorId || !topicid || !topicName) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const modResult = await moderateText(content);
  if (modResult?.flagged) {
    return res.status(400).json({
      error: "Content flagged as inappropriate by text moderation.",
    });
  }

  let factResult;
  try {
    factResult = await factCheck(content, topicName);
  } catch (err) {
    console.error("Fact-check error:", err);

    return res.status(err.status || 400).json({
      error: err.error,
      ...(typeof err.accuracy === "number" && { accuracy: err.accuracy }),
      ...(err.feedback && { feedback: err.feedback }),
    });
  }

  // Insert into `articles`
  const { data: inserted, error } = await supabase
    .from("articles")
    .insert([
      {
        title,
        text: content,
        userid: authorId,
        topicid,
        accuracy_score: factResult.accuracy,
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

  //   if (type === "opinion") {
  //     await supabase
  //       .from("room_articles")
  //       .insert([{ title, content, authorid: authorId }]);
  //     return res.json({ message: "Opinion article saved successfully." });
  //   }

  //   try {
  //     // Step 1: Check category match via GPT
  //     const catRes = await fetch("https://api.openai.com/v1/chat/completions", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${OPENAI_KEY}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         model: "gpt-3.5-turbo",
  //         messages: [
  //           {
  //             role: "system",
  //             content: "You are a category validation assistant.",
  //           },
  //           { role: "user", content: generateCategoryPrompt(content, topicName) },
  //         ],
  //         temperature: 0.2,
  //       }),
  //     });

  //     const catData = await catRes.json();
  //     const categoryMatch = catData.choices?.[0]?.message?.content
  //       .trim()
  //       .toLowerCase();

  //     if (!categoryMatch.includes("yes")) {
  //       return res.status(400).json({
  //         error: `Article content does not match the category "${topicName}".`,
  //       });
  //     }

  //     // Step 2: Real-time context via Perplexity
  //     let verdict = "";
  //     let explanation = "";
  //     let usedGPT = false;
  //     let gptMessage = "";

  //     try {
  //       const pxRes = await fetch("https://api.perplexity.ai/chat/completions", {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${PERPLEXITY_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           model: "sonar",
  //           messages: [
  //             {
  //               role: "system",
  //               content: `
  // You are a fact-checking assistant.

  // Please review the following article and verify its factual accuracy using up-to-date knowledge as of today.

  // For any false, misleading, or dubious claims:
  // - Wrap only the false or misleading text in <mark> tags.
  // - Immediately after each <mark> section, on a new line preceded by a <br> tag, provide an explanation in parentheses that details why the text is inaccurate.

  // In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 0 means it is entirely inaccurate.

  // Return your output in valid JSON format exactly as follows:
  // {"accuracy": <percentage between 0 and 100>, "feedback": "<Your explanation including any <mark> annotations if applicable>"}

  // Article:
  // ${content}
  // `,
  //             },
  //             {
  //               role: "user",
  //               content: content,
  //             },
  //           ],
  //         }),
  //       });

  //       const pxData = await pxRes.json();
  //       console.log("🟣 Perplexity raw:", pxData);
  //       const perplexityReply = pxData.choices?.[0]?.message?.content?.trim();
  //       const lowerReply = perplexityReply?.toLowerCase() || "";
  //       let factCheckResult;
  //       try {
  //         factCheckResult = JSON.parse(perplexityReply);
  //       } catch (error) {
  //         throw new Error("Perplexity returned an invalid JSON format.");
  //       }
  //       if (
  //         !perplexityReply ||
  //         lowerReply.includes("i'm not sure") ||
  //         lowerReply.includes("unknown") ||
  //         lowerReply.includes("cannot verify")
  //       ) {
  //         throw new Error("Perplexity returned unsure result.");
  //       }

  //       // If <mark> present, treat as failed check
  //       const failed = perplexityReply.includes("<mark>");

  //       if (failed) {
  //         return res.status(400).json({
  //           verdict: "failed",
  //           source: "perplexity",
  //           highlightedHTML: perplexityReply,
  //         });
  //       }
  //       const { accuracy, feedback } = factCheckResult;
  //       // Define a threshold (for example, 80) below which the article fails the fact-check
  //       const threshold = 75;
  //       if (accuracy < threshold) {
  //         return res.status(400).json({
  //           error: "Article failed fact-checking.",
  //           accuracy,
  //           feedback,
  //           source: "perplexity",
  //         });
  //       }

  //       return res.json({
  //         verdict: "passed",
  //         source: "perplexity",
  //         accuracy,
  //         feedback,
  //       });
  //     } catch (err) {
  //       console.warn("Perplexity failed or unsure — falling back to GPT.");

  //       usedGPT = true;

  //       const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${OPENAI_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           model: "gpt-3.5-turbo",
  //           messages: [
  //             {
  //               role: "system",
  //               content: `You are a fact-checking assistant.
  //                 Review the following article and highlight any **false or misleading** statements.
  //                 For any inaccuracies, describe the issues.
  //                 Then, provide an overall factual accuracy score as a number between 0 and 100.
  //                 If some parts are ambiguous but overall the article is largely accurate, note this in your score.
  //                 Return your response in valid JSON format in this exact structure:
  //                 {"accuracy": <percentage between 0 and 100>, "feedback": "<Your explanation>"}`,

  //               // Format:
  //               // - Wrap only the false or misleading **text** in "<mark>...</mark><br>".
  //               // - Directly after the marked text, add the explanation in **parentheses** like this:
  //               //   "(This statement is false because...)"
  //               // - Do NOT include the explanation inside the "<mark>" tags.
  //               // - Do NOT remove or alter the rest of the article.
  //               // - If everything is correct, return the original article **unchanged** (no <mark>, no explanation).

  //               //   Return the **entire article** with these annotations applied.
  //               // `,
  //             },
  //             {
  //               role: "user",
  //               content: content,
  //             },
  //           ],
  //           temperature: 0.2,
  //         }),
  //       });

  //       const gptData = await gptRes.json();
  //       const gptMessage = gptData.choices?.[0]?.message?.content || "";
  //       console.log(gptMessage);
  //       const explanation = gptMessage;
  //       const lowerMsg = gptMessage.toLowerCase();
  //       const containsFalseKeywords = [
  //         "false",
  //         "obviously-fake",
  //         "this is false",
  //         "not true",
  //         "misleading",
  //         "dubious",
  //         "<mark>",
  //       ];

  //       verdict = containsFalseKeywords.some((k) => lowerMsg.includes(k))
  //         ? "false"
  //         : "true";

  //       console.log("💬 GPT Verdict:", verdict);
  //       console.log("📝 GPT Explanation:", gptMessage);

  //       let factCheckResult;
  //       try {
  //         factCheckResult = JSON.parse(gptMessage);
  //       } catch (error) {
  //         console.error("Failed to parse GPT output as JSON:", error);
  //         return res
  //           .status(500)
  //           .json({ error: "Invalid response format from fact-checking." });
  //       }

  //       const accuracy = factCheckResult.accuracy;
  //       const feedback = factCheckResult.feedback;
  //       const threshold = 75; // Define your acceptance threshold

  //       if (accuracy < threshold) {
  //         return res.status(400).json({
  //           error: "Article failed fact-checking.",
  //           accuracy,
  //           feedback,
  //         });
  //       }

  //       if (verdict === "false") {
  //         return res.status(400).json({
  //           error: "Article failed fact-checking.",
  //           verdict,
  //           highlightedHTML: gptMessage,
  //         });
  //       }
  //     }

  // Step 3: Final fact-check
  // const factRes = await fetch("https://api.openai.com/v1/chat/completions", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${OPENAI_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: "gpt-3.5-turbo",
  //     messages: [
  //       {
  //         role: "system",
  //         content:
  //           "You are a fact-checking assistant. Respond with true, dubious, or false and a short reason.",
  //       },
  //       { role: "user", content: generateFactCheckPrompt(content, context) },
  //     ],
  //     temperature: 0.2,
  //   }),
  // });

  // const factData = await factRes.json();
  // const verdict = factData.choices?.[0]?.message?.content
  //   .trim()
  //   .toLowerCase();

  //   if (verdict.includes("false") || verdict.includes("dubious")) {
  //     return res.status(400).json({
  //       error: "Article failed fact-checking.",
  //       verdict,
  //       highlightedHTML: gptMessage,
  //     });
  //   }

  //   // Save to Supabase
  //   await supabase
  //     .from("articles")
  //     .insert([
  //       { title, text: content, userid: authorId, topicid, accuracy_score },
  //     ]);

  //   return res.json({
  //     message: "Factual article saved successfully.",
  //     verdict,
  //     accuracy: typeof accuracy !== "undefined" ? accuracy : undefined,
  //     feedback:
  //       explanation && explanation.includes("<mark>")
  //         ? explanation
  //         : explanation || null,
  //   });
  // } catch (err) {
  //   console.error("Article submission error:", err);
  //   res.status(500).json({ error: "Failed to submit article." });
  // }
});

router.post("/moderate", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "No content provided." });

  const result = await moderateText(content); // or use simpleModeration()

  if (result?.flagged) {
    return res.status(400).json({
      error: "Content flagged as inappropriate by text moderation.",
    });
  }
  res.status(200).json({ message: "Content passed moderation." });
});

module.exports = router;
