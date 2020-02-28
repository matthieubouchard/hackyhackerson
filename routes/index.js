var express = require("express");
var router = express.Router();
var fs = require("fs");
var axios = require("axios");

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

module.exports = router;
