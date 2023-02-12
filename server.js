const fs = require('fs');
const express = require('express')
const app = express()
const { Configuration, OpenAIApi } = require("openai")
const key = fs.readFileSync('./.env').toString()
const configuration = new Configuration({
  apiKey: key,
});
const index = fs.readFileSync('./index.html').toString();
const openai = new OpenAIApi(configuration);
app.get('/', (req, res) => {
    res.send(index);
});
app.get('/completion', async (req, res) => {
    console.log(req.query)
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    // res.flushHeaders(); // flush the headers to establish SSE with client
    // if(!req.body.prompt){
    if(!req.query.prompt){
        res.sendStatus(500);
        return;
    }
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: req.query.prompt,
        max_tokens: 2048,
        temperature: 0.6,
        stream: true,
        n: 10
    }, { responseType: 'stream' });

    completion.data.on('data', data => {
        console.log("result:",data.toString())
        const lines = data.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
                res.write(`data: ${message}\n\n`)
                res.end();
                return
            }
            const parsed = JSON.parse(message);
            console.log('message:', parsed)
            res.write(`data: ${parsed.choices[0].text}\n\n`)
        }
    });
        // console.log("response:",resp.data)
        // res.send(resp.data.choices[0].text)
});

app.listen(3000);