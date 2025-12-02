import 'dotenv/config'
import process from 'node:process'
import session from 'express-session'
import bcrypt from 'bcryptjs'
import express from 'express'
import sqlite3pkg from 'sqlite3'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
const sqlite3 = sqlite3pkg.verbose()
const app = express()
const PORT = 4000

// CORS setup
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://taskpro.davisdel.com'], // Vite default dev server
    credentials: true
  })
)

//*************************** FILE UPLOAD SETUP ***********************************

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadFolder =
  process.env.MODE === 'production'
    ? '/var/www/html/uploads' // production folder for NGINX
    : path.join(__dirname, 'uploads') // local dev folder

// Make sure folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true })
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage })

if (process.env.MODE !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
}

//************************************************************************************

// Body parser middleware
app.use(express.json())

// Session middleware
app.use(
  session({
    secret: process.env.SECRET_PHRASE,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
  })
)

// Initialize SQLite DB
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Could not connect to database', err)
  } else {
    console.log('Connected to SQLite database')
    db.run('PRAGMA foreign_keys = ON;')
  }
})

// Create tables
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS job_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT,
    created_date TEXT
  )`)
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER,
    category_id INTEGER,
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    FOREIGN KEY(site_id) REFERENCES job_sites(id) ON DELETE CASCADE
  )`)
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
    )`)
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT
    )`)
}

// Call createTables on startup
createTables()

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const url = `/uploads/${req.file.filename}`
  res.json({ url })
})

// Get current admin user from session
app.get('/api/admin/me', (req, res) => {
  if (req.session && req.session.adminUser) {
    res.json({
      id: req.session.adminUser.id,
      username: req.session.adminUser.username,
      created_at: req.session.adminUser.created_at,
      role: 'admin'
    })
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

// Create admin user (register)
app.post('/api/admin/register', async (req, res) => {
  const { username, password, register_code } = req.body
  if (!username || !password || !register_code) {
    return res
      .status(400)
      .json({ error: 'Username, password, and register_code required' })
  }
  if (register_code !== process.env.REGISTER_ADMIN_CODE) {
    return res.status(403).json({ error: 'Invalid registration code' })
  }
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const created_at = new Date().toISOString()
    db.run(
      'INSERT INTO admin_users (username, password_hash, salt, created_at) VALUES (?, ?, ?, ?)',
      [username, hash, salt, created_at],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Username already exists' })
          }
          return res.status(500).json({ error: err.message })
        }
        res.json({ id: this.lastID, username, created_at })
      }
    )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  db.get(
    'SELECT * FROM admin_users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) return res.status(500).json({ error: err.message })
      if (!user) return res.status(401).json({ error: 'Invalid credentials' })
      const match = await bcrypt.compare(password, user.password_hash)
      if (!match) return res.status(401).json({ error: 'Invalid credentials' })
      // Set session
      req.session.adminUser = {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
      res.json({
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        salt: user.salt,
        session: true
      })
    }
  )
})

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

// Middleware to require admin session
function requireAdminSession(req, res, next) {
  if (req.session && req.session.adminUser) {
    next()
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
}

// List all admin users (for management)
app.get('/api/admin/users', requireAdminSession, (req, res) => {
  db.all(
    'SELECT id, username, created_at FROM admin_users',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    }
  )
})

// Delete an admin user
app.delete('/api/admin/users/:id', requireAdminSession, (req, res) => {
  db.run(
    'DELETE FROM admin_users WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ deleted: this.changes })
    }
  )
})

// API routes
app.get('/api/job-sites', (req, res) => {
  db.all('SELECT * FROM job_sites', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/job-sites', (req, res) => {
  const { name, image_url, created_date } = req.body
  db.run(
    'INSERT INTO job_sites (name, image_url, created_date) VALUES (?, ?, ?)',
    [name, image_url, created_date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: this.lastID, name, image_url, created_date })
    }
  )
})

