import { load } from "cheerio";
import dotenv from "dotenv";
import { decode, encode } from "gpt-3-encoder";
import { Configuration, OpenAIApi } from "openai";
import UserAgent from "user-agents";

dotenv.config();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const headers = { "User-Agent": new UserAgent(/Chrome/).toString() };
const url = "https://openai.com/blog/introducing-chatgpt-and-whisper-apis";
const html = await fetch(url, { headers }).then((res) => res.text());

const $ = load(html);
$("header, footer, aside, noscript").remove();
const content = $("main").length > 0 ? $("main p") : $("body p");
const validContent = decode(encode(content.text()).slice(0, 8000));

const chatCompletion = await openai.createChatCompletion({
  model: "gpt-4", // or gpt-3.5-turbo
  messages: [
    { role: "user", content: `Summarize in 1 paragraph: ${validContent}` },
  ],
});

const summary = chatCompletion.data.choices[0].message?.content;
console.log(summary);
