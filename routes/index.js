var express = require("express");
var router = express.Router();
var fs = require("fs");
var axios = require("axios");
const constants = require('../lib/constants');
const candidateModels = require('../candidateModels');
const tf = require('@tensorflow/tfjs');

function saveJsonFile(fileName, data) {
  
  fs.writeFile(
    `./${fileName}.json`,
    JSON.stringify(data),
    (err, success) => {
      console.log("error?", err);
      console.log("success?", success);
    }
  );
}

/* GET home page. */
router.get("/", function(req, res, next) {
  res.json({success: true})
});

router.get("/tweeter/:name", async function(req, res, next) {
  const result = [];

  let lastFlag = null;
  const getTweets = async (flag = null) => {
    let url = `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${req.params.name}&count=200&tweet_mode=extended&include_rts=false`;

    if (!!flag) {
      url = url.concat(flag);
      console.log('FLAGGGGGG', flag)
    }

    const response = await axios({
      method: "get",
      url: url,
      headers: {
        Authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAAP0NCwEAAAAA9p3kxawPM9tZ0eRrpBi9ZcU%2F%2Bms%3Dm7w89YTtB2r1J7RCFNvy2DU1kh9O1LR2wTReMARNGxjsWvb1Rg"
      }
    });

    const tweets = response.data;
    const text = tweets.map(tweet => ({ text: tweet.full_text, id: tweet.id }));
    
    console.log("new batch", text);

    result.push(text);
    let id = text[text.length - 1].id;
    console.log("=====================ID=====================", id);
    lastFlag = `&max_id=${id}`;
  };

  for (let i = 0; (i <= 10); i++) {
    await getTweets(lastFlag);
  }

  console.log('LENTHSSSS', result.length)

  res.json(result);
  saveJsonFile(req.params.name, result);
});

router.get('/:name/', async function (req, res, next) {
  console.log(req.query)
  console.log(req.query.length);
  if(req.query.phrase.length >= 15){
    let phrase = req.query.phrase
    if(phrase.length > 15){
       phrase = phrase.substring(0, 15)
    }
    const candidate = req.params.name;

    const candidateConsts = constants[candidate];
    const encodedArray = oneHotEncode(phrase, candidateConsts);
    console.log(encodedArray);
    const encoderLength = Object.keys(candidateConsts.char_indices).length
    const model = await candidateModels[candidate];
    while(encodedArray.length < 140){
      console.log(encodedArray.length);
      const slicedArray = encodedArray.slice(encodedArray.length - 15, encodedArray.length);
      console.log('here is the sliced array');
      console.log(slicedArray);
      const tfEncodedArray = tf.tensor([slicedArray])
      const prediction = model.predict(tfEncodedArray)
      const arrayIndex = sample(prediction, .1);
      const letterArray = new Array(Object.keys(candidateConsts.char_indices).length).fill(0);
      letterArray[arrayIndex] = 1;
      encodedArray.push(letterArray);
    };
    // const tfEncodedArray = tf.tensor(encodedArray, [1, phraseLength, encoderLength])

    // const prediction = model.predict(tfEncodedArray)
    const decodedArray = oneHotDecode(encodedArray, candidateConsts)
    res.json(decodedArray);
  } else {
    res.json('phrase too short!')
  }
})

const oneHotEncode = (string, conversionThing) => {
  const stringArray = string.split('');
  return stringArray.map((letter) => {
    const letterIndex = conversionThing.char_indices[letter]
    const letterArray = new Array(Object.keys(conversionThing.char_indices).length).fill(0);
    letterArray[letterIndex] = 1;
    return letterArray;
  })

}

const oneHotDecode = (encodedArray, conversionThing) => {
  const arrayOfChars = encodedArray.map((innerArray) => {
    const charIndex = innerArray.indexOf(1)
    return conversionThing.indices_char[charIndex.toString()]
  })
  return arrayOfChars.join('');
}


const sample = (probs, temperature) => {
  return tf.tidy(() => {
    const logits = tf.exp(tf.div(tf.log(probs), Math.max(temperature, 1e-6)));
    const isNormalized = false;
    // `logits` is for a multinomial distribution, scaled by the temperature.
    // We randomly draw a sample from the distribution.
    return tf.multinomial(logits, 1, null, isNormalized).dataSync()[0];
  });
}


module.exports = router;