app.delete('/api/job-sites/:id', (req, res) => {
  // Get job site image
  db.get(
    'SELECT image_url FROM job_sites WHERE id = ?',
    [req.params.id],
    (err, siteRow) => {
      if (err) return res.status(500).json({ error: err.message })
      let siteImagePath = null
      if (
        siteRow &&
        siteRow.image_url &&
        siteRow.image_url.startsWith('/uploads/')
      ) {
        siteImagePath = 'uploads/' + siteRow.image_url.replace('/uploads/', '')
      }

      // Get all tasks for this job site
      db.all(
        'SELECT image_url FROM tasks WHERE site_id = ?',
        [req.params.id],
        (err2, taskRows) => {
          if (err2) return res.status(500).json({ error: err2.message })
          // Delete all task images
          // removed unused variables
          taskRows.forEach((task) => {
            if (task.image_url && task.image_url.startsWith('/uploads/')) {
              const taskImagePath =
                'uploads/' + task.image_url.replace('/uploads/', '')
              fs.unlink(taskImagePath, () => {}) // Ignore errors
            }
          })

          // Delete all tasks for this job site
          db.run(
            'DELETE FROM tasks WHERE site_id = ?',
            [req.params.id],
            function (err3) {
              if (err3) return res.status(500).json({ error: err3.message })

              // Delete the job site from DB
              db.run(
                'DELETE FROM job_sites WHERE id = ?',
                [req.params.id],
                function (err4) {
                  if (err4) return res.status(500).json({ error: err4.message })
                  // Remove the job site image file if it exists
                  if (siteImagePath) {
                    fs.unlink(siteImagePath, (fsErr) => {
                      res.json({
                        deleted: this.changes,
                        siteImageDeleted: !fsErr,
                        tasksDeleted: true
                      })
                    })
                  } else {
                    res.json({ deleted: this.changes, tasksDeleted: true })
                  }
                }
              )
            }
          )
        }
      )
    }
  )
})

// Get all tasks or filter by site_id query param
app.get('/api/tasks', (req, res) => {
  const { siteId } = req.query
  if (siteId) {
    db.all('SELECT * FROM tasks WHERE site_id = ?', [siteId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    })
  } else {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    })
  }
})

// Get tasks for a specific job site by siteId in params
app.get('/api/tasks/:id', (req, res) => {
  db.all(
    'SELECT * FROM tasks WHERE site_id = ?',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    }
  )
})

app.post('/api/tasks', (req, res) => {
  const { site_id, category_id, name, completed, description, image_url } =
    req.body

  db.run(
    'INSERT INTO tasks (site_id, category_id, name, completed, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [site_id, category_id, name, completed ? 1 : 0, description, image_url],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json({
        id: this.lastID,
        site_id,
        category_id,
        name,
        completed,
        description,
        image_url
      })
    }
  )
})

app.put('/api/tasks/:id', (req, res) => {
  const { name, completed, description, image_url, category_id } = req.body
  // Get the current image_url for the task

  db.get(
    'SELECT image_url FROM tasks WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message })
      const oldImageUrl = row ? row.image_url : null
      db.run(
        'UPDATE tasks SET name = ?, completed = ?, description = ?, image_url = ?, category_id = ? WHERE id = ?',
        [
          name,
          completed ? 1 : 0,
          description,
          image_url,
          category_id,
          req.params.id
        ],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message })
          // If the image_url changed and both are local uploads, delete the old image
          if (
            oldImageUrl &&
            oldImageUrl.startsWith('/uploads/') &&
            image_url &&
            image_url.startsWith('/uploads/') &&
            oldImageUrl !== image_url
          ) {
            const oldImagePath =
              'uploads/' + oldImageUrl.replace('/uploads/', '')
            fs.unlink(oldImagePath, () => {}) // Ignore errors
          }
          res.json({ updated: this.changes })
        }
      )
    }
  )
})

app.delete('/api/tasks/:id', (req, res) => {
  // Get the image_url for the task
  db.get(
    'SELECT image_url FROM tasks WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message })
      let imagePath = null
      if (row && row.image_url && row.image_url.startsWith('/uploads/')) {
        imagePath = 'uploads/' + row.image_url.replace('/uploads/', '')
      }
      // Delete the task from DB
      db.run(
        'DELETE FROM tasks WHERE id = ?',
        [req.params.id],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message })
          // Remove the image file if it exists
          if (imagePath) {
            fs.unlink(imagePath, (fsErr) => {
              res.json({ deleted: this.changes, imageDeleted: !fsErr })
            })
          } else {
            res.json({ deleted: this.changes })
          }
        }
      )
    }
  )
})

app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/categories', (req, res) => {
  const { name } = req.body
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ id: this.lastID, name })
  })
})

app.delete('/api/categories/:id', (req, res) => {
  db.run(
    'DELETE FROM categories WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ deleted: this.changes })
    }
  )
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
