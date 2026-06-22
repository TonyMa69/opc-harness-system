const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('../config/reddit-config');

async function fetchPostsWithRetry(subreddit, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fetchPosts(subreddit);
      if (result.length > 0 || attempt === retries) {
        return result;
      }
      console.log(`Retrying r/${subreddit} (attempt ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to fetch r/${subreddit} after ${retries} attempts: ${error.message}`);
        return [];
      }
    }
  }
  return [];
}

function fetchPosts(subreddit) {
  return new Promise((resolve, reject) => {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${config.postsPerSubreddit}`;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    };
    
    const req = https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const posts = json.data.children.map(child => ({
            postId: child.data.id,
            subreddit: child.data.subreddit,
            title: child.data.title,
            content: child.data.selftext || '',
            score: child.data.score,
            comments: child.data.num_comments,
            url: `https://www.reddit.com${child.data.permalink}`,
            postedDate: new Date(child.data.created_utc * 1000).toISOString(),
            author: child.data.author,
            flair: child.data.link_flair_text || ''
          }));
          
          console.log(`Fetched ${posts.length} posts from r/${subreddit}`);
          resolve(posts);
        } catch (error) {
          console.error(`Error parsing r/${subreddit}: ${error.message}`);
          console.error(`Response snippet: ${data.substring(0, 500)}`);
          resolve([]);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error(`Timeout fetching r/${subreddit}`);
      req.destroy();
      reject(new Error('timeout'));
    });
    
    req.end();
  });
}

function saveToCSV(posts, filename) {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  const headers = ['Post ID', 'Subreddit', 'Title', 'Content', 'Score', 'Comments', 'URL', 'Posted Date', 'Author', 'Flair'];
  const rows = posts.map(post => [
    `"${post.postId}"`,
    `"${post.subreddit}"`,
    `"${post.title.replace(/"/g, '""')}"`,
    `"${post.content.replace(/"/g, '""')}"`,
    post.score,
    post.comments,
    `"${post.url}"`,
    `"${post.postedDate}"`,
    `"${post.author}"`,
    `"${post.flair}"`
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const filePath = path.join(config.outputDir, filename);
  fs.writeFileSync(filePath, csv, 'utf-8');
  
  console.log(`Saved ${posts.length} posts to ${filePath}`);
}

async function run() {
  console.log('Starting Reddit scraper...');
  console.log(`Scraping ${config.subreddits.length} subreddits, ${config.postsPerSubreddit} posts each`);
  console.log('');
  
  let allPosts = [];
  
  for (const subreddit of config.subreddits) {
    const posts = await fetchPostsWithRetry(subreddit);
    allPosts = allPosts.concat(posts);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  saveToCSV(allPosts, `raw-posts-${timestamp}.csv`);
  
  console.log('');
  console.log(`Scraping complete! Total posts: ${allPosts.length}`);
  
  if (allPosts.length === 0) {
    console.log('');
    console.log('⚠️  No posts were fetched. This could be due to network restrictions.');
  }
}

if (require.main === module) {
  run();
}

module.exports = { fetchPosts, fetchPostsWithRetry, saveToCSV, run };
