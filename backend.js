const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/language_learning_app', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    progress: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Content Schema (for vocabulary and quizzes)
const contentSchema = new mongoose.Schema({
    title: String,
    content: String,
    language: String
});

const Content = mongoose.model('Content', contentSchema);

// Forum Post Schema
const forumPostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send('User not found');
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).send('Invalid credentials');
        const token = jwt.sign({ userId: user._id }, 'secret');
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Middleware to check JWT token and set req.user
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized');
    try {
        const decoded = jwt.verify(token, 'secret');
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).send('Unauthorized');
        req.user = user;
        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(401).send('Unauthorized');
    }
};

// Protected route to get user information
app.get('/api/user', authMiddleware, (req, res) => {
    res.send(req.user);
});

// CRUD operations for Content (vocabulary, quizzes)
app.post('/api/content', authMiddleware, async (req, res) => {
    try {
        const { title, content, language } = req.body;
        const newContent = new Content({ title, content, language });
        await newContent.save();
        res.status(201).send('Content created successfully');
    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/content', authMiddleware, async (req, res) => {
    try {
        const content = await Content.find();
        res.json(content);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/api/content/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, language } = req.body;
        const updatedContent = await Content.findByIdAndUpdate(id, { title, content, language });
        res.status(200).send('Content updated successfully');
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/content/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await Content.findByIdAndDelete(id);
        res.status(200).send('Content deleted successfully');
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Forum CRUD operations
app.post('/api/forum/post', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const newPost = new ForumPost({ user: req.user._id, content });
        await newPost.save();
        res.status(201).send('Forum post created successfully');
    } catch (error) {
        console.error('Error creating forum post:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/forum/posts', async (req, res) => {
    try {
        const posts = await ForumPost.find().populate('user', 'username');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
