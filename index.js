const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load quotes from quotes.json on server start
let quotesData = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf8');
  quotesData = JSON.parse(data);
} catch (err) {
  console.error('Error reading quotes.json:', err);
}

const stringSimilarity = (str1, str2) => {
  // Simple Levenshtein distance implementation for fuzzy matching
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
};

app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotes API Documentation</title>
    <link href="https://fonts.googleapis.com/css?family=Inter:400,700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background: #f6f7fb; color: #23272f; margin: 0; padding: 0; }
      .container { display: flex; min-height: 100vh; }
      .sidebar { width: 260px; background: #fff; border-right: 1px solid #e5e7eb; padding: 2.5rem 1.7rem 2.5rem 2.2rem; position: sticky; top: 0; height: 100vh; }
      .sidebar h1 { font-size: 2rem; margin: 0 0 2.5rem 0; color: #0ea5e9; letter-spacing: -1px; font-weight: 800; }
      .sidebar nav { display: flex; flex-direction: column; gap: 1.3rem; }
      .sidebar a { color: #23272f; text-decoration: none; font-weight: 600; font-size: 1.13rem; border-left: 3px solid transparent; padding-left: 0.9rem; transition: color 0.2s, border 0.2s; letter-spacing: 0.01em; }
      .sidebar a:hover, .sidebar a.active { color: #0ea5e9; border-left: 3px solid #0ea5e9; background: #f1f5f9; }
      main { flex: 1; max-width: 900px; margin: 0 auto; padding: 3.5rem 2.5rem 3.5rem 2.5rem; }
      section { margin-bottom: 3.5rem; border-radius: 12px; background: #fff; box-shadow: 0 2px 16px #0001; padding: 2.5rem 2.2rem; }
      h2 { color: #0ea5e9; margin-top: 0; font-size: 1.7rem; font-weight: 800; letter-spacing: -0.5px; }
      h3 { margin-top: 2.2rem; color: #23272f; font-size: 1.18rem; font-weight: 700; }
      code, pre { background: #f1f5f9; color: #334155; border-radius: 7px; padding: 0.2em 0.4em; font-size: 1.04em; }
      pre { padding: 1.1em 1.2em; overflow-x: auto; margin: 1.1em 0 1.7em 0; font-size: 1.01em; line-height: 1.6; }
      .endpoint { font-weight: bold; color: #0ea5e9; }
      .method { font-weight: bold; color: #22c55e; }
      .status { font-weight: bold; }
      .success { color: #22c55e; }
      .error { color: #ef4444; }
      ul { margin: 0.5em 0 1em 1.5em; }
      .note { background: #fef9c3; color: #b45309; border-left: 4px solid #fde047; padding: 0.5em 1em; border-radius: 6px; margin: 1em 0; }
      .feature-list { margin: 0.5em 0 1em 1.5em; color: #0ea5e9; }
      .feature-list li { color: #23272f; margin-bottom: 0.3em; }
      .usecase { color: #64748b; font-size: 1.07rem; margin-bottom: 0.7em; font-weight: 500; }
      .sample-block { background: #f1f5f9; border-left: 4px solid #0ea5e9; margin: 1.2em 0 2em 0; padding: 1.1em 1.2em; border-radius: 7px; }
      .sample-label { color: #0ea5e9; font-weight: 700; font-size: 1.01em; margin-bottom: 0.3em; display: block; }
      @media (max-width: 900px) { .container { flex-direction: column; } .sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: 1px solid #e5e7eb; } main { padding: 1.5rem 0.5rem; } section { padding: 1.2rem 0.7rem; } }
    </style>
  </head>
  <body>
    <div class="container">
      <aside class="sidebar">
        <h1>Quotes API</h1>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#getQuotes">Random Quotes</a>
          <a href="#getQuotesCategory">Quotes by Category</a>
          <a href="#getQuotesAuthor">Quotes by Author</a>
          <a href="#searchQuotes">Search Quotes</a>
          <a href="#randomQuote">Random Quote</a>
          <a href="#categories">Categories</a>
          <a href="#tags">Tags</a>
          <a href="#authors">Authors</a>
          <a href="#popularQuotes">Popular Quotes</a>
          <a href="#quoteOfTheDay">Quote of the Day</a>
          <a href="#stats">Statistics</a>
          <a href="#errors">Error Handling</a>
          <a href="#faq">FAQ</a>
        </nav>
      </aside>
      <main>
        <section id="overview">
          <h2>Overview</h2>
          <p>This API provides access to a large, curated collection of quotes, with advanced search, filtering, and statistics. Designed for developers, educators, and anyone who loves inspiration.</p>
          <ul class="feature-list">
            <li>Random, popular, and daily quotes</li>
            <li>Search by keyword, author, category, or tag</li>
            <li>Fuzzy matching for user-friendly queries (even with typos!)</li>
            <li>Pagination for large lists</li>
            <li>Detailed statistics and metadata</li>
            <li>Consistent, developer-friendly error handling</li>
          </ul>
          <div class="note">Base URL: <code>http://localhost:3000</code> (or your deployed server)</div>
        </section>
        <section id="getQuotes">
          <h2>GET /v1/getQuotes/quantity=:quantity</h2>
          <div class="usecase">Get a list of random quotes. Great for inspiration feeds, widgets, or bulk quote requests.</div>
          <ul class="feature-list">
            <li>Returns unique, random quotes</li>
            <li>Includes all metadata (author, category, tags, etc.)</li>
            <li>Lists all unique categories, authors, and tags in the response</li>
            <li>Handles empty data and invalid input gracefully</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/getQuotes/quantity=3</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Quotes fetched successfully.",
  "requestedQuantity": 3,
  "actualQuantity": 3,
  "timestamp": "2024-06-07T12:00:00.000Z",
  "categories": ["life", "love"],
  "authors": ["Dr. Seuss", "Oscar Wilde"],
  "tags": ["happiness", "smile"],
  "quotes": [
    { "Quote": "Don't cry because it's over, smile because it happened.", "Author": "Dr. Seuss", ... }
  ]
}</pre></div>
        </section>
        <section id="getQuotesCategory">
          <h2>GET /v1/getQuotes/category=:category/quantity=:quantity</h2>
          <div class="usecase">Get random quotes from a specific category. Perfect for themed inspiration or category-based feeds.</div>
          <ul class="feature-list">
            <li>Fuzzy, case-insensitive category matching ("LoVe" matches "love")</li>
            <li>Returns 404 if no close match is found</li>
            <li>All quote metadata included</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/getQuotes/category=loVe/quantity=2</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Quotes fetched successfully for category 'love'.",
  "requestedQuantity": 2,
  "actualQuantity": 2,
  "timestamp": "2024-06-07T12:00:00.000Z",
  "category": "love",
  "quotes": [ ... ]
}</pre></div>
        </section>
        <section id="getQuotesAuthor">
          <h2>GET /v1/getQuotes/author=:author/quantity=:quantity</h2>
          <div class="usecase">Get random quotes from a specific author. Useful for author pages, research, or fan sites.</div>
          <ul class="feature-list">
            <li>Fuzzy, case-insensitive author matching ("albeRt" matches "Albert")</li>
            <li>404 if no close match is found</li>
            <li>All quote metadata included</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/getQuotes/author=albeRt/quantity=2</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Quotes fetched successfully for author 'Albert'.",
  "requestedQuantity": 2,
  "actualQuantity": 2,
  "timestamp": "2024-06-07T12:00:00.000Z",
  "author": "Albert",
  "quotes": [ ... ]
}</pre></div>
        </section>
        <section id="searchQuotes">
          <h2>GET /v1/searchQuotes/:keywords/maxQuantity=:quantity</h2>
          <div class="usecase">Search for quotes by keywords. Matches in quote text, tags, author, or category. Great for search bars and discovery tools.</div>
          <ul class="feature-list">
            <li>Case-insensitive, partial keyword matching</li>
            <li>Matches in quote text, tags, author, and category</li>
            <li>Handles multiple keywords (comma or space separated)</li>
            <li>Results sorted by relevance (number of matches)</li>
            <li>404 if no matches found</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/searchQuotes/smile,cry/maxQuantity=5</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Quotes fetched successfully for keywords 'smile,cry'.",
  "requestedQuantity": 5,
  "actualQuantity": 5,
  "timestamp": "2024-06-07T12:00:00.000Z",
  "keywords": ["smile", "cry"],
  "quotes": [ ... ]
}</pre></div>
        </section>
        <section id="randomQuote">
          <h2>GET /v1/randomQuote</h2>
          <div class="usecase">Get a single random quote. Optionally filter by category. Perfect for "quote of the day" widgets or quick inspiration.</div>
          <ul class="feature-list">
            <li>Optional <code>?category=life</code> query parameter (fuzzy match)</li>
            <li>404 if no quotes found for the category</li>
            <li>Returns all quote metadata</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/randomQuote?category=life</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Random quote fetched successfully.",
  "timestamp": "2024-06-07T12:00:00.000Z",
  "category": "life",
  "quote": { ... }
}</pre></div>
        </section>
        <section id="categories">
          <h2>GET /v1/categories</h2>
          <div class="usecase">Get all unique categories, with the number of quotes in each. Paginated for easy browsing.</div>
          <ul class="feature-list">
            <li>Each category includes a quote count</li>
            <li>Paginated (page size 50)</li>
            <li>404 if no categories found</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/categories?page=1</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Categories fetched successfully.",
  "totalCategories": 12,
  "totalPages": 1,
  "page": 1,
  "pageSize": 50,
  "categories": [
    { "category": "life", "count": 123 },
    ...
  ]
}</pre></div>
        </section>
        <section id="tags">
          <h2>GET /v1/tags</h2>
          <div class="usecase">Get all unique tags, with the number of quotes for each. Paginated for easy browsing.</div>
          <ul class="feature-list">
            <li>Filters out numeric, short, or rare tags</li>
            <li>Paginated (page size 50)</li>
            <li>404 if no tags found</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/tags?page=1</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Tags fetched successfully.",
  "totalTags": 100,
  "totalPages": 2,
  "page": 1,
  "pageSize": 50,
  "tags": [
    { "tag": "happiness", "count": 12 },
    ...
  ]
}</pre></div>
        </section>
        <section id="authors">
          <h2>GET /v1/authors</h2>
          <div class="usecase">Get all unique authors, with the number of quotes for each. Paginated for easy browsing.</div>
          <ul class="feature-list">
            <li>Filters out empty, unknown, or rare authors</li>
            <li>Paginated (page size 50)</li>
            <li>404 if no authors found</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/authors?page=1</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Authors fetched successfully.",
  "totalAuthors": 50,
  "totalPages": 10,
  "page": 1,
  "pageSize": 50,
  "authors": [
    { "author": "Dr. Seuss", "count": 5 },
    ...
  ]
}</pre></div>
        </section>
        <section id="popularQuotes">
          <h2>GET /v1/popularQuotes</h2>
          <div class="usecase">Get the most popular quotes, sorted by popularity score. Great for "top quotes" lists or trending sections.</div>
          <ul class="feature-list">
            <li>Filter by <code>minPopularity</code> query parameter</li>
            <li>Limit results with <code>quantity</code> query parameter</li>
            <li>404 if no popular quotes found</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/popularQuotes?minPopularity=0.5&quantity=10</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Popular quotes fetched successfully.",
  "minPopularity": 0.5,
  "requestedQuantity": 10,
  "actualQuantity": 10,
  "quotes": [ ... ]
}</pre></div>
        </section>
        <section id="quoteOfTheDay">
          <h2>GET /v1/quoteOfTheDay</h2>
          <div class="usecase">Get a deterministic, high-quality quote of the day. Perfect for daily widgets, newsletters, or homepages.</div>
          <ul class="feature-list">
            <li>Only returns from the top 10% most popular quotes</li>
            <li>Same quote for everyone on a given day</li>
            <li>404 if no good quotes available</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/quoteOfTheDay</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Quote of the day fetched successfully.",
  "date": "2024-06-07",
  "quote": { ... }
}</pre></div>
        </section>
        <section id="stats">
          <h2>GET /v1/stats</h2>
          <div class="usecase">Get statistics and fun facts about the quotes database. Useful for dashboards and analytics.</div>
          <ul class="feature-list">
            <li>Total quotes, most popular category, most prolific author</li>
            <li>Average popularity score</li>
          </ul>
          <div class="sample-block"><span class="sample-label">Sample Request</span><pre>GET /v1/stats</pre><span class="sample-label">Sample Response</span><pre>{
  "status": 200,
  "message": "Statistics fetched successfully.",
  "totalQuotes": 1000,
  "mostPopularCategory": { "category": "life", "count": 123 },
  "mostProlificAuthor": { "author": "Dr. Seuss", "count": 5 },
  "averagePopularity": 0.12
}</pre></div>
        </section>
        <section id="errors">
          <h2>Error Handling</h2>
          <p>All endpoints return clear error messages and appropriate HTTP status codes:</p>
          <ul>
            <li><span class="status error">400 Bad Request</span> - Invalid input or missing required parameters</li>
            <li><span class="status error">404 Not Found</span> - No matching data found (e.g., no quotes, no such category/author/tag)</li>
            <li><span class="status error">500 Internal Server Error</span> - Unexpected server error</li>
          </ul>
          <pre><code>{
  "status": 404,
  "message": "No matching category found for 'loev'.",
  "timestamp": "2024-06-07T12:00:00.000Z",
  ...
}</code></pre>
        </section>
        <section id="faq">
          <h2>FAQ &amp; Tips</h2>
          <ul>
            <li><b>How do I get a random quote from a specific category?</b><br>Use <code>/v1/randomQuote?category=life</code> (fuzzy matching supported).</li>
            <li><b>How do I paginate authors/tags?</b><br>Use <code>?page=2</code> (page size is always 50).</li>
            <li><b>How do I search for quotes with multiple keywords?</b><br>Use <code>/v1/searchQuotes/smile,cry/maxQuantity=5</code>.</li>
            <li><b>What if I get an empty result?</b><br>Check your spelling or try different keywords. The API returns <code>404</code> if nothing is found.</li>
            <li><b>What is the popularity score?</b><br>It's a measure of how well-liked or impactful a quote is (higher is better).</li>
          </ul>
          <div class="note">For more help, open an issue or contact the maintainer.</div>
        </section>
      </main>
    </div>
  </body>
  </html>
  `);
});

app.get('/v1/getQuotes/quantity=:quantity', (req, res) => {
  try {
    const quantity = parseInt(req.params.quantity, 10);
    if (!Array.isArray(quotesData) || quotesData.length === 0) {
      return res.status(500).json({
        status: 500,
        message: 'Quotes data not available.',
        requestedQuantity: quantity,
        actualQuantity: 0,
        timestamp: new Date().toISOString(),
        quotes: []
      });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid quantity parameter.',
        requestedQuantity: quantity,
        actualQuantity: 0,
        timestamp: new Date().toISOString(),
        quotes: []
      });
    }
    let selectedQuotes = [];
    if (quantity >= quotesData.length) {
      selectedQuotes = quotesData.sort(() => 0.5 - Math.random());
    } else {
      const usedIndices = new Set();
      while (selectedQuotes.length < quantity) {
        const randomIndex = Math.floor(Math.random() * quotesData.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          selectedQuotes.push(quotesData[randomIndex]);
        }
      }
    }
    if (!selectedQuotes.length) {
      return res.status(404).json({
        status: 404,
        message: 'No quotes found.',
        requestedQuantity: quantity,
        actualQuantity: 0,
        timestamp: new Date().toISOString(),
        quotes: []
      });
    }
    const categoriesSet = new Set();
    const authorsSet = new Set();
    const tagsSet = new Set();
    selectedQuotes.forEach(q => {
      if (q.Category) categoriesSet.add(q.Category);
      if (q.Author) authorsSet.add(q.Author);
      if (Array.isArray(q.Tags)) {
        q.Tags.forEach(tag => tagsSet.add(tag));
      }
    });
    res.status(200).json({
      status: 200,
      message: 'Quotes fetched successfully.',
      requestedQuantity: quantity,
      actualQuantity: selectedQuotes.length,
      timestamp: new Date().toISOString(),
      categories: Array.from(categoriesSet),
      authors: Array.from(authorsSet),
      tags: Array.from(tagsSet),
      quotes: selectedQuotes
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Internal server error.',
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});

app.get('/v1/getQuotes/category=:category/quantity=:quantity', (req, res) => {
  const inputCategory = req.params.category;
  const quantity = parseInt(req.params.quantity, 10);

  // Find all unique categories in the data
  const allCategories = Array.from(new Set(quotesData.map(q => q.Category)));

  // Find the closest matching category (case-insensitive, fuzzy)
  let bestCategory = null;
  let minDistance = Infinity;
  for (const cat of allCategories) {
    const dist = stringSimilarity(inputCategory, cat);
    if (dist < minDistance) {
      minDistance = dist;
      bestCategory = cat;
    }
    // Early exit for perfect match
    if (dist === 0) break;
  }

  // If no close match, return not found
  if (!bestCategory || minDistance > 3) { // threshold can be adjusted
    return res.status(404).json({
      status: 404,
      message: `No matching category found for '${inputCategory}'.`,
      requestedQuantity: quantity,
      actualQuantity: 0,
      timestamp: new Date().toISOString(),
      category: inputCategory,
      quotes: []
    });
  }

  const quotes = quotesData.filter(q => q.Category && q.Category.toLowerCase() === bestCategory.toLowerCase());
  const selectedQuotes = quotes.sort(() => 0.5 - Math.random()).slice(0, quantity);
  res.status(200).json({
    status: 200,
    message: `Quotes fetched successfully for category '${bestCategory}'.`,
    requestedQuantity: quantity,
    actualQuantity: selectedQuotes.length,
    timestamp: new Date().toISOString(),
    category: bestCategory,
    quotes: selectedQuotes
  });
});

app.get('/v1/getQuotes/author=:author/quantity=:quantity', (req, res) => {
  const inputAuthor = req.params.author;
  const quantity = parseInt(req.params.quantity, 10);

  // Find all unique authors in the data
  const allAuthors = Array.from(new Set(quotesData.map(q => q.Author)));

  // Find the closest matching author (case-insensitive, fuzzy)
  let bestAuthor = null;
  let minDistance = Infinity;
  for (const author of allAuthors) {
    const dist = stringSimilarity(inputAuthor, author);
    if (dist < minDistance) {
      minDistance = dist;
      bestAuthor = author;
    }
    // Early exit for perfect match
    if (dist === 0) break;
  }

  // If no close match, return not found
  if (!bestAuthor || minDistance > 3) { // threshold can be adjusted
    return res.status(404).json({
      status: 404,
      message: `No matching author found for '${inputAuthor}'.`,
      requestedQuantity: quantity,
      actualQuantity: 0,
      timestamp: new Date().toISOString(),
      author: inputAuthor,
      quotes: []
    });
  }

  const quotes = quotesData.filter(q => q.Author && q.Author.toLowerCase() === bestAuthor.toLowerCase());
  const selectedQuotes = quotes.sort(() => 0.5 - Math.random()).slice(0, quantity);
  res.status(200).json({
    status: 200,
    message: `Quotes fetched successfully for author '${bestAuthor}'.`,
    requestedQuantity: quantity,
    actualQuantity: selectedQuotes.length,
    timestamp: new Date().toISOString(),
    author: bestAuthor,
    quotes: selectedQuotes
  });
});

app.get('/v1/searchQuotes/:keywords/maxQuantity=:quantity', (req, res) => {
  const rawKeywords = req.params.keywords;
  const quantity = parseInt(req.params.quantity, 10);

  // Split keywords by comma or space, remove empty, lowercase
  const keywords = rawKeywords
    .split(/[,\s]+/)
    .map(k => k.trim().toLowerCase())
    .filter(Boolean);

  if (keywords.length === 0) {
    return res.status(400).json({
      status: 400,
      message: 'No keywords provided.',
      requestedQuantity: quantity,
      actualQuantity: 0,
      timestamp: new Date().toISOString(),
      keywords: rawKeywords,
      quotes: []
    });
  }

  // Score quotes by number of keyword matches in Quote, Tags, Author, Category
  const scoredQuotes = quotesData.map(q => {
    let score = 0;
    const quoteText = (q.Quote || '').toLowerCase();
    const author = (q.Author || '').toLowerCase();
    const category = (q.Category || '').toLowerCase();
    const tags = Array.isArray(q.Tags) ? q.Tags.map(t => t.toLowerCase()) : [];
    for (const kw of keywords) {
      if (quoteText.includes(kw)) score++;
      if (author.includes(kw)) score++;
      if (category.includes(kw)) score++;
      if (tags.some(tag => tag.includes(kw))) score++;
    }
    return { ...q, _score: score };
  });

  // Filter out quotes with no matches, sort by score descending, then randomize ties
  const matchingQuotes = scoredQuotes
    .filter(q => q._score > 0)
    .sort((a, b) => b._score - a._score || (Math.random() - 0.5));

  const selectedQuotes = matchingQuotes.slice(0, quantity);

  res.status(200).json({
    status: 200,
    message: `Quotes fetched successfully for keywords '${rawKeywords}'.`,
    requestedQuantity: quantity,
    actualQuantity: selectedQuotes.length,
    timestamp: new Date().toISOString(),
    keywords: keywords,
    quotes: selectedQuotes
  });
});

app.get('/v1/randomQuote', (req, res) => {
  let filteredQuotes = quotesData;
  const category = req.query.category;
  if (category) {
    // Fuzzy and case-insensitive match for category
    const allCategories = Array.from(new Set(quotesData.map(q => q.Category)));
    let bestCategory = null;
    let minDistance = Infinity;
    for (const cat of allCategories) {
      const dist = stringSimilarity(category, cat);
      if (dist < minDistance) {
        minDistance = dist;
        bestCategory = cat;
      }
      if (dist === 0) break;
    }
    if (!bestCategory || minDistance > 3) {
      return res.status(404).json({
        status: 404,
        message: `No matching category found for '${category}'.`,
        timestamp: new Date().toISOString(),
        quote: null
      });
    }
    filteredQuotes = quotesData.filter(q => q.Category && q.Category.toLowerCase() === bestCategory.toLowerCase());
  }
  if (!filteredQuotes.length) {
    return res.status(404).json({
      status: 404,
      message: 'No quotes found.',
      timestamp: new Date().toISOString(),
      quote: null
    });
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  res.status(200).json({
    status: 200,
    message: 'Random quote fetched successfully.',
    timestamp: new Date().toISOString(),
    category: category || null,
    quote: randomQuote
  });
});

app.get('/v1/categories', (req, res) => {
  // Count quotes per category
  const categoryCounts = {};
  quotesData.forEach(q => {
    if (q.Category) {
      categoryCounts[q.Category] = (categoryCounts[q.Category] || 0) + 1;
    }
  });
  const categories = Object.keys(categoryCounts).map(cat => ({
    category: cat,
    count: categoryCounts[cat]
  }));
  res.status(200).json({
    status: 200,
    message: 'Categories fetched successfully.',
    totalCategories: categories.length,
    categories: categories
  });
});

app.get('/v1/tags', (req, res) => {
  // Count quotes per tag
  const tagCounts = {};
  quotesData.forEach(q => {
    if (Array.isArray(q.Tags)) {
      q.Tags.forEach(tag => {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
          tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
        }
      });
    }
  });
  // Filter out tags that are purely numeric, very short, or appear only once
  let tags = Object.keys(tagCounts)
    .filter(tag => {
      // Exclude purely numeric tags
      if (/^\d+$/.test(tag)) return false;
      // Exclude very short tags
      if (tag.length < 3) return false;
      // Exclude tags that appear only once
      if (tagCounts[tag] < 2) return false;
      return true;
    })
    .map(tag => ({
      tag: tag,
      count: tagCounts[tag]
    }));

  // Pagination with fixed page size of 50
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = 50;
  const totalTags = tags.length;
  const totalPages = Math.ceil(totalTags / pageSize);
  tags = tags.slice((page - 1) * pageSize, page * pageSize);

  res.status(200).json({
    status: 200,
    message: 'Tags fetched successfully.',
    totalTags,
    totalPages,
    page,
    pageSize,
    tags
  });
});

app.get('/v1/authors', (req, res) => {
  // Count quotes per author
  const authorCounts = {};
  quotesData.forEach(q => {
    if (q.Author) {
      const author = q.Author.trim();
      if (
        author &&
        author.toLowerCase() !== 'unknown' &&
        author.toLowerCase() !== 'n/a'
      ) {
        authorCounts[author] = (authorCounts[author] || 0) + 1;
      }
    }
  });

  // Only include authors with at least 2 quotes
  let authors = Object.keys(authorCounts)
    .filter(author => authorCounts[author] >= 2)
    .map(author => ({
      author: author,
      count: authorCounts[author]
    }));

  // Pagination with fixed page size of 50
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = 50;
  const totalAuthors = authors.length;
  const totalPages = Math.ceil(totalAuthors / pageSize);
  authors = authors.slice((page - 1) * pageSize, page * pageSize);

  res.status(200).json({
    status: 200,
    message: 'Authors fetched successfully.',
    totalAuthors,
    totalPages,
    page,
    pageSize,
    authors
  });
});

app.get('/v1/popularQuotes', (req, res) => {
  const minPopularity = parseFloat(req.query.minPopularity) || 0;
  const quantity = parseInt(req.query.quantity, 10) || 10;
  // Filter and sort quotes by popularity
  const popularQuotes = quotesData
    .filter(q => typeof q.Popularity === 'number' && q.Popularity >= minPopularity)
    .sort((a, b) => b.Popularity - a.Popularity)
    .slice(0, quantity);
  res.status(200).json({
    status: 200,
    message: 'Popular quotes fetched successfully.',
    minPopularity,
    requestedQuantity: quantity,
    actualQuantity: popularQuotes.length,
    quotes: popularQuotes
  });
});

app.get('/v1/quoteOfTheDay', (req, res) => {
  // Only consider top 10% most popular quotes
  const popularityValues = quotesData
    .map(q => typeof q.Popularity === 'number' ? q.Popularity : 0)
    .sort((a, b) => b - a);
  const thresholdIndex = Math.floor(popularityValues.length * 0.1);
  const minPopularity = popularityValues[thresholdIndex] || 0;
  const goodQuotes = quotesData.filter(q => typeof q.Popularity === 'number' && q.Popularity >= minPopularity);

  if (!goodQuotes.length) {
    return res.status(404).json({
      status: 404,
      message: 'No good quotes available for quote of the day.',
      timestamp: new Date().toISOString(),
      quote: null
    });
  }

  // Deterministic selection based on date
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % goodQuotes.length;
  }
  const quoteOfTheDay = goodQuotes[hash];

  res.status(200).json({
    status: 200,
    message: 'Quote of the day fetched successfully.',
    date: today,
    quote: quoteOfTheDay
  });
});

app.get('/v1/stats', (req, res) => {
  // Total quotes
  const totalQuotes = quotesData.length;
  // Most popular category
  const categoryCounts = {};
  quotesData.forEach(q => {
    if (q.Category) {
      categoryCounts[q.Category] = (categoryCounts[q.Category] || 0) + 1;
    }
  });
  let mostPopularCategory = null;
  let maxCategoryCount = 0;
  for (const cat in categoryCounts) {
    if (categoryCounts[cat] > maxCategoryCount) {
      maxCategoryCount = categoryCounts[cat];
      mostPopularCategory = cat;
    }
  }
  // Most prolific author
  const authorCounts = {};
  quotesData.forEach(q => {
    if (q.Author) {
      authorCounts[q.Author] = (authorCounts[q.Author] || 0) + 1;
    }
  });
  let mostProlificAuthor = null;
  let maxAuthorCount = 0;
  for (const author in authorCounts) {
    if (authorCounts[author] > maxAuthorCount) {
      maxAuthorCount = authorCounts[author];
      mostProlificAuthor = author;
    }
  }
  // Average popularity
  const popularityValues = quotesData.map(q => typeof q.Popularity === 'number' ? q.Popularity : 0);
  const averagePopularity = popularityValues.reduce((a, b) => a + b, 0) / popularityValues.length;
  res.status(200).json({
    status: 200,
    message: 'Statistics fetched successfully.',
    totalQuotes,
    mostPopularCategory: {
      category: mostPopularCategory,
      count: maxCategoryCount
    },
    mostProlificAuthor: {
      author: mostProlificAuthor,
      count: maxAuthorCount
    },
    averagePopularity
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

