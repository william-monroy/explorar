const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.json());
app.use(cors());
const port = 3007;

require("dotenv").config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.get("/api/accuracy", async (req, res) => {
  // const { word, input } = req.body;
  const { word, input } = req.query;

  // console.log(req.query);
  if (!word || !input) {
    res.status(400).send("Missing word or input");
    return;
  }

  const definitionRes = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Define de manera breve el significado de la palabra: "${word}".`,
    temperature: 0.7,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  // console.log("definitionRes", definitionRes.data);
  const definition = definitionRes.data.choices[0].text.replace("\n", "");

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Siendo: "${definition}" la definicion de la palabra "${word}".\nDado el siguiente input: "${input}". Dame una puntuación en porcentaje de que tan precisa es la definicion del input con la definicion de la palabra "${word}".\nMuestra el resultado en formato JSON con la única key “accuracy” que vaya de un valor entre 0 a 100 y no des mas explicaciones ni una palabra mas que no sea el codigo JSON\n`,
    temperature: 0.7,
    max_tokens: 20,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const accuracy = JSON.parse(response.data.choices[0].text.replace("\n", ""));
  // console.log(accuracy);
  res.send(accuracy);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
