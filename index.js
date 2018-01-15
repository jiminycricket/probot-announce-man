const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const httpRequest = require("request")
const defaultConfig = require('./lib/defaultConfig')

module.exports = (robot) => {
  robot.on('release', announceSlack);
}

async function announceSlack (context) {
  const userConfig = await context.config('announce_man.yml')
  const config = Object.assign({}, defaultConfig, userConfig)
  
  const { payload } = context;
  const { release, repository } = payload;

  const repoName = repository.full_name;
  const releaseBody = release.body;
  const releaseTag = release.tag_name;
  const isPreRelease = release.prerelease;
  const releaseUrl = release.html_url;

  if (isPreRelease && userConfig.enablePrelease === false) {
    // do nothing on pre release      
    return;
  }
   
  const slackText = `
    ${repoName} just announce a new release ${releaseTag}\n
${releaseBody}\n
more detail: ${releaseUrl}
  `;

  const slackPayloadObj = { 
    text: slackText
  };
  
  if (userConfig.channel) {
    slackPayloadObj.channel = userConfig.channel;
  }

  httpRequest.post(slackWebhookUrl, {
    form: {
      payload:JSON.stringify(slackPayloadObj)
    }
  }, (err, httpResponse, body) => {
    if(err){
      console.log(err);
    }
    console.log('done');
  });
}

module.exports.announceSlack = announceSlack
