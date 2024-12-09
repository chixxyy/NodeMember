if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const users = []
const bcrypt = require('bcrypt')
const initialize = require('./passport-config')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const { swaggerUi, specs } = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

initialize(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id),
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'))

/**
 * @swagger
 * /:
 *   get:
 *     summary: 顯示首頁
 *     responses:
 *       200:
 *         description: 成功顯示首頁
 */
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

/**
 * @swagger
 * /login:
 *   get:
 *     summary: 顯示登入頁面
 *     responses:
 *       200:
 *         description: 成功顯示登入頁面
 */
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 用戶登入
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: 登入成功
 *       401:
 *         description: 登入失敗
 */
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

/**
 * @swagger
 * /register:
 *   get:
 *     summary: 顯示註冊頁面
 *     responses:
 *       200:
 *         description: 成功顯示註冊頁面
 */
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

/**
 * @swagger
 * /register:
 *   post:
 *     summary: 用戶註冊
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: 註冊成功
 *       500:
 *         description: 註冊失敗
 */
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users); // 檢視是否登入成功
})

/**
 * @swagger
 * /logout:
 *   delete:
 *     summary: 用戶登出
 *     responses:
 *       302:
 *         description: 登出成功並重定向到登入頁面
 */
app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000, () => {
    console.log('server run ad http://localhost:3000');
    console.log('API docs available at http://localhost:3000/api-docs');
})