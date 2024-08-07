import { Hono } from "hono";
import { Logtail } from "@logtail/edge";
import { getConnInfo } from "hono/cloudflare-workers";
import { html } from "hono/html";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  DB: D1Database;
  API_URL: string;
  API_KEY: string;
  BetterStackAPI: string;
};
export const createBaseLogger = (token: string) => new Logtail(token);

type CustomContext = {
  logger?: Logtail;
};

const app = new Hono<{ Bindings: Bindings; CustomContext: CustomContext }>();

app.use("*", async (c: any, next) => {
  const baseLogger = createBaseLogger(c.env.BetterStackAPI);
  const logger = baseLogger.withExecutionContext(c.executionCtx);

  c.set("logger", logger);
  await next();
});

app.get("/", (c: any) => {
  return c.html(
    html`<!DOCTYPE html>
      <p style="font-size:18px; padding:10px; max-width: 500px;">
        Welcome to your Falcon AI Assistant API, where we've brought the future
        of AI to your doorstep! 🎉 This project was built for the Falcon
        Hackathon challenge 2024, showcasing the power of Cloudflare Workers and
        Hono. 🌩️
      </p>`
  );
});

app.post("/ai", async (c: any) => {
  const logger = c.get("logger");
  try {
    c.header("Content-Type", "application/json");
    const { text } = await c.req.json();
    logger.info("POST /ai request received", { text });

    const response = await fetch(c.env.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: c.env.API_KEY,
      },
      body: JSON.stringify({
        model: "tiiuae/falcon-180b-chat",
        messages: [
          {
            role: "system",
            content: `Your role: Explain English words and phrases in simple terms for non-native speakers. For each word or phrase:

Provide a clear, simple definition using basic vocabulary.
Break down any complex ideas into easy-to-understand concepts.
Give three short, practical examples of how the word or phrase is used in everyday situations.
Use simple sentence structures and avoid idioms or complex grammar.

Format your response like this:
Word/Phrase: [Word or phrase here]
Definition: [Simple explanation]
Examples:

[First example]
[Second example]
[Third example]

Here are three examples of how this prompt could be used:
Example 1:
Word/Phrase: Break the ice
Definition: To do or say something that makes people feel more relaxed in a social situation, especially when meeting for the first time.
Examples:

At the party, Tom told a funny joke to break the ice with his new neighbors.
The teacher played a game to break the ice on the first day of class.
Sarah brought cookies to break the ice at the office meeting with new team members.`,
          },
          { role: "user", content: `what is ${text}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Error from API: ${errorText}`);
      return c.json({ error: "Failed to fetch from API" }, 500);
    }

    const data = (await response.json()) as any;
    logger.info("POST /ai response received", { data });
    return c.json(data);
  } catch (error) {
    logger.error(`Error in /ai route: ${error}`);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/store", async (c: any) => {
  const logger = c.get("logger");
  const body = await c.req.json();

  logger.info("Received data", { body });

  const supabase = createClient(
    "https://patjwswoibcrlqkledys.supabase.co",
    `${c.env.supabase}`
  );
  const id = body.userId;
  const word = body.savedWords[0].text;
  const website = body.savedWords[0].url;
  const definition = body.savedWords[0].aiResponse;
  const time = body.savedWords[0].time;
  const { data, error } = await supabase
    .from("Faclon")
    .insert([
      {
        id: id,
        word: word,
        defination: definition,
        website: website,
        time: time,
      },
    ])
    .select();

  if (error) {
    logger.error("Error inserting data:", error);
    return c.json({ error: `Error inserting data` }, 500);
  }

  c.header("Content-Type", "application/json");
  return c.json({ success: true, data });
});

app.get("/customers/:id", async (c: any) => {
  const logger = c.get("logger");
  const customerId = c.req.param("id");
  const result = await c.env.DB.prepare("SELECT * FROM customers WHERE id =?")
    .bind(customerId)
    .all();
  logger.info("GET /customers/:id request received", { customerId });

  c.header("Content-Type", "application/json");
  // Return the response body as JSON
  return c.json(result);
});

app.get("/generate", (c: any) => {
  c.header("Content-Type", "application/json");
  const logger = c.get("logger");
  const randomId = () => {
    let id = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 22; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
  };
  const info = getConnInfo(c);
  const cf = c.req.raw.cf;

  const generatedId = randomId();
  logger.info(
    `🔨 \x1b[1;32mGenerated ID:\x1b[0m \x1b[1;90m${generatedId}\x1b[0m from 🌐 ${cf.asOrganization} - ${info.remote.address}`
  );
  return c.json([{ id: generatedId }]);
});

export default app;
