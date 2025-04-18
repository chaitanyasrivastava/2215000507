const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Specify the views directory

// Middleware to serve static files (if needed)
app.use(express.static('public'));

// Sample data (replace with actual API calls in a real scenario)
const topPostsData = [
  { id: 1, content: 'Great post!', commentCount: 15 },
  { id: 2, content: 'Interesting insights.', commentCount: 12 },
  { id: 3, content: 'This is helpful.', commentCount: 10 },
  { id: 4, content: 'Agree with this.', commentCount: 9 },
  { id: 5, content: 'Thanks for sharing!', commentCount: 8 },
];

const latestPostsData = [
  { id: 6, content: 'Just posted!', timestamp: new Date() },
  { id: 7, content: 'Checking in.', timestamp: new Date(Date.now() - 3600000) },
];

const topUsersData = {
  users: [
    { id: "10", name: "John Doe" },
    { id: "11", name: "Helen Moore" },
    { id: "12", name: "Ivy Taylor" },
    { id: "13", name: "Jack Anderson" },
    { id: "14", name: "Kathy Thomas" },
    { id: "15", name: "Liam Jackson" },
  ],
};

// --- Routes ---

// Route to display top posts
app.get('/top-posts', (req, res) => {
  res.render('top-posts', { posts: topPostsData });
});

// Route to display latest posts
app.get('/latest-posts', (req, res) => {
  res.render('latest-posts', { posts: latestPostsData });
});

// Route to display top users
app.get('/top-users', (req, res) => {
  res.render('top-users', { users: topUsersData.users });
});

// Route to simulate fetching top posts with a query parameter (example)
app.get('/top-posts-filtered', (req, res) => {
  const type = req.query.type; // Example: ?type=popular
  let filteredPosts = topPostsData;

  if (type === 'popular') {
    filteredPosts.sort((a, b) => b.commentCount - a.commentCount);
  } else if (type === 'latest') {
    filteredPosts = latestPostsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  res.render('filtered-posts', { posts: filteredPosts, filterType: type });
});

// Route for the "Get Users" API endpoint
app.get('/api/v1/users', (req, res) => {
  res.json(topUsersData);
});

// Basic index page
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});