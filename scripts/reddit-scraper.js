const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const config = require('../config/reddit-config');

async function fetchPostsWithRetry(subreddit, browser, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fetchPosts(subreddit, browser);
      if (result.length > 0 || attempt === retries) {
        return result;
      }
      console.log(`Retrying r/${subreddit} (attempt ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to fetch r/${subreddit} after ${retries} attempts: ${error.message}`);
        return [];
      }
    }
  }
  return [];
}

async function fetchPosts(subreddit, browser) {
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot/`;
    
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    
    await page.waitForTimeout(3000);
    
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(2000);
    
    const posts = await page.evaluate(() => {
      const postElements = document.querySelectorAll('article[data-testid="post"]');
      const results = [];
      
      postElements.forEach(el => {
        const titleEl = el.querySelector('h3[data-testid="post-title"]');
        const scoreEl = el.querySelector('div[data-testid="score"]');
        const commentsEl = el.querySelector('a[data-testid="comments"]');
        const authorEl = el.querySelector('span[data-testid="post-author-name"]');
        const flairEl = el.querySelector('span[data-testid="post-tag"]');
        const linkEl = el.querySelector('a[data-click-id="body"]');
        const contentEl = el.querySelector('div[data-testid="post-content"]');
        
        if (titleEl) {
          results.push({
            title: titleEl.textContent.trim(),
            content: contentEl ? contentEl.textContent.trim() : '',
            score: scoreEl ? parseInt(scoreEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0,
            comments: commentsEl ? parseInt(commentsEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0,
            author: authorEl ? authorEl.textContent.trim() : '',
            flair: flairEl ? flairEl.textContent.trim() : '',
            url: linkEl ? linkEl.href : '',
            postId: linkEl ? linkEl.href.split('/').slice(-3)[0] : ''
          });
        }
      });
      
      return results;
    });
    
    const processedPosts = posts.map(post => ({
      postId: post.postId,
      subreddit: subreddit,
      title: post.title,
      content: post.content,
      score: post.score,
      comments: post.comments,
      url: post.url || `https://www.reddit.com/r/${subreddit}/comments/${post.postId}/`,
      postedDate: new Date().toISOString(),
      author: post.author,
      flair: post.flair
    }));
    
    console.log(`Fetched ${processedPosts.length} posts from r/${subreddit}`);
    await page.close();
    return processedPosts;
  } catch (error) {
    console.error(`Error fetching r/${subreddit}: ${error.message}`);
    await page.close();
    return [];
  }
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
  console.log('Starting Reddit scraper (Playwright DOM scraping)...');
  console.log(`Scraping ${config.subreddits.length} subreddits`);
  console.log('');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  let allPosts = [];
  
  for (const subreddit of config.subreddits) {
    const posts = await fetchPostsWithRetry(subreddit, browser);
    allPosts = allPosts.concat(posts);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await browser.close();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  saveToCSV(allPosts, `raw-posts-${timestamp}.csv`);
  
  console.log('');
  console.log(`Scraping complete! Total posts: ${allPosts.length}`);
  
  if (allPosts.length === 0) {
    console.log('');
    console.log('⚠️  No posts were fetched.');
  }
}

if (require.main === module) {
  run();
}

module.exports = { fetchPosts, fetchPostsWithRetry, saveToCSV, run };
