const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// OpenAIのセットアップ
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 質問をAIに選ばせるAPIエンドポイント
app.post('/api/next-question', async (req, res) => {
  const { history, questions } = req.body;

  const prompt = `
あなたは恋愛タイプ診断のアシスタントです。
これまでのユーザーの回答履歴は以下の通りです：
${history.join('\n')}

次の質問として、以下の選択肢の中から最適な質問を1つ選んで、その質問をそのまま返してください。
${questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

選んだ質問だけを返してください。
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const nextQuestion = completion.choices[0].message.content.trim();
    res.json({ nextQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI API Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
