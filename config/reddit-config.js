const config = {
  subreddits: [
    'hardware',
    'smarthome',
    'startups',
    'Business_China',
    'manufacturing',
    'DIYElectronics',
    'smartgadgets',
    'hwstartups',
    'business',
    'ecommerce',
    'Entrepreneur'
  ],
  postsPerSubreddit: 25,
  painPointKeywords: [
    'slow', 'expensive', 'confusing', 'repetitive',
    'struggle', 'pain', 'problem', 'hate', 'annoying', 'frustrating',
    'wish there was', 'can\'t find', 'too hard', 'wasted hours',
    'takes forever', 'costs too much', 'complicated', 'difficult',
    'waste of time', 'overpriced', 'slowly', 'delayed', 'delay',
    'headache', 'nightmare', 'stressful', 'tedious', 'boring',
    'error', 'broken', 'not working', 'doesn\'t work',
    'fail', 'failed', 'failure', 'scam', 'ripoff'
  ],
  outputDir: './data',
  redditApiUrl: 'https://www.reddit.com/r/'
};

module.exports = config;
