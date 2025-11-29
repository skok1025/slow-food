import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다.' });
        }
        req.user = user;
        next();
    });
};


// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});

const app = express();
const port = 9093;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Toggle favorite
app.post('/api/recipes/:id/favorite', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.member_id; // Changed from req.user.id to req.user.member_id

    try {
        // Check if favorite exists
        const [existing] = await pool.query(
            'SELECT * FROM t_favorite WHERE user_id = ? AND recipe_id = ?',
            [userId, id]
        );

        let isFavorite = false;

        if (existing.length > 0) {
            // Remove favorite
            await pool.execute(
                'DELETE FROM t_favorite WHERE user_id = ? AND recipe_id = ?',
                [userId, id]
            );
            isFavorite = false;
        } else {
            // Add favorite
            await pool.execute(
                'INSERT INTO t_favorite (user_id, recipe_id) VALUES (?, ?)',
                [userId, id]
            );
            isFavorite = true;
        }

        res.json({ success: true, isFavorite });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ success: false, message: '찜하기 처리 중 오류가 발생했습니다.' });
    }
});

// Get user's favorites
app.get('/api/users/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.member_id; // Changed from req.user.id to req.user.member_id

    try {
        const [rows] = await pool.query(
            'SELECT recipe_id FROM t_favorite WHERE user_id = ?',
            [userId]
        );

        const favorites = rows.map(row => row.recipe_id);
        res.json({ success: true, favorites });
    } catch (error) {
        console.error('Fetch favorites error:', error);
        res.status(500).json({ success: false, message: '찜한 목록을 불러오는 중 오류가 발생했습니다.' });
    }
});

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'shkim30',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.post('/api/login', async (req, res) => {
    const { member_id, password } = req.body;

    if (!member_id || !password) {
        return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' });
    }

    try {
        if (member_id === 'test' && password === 'test') {
            return res.json({
                success: true,
                user: { name: '테스트유저', member_id: 'test', is_admin: false }
            });
        }

        const [rows] = await pool.execute('SELECT * FROM t_member WHERE member_id = ?', [member_id]);

        if (rows.length > 0) {
            const user = rows[0];
            const storedPassword = user.password;

            // Password is already hashed from client (SHA-512 hex)
            // Just compare directly
            let isMatch = false;

            // Case 1: DB stores Raw Binary (Buffer comparison)
            const passwordBuffer = Buffer.from(password, 'hex');
            if (Buffer.isBuffer(storedPassword) && storedPassword.equals(passwordBuffer)) {
                isMatch = true;
            }
            // Case 2: DB stores Hex String (as Buffer or String)
            else {
                const storedPasswordStr = storedPassword.toString();
                if (storedPasswordStr.toLowerCase() === password.toLowerCase()) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                let name = 'Unknown';
                try {
                    if (user.name) {
                        const key = Buffer.from('abcdefghijklmnop', 'utf8');
                        const encryptedBase64 = user.name.toString();
                        const decipher = crypto.createDecipheriv('aes-128-ecb', key, null);
                        decipher.setAutoPadding(true);
                        let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
                        decrypted += decipher.final('utf8');
                        name = decrypted;
                    }
                } catch (err) {
                    console.error('Decryption failed:', err);
                    name = user.name ? user.name.toString() : 'Unknown';
                }

                res.json({
                    success: true,
                    token: jwt.sign(
                        {
                            member_id: user.member_id,
                            is_admin: user.is_admin === '1' || user.is_admin === 1
                        },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    ),
                    user: {
                        member_id: user.member_id,
                        name: name,
                        is_admin: user.is_admin === '1' || user.is_admin === 1
                    }
                });
            } else {
                res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
            }
        } else {
            res.status(401).json({ success: false, message: '존재하지 않는 아이디입니다.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { member_id, password, name, tel } = req.body;

    if (!member_id || !password || !name || !tel) {
        return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
    }

    try {
        const [existing] = await pool.execute('SELECT member_id FROM t_member WHERE member_id = ?', [member_id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: '이미 존재하는 아이디입니다.' });
        }

        // Password is already hashed from client (SHA-512 hex)
        // No need to hash again
        const key = Buffer.from('abcdefghijklmnop', 'utf8');
        const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
        cipher.setAutoPadding(true);
        let encryptedName = cipher.update(name, 'utf8', 'base64');
        encryptedName += cipher.final('base64');

        await pool.execute(
            'INSERT INTO t_member (member_id, password, name, tel, is_delete) VALUES (?, ?, ?, ?, "F")',
            [member_id, password, encryptedName, tel] // password is already hashed from client
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: '회원가입 중 오류가 발생했습니다.' });
    }
});

app.get('/api/recipes', async (req, res) => {
    try {
        // Get all recipes
        const [recipes] = await pool.query('SELECT * FROM t_recipe ORDER BY created_at DESC');

        // Get ingredients for each recipe
        const recipesWithIngredients = await Promise.all(recipes.map(async (recipe) => {
            const [ingredients] = await pool.query(`
                SELECT i.id, i.name, i.icon 
                FROM t_ingredient i
                JOIN t_recipe_ingredient ri ON i.id = ri.ingredient_id
                WHERE ri.recipe_id = ?
            `, [recipe.id]);

            return {
                id: recipe.id,
                title: recipe.title,
                shortDescription: recipe.short_description,
                recipe: recipe.recipe,
                ingredients: ingredients,
                time: recipe.time,
                difficulty: recipe.difficulty,
                image: recipe.image
            };
        }));
        res.json(recipesWithIngredients);
    } catch (error) {
        console.error('Fetch recipes error:', error);
        res.status(500).json({ message: '레시피를 불러오는 중 오류가 발생했습니다.' });
    }
});

// Update recipe (admin only)
app.put('/api/recipes/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    console.log(`[PUT] /api/recipes/${id} - Request received`);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { title, shortDescription, recipe, ingredientIds, time, difficulty } = req.body;

    // Check if user is admin
    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: '관리자만 레시피를 수정할 수 있습니다.' });
    }

    if (!title || !shortDescription || !recipe) {
        return res.status(400).json({ success: false, message: '필수 항목을 입력해주세요.' });
    }

    try {
        // Get current recipe to check if it exists
        const [existing] = await pool.query('SELECT image FROM t_recipe WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: '레시피를 찾을 수 없습니다.' });
        }

        // Use new image if uploaded, otherwise keep existing
        const image = req.file ? `/uploads/${req.file.filename}` : existing[0].image;

        // Update recipe
        const [updateResult] = await pool.execute(
            'UPDATE t_recipe SET title = ?, short_description = ?, recipe = ?, time = ?, difficulty = ?, image = ? WHERE id = ?',
            [title, shortDescription, recipe, time, difficulty, image, id]
        );
        console.log('Update result:', updateResult);

        // Update ingredients - delete old and insert new
        await pool.execute('DELETE FROM t_recipe_ingredient WHERE recipe_id = ?', [id]);

        if (ingredientIds && ingredientIds.length > 0) {
            const ingredientArray = Array.isArray(ingredientIds) ? ingredientIds : JSON.parse(ingredientIds);
            const values = ingredientArray.map(ingId => [id, ingId]);

            if (values.length > 0) {
                await pool.query(
                    'INSERT INTO t_recipe_ingredient (recipe_id, ingredient_id) VALUES ?',
                    [values]
                );
            }
        }

        // Fetch ingredients for response
        const [ingredients] = await pool.query(`
            SELECT i.id, i.name, i.icon 
            FROM t_ingredient i
            JOIN t_recipe_ingredient ri ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = ?
        `, [id]);

        const responseData = {
            success: true,
            recipe: {
                id,
                title,
                shortDescription,
                recipe,
                ingredients,
                time,
                difficulty,
                image
            }
        };

        console.log('Sending response:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({ success: false, message: '레시피 수정 중 오류가 발생했습니다.', error: error.message });
    }
});

app.post('/api/recipes', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, shortDescription, recipe, ingredientIds, time, difficulty } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    if (!title || !shortDescription || !recipe) {
        return res.status(400).json({ success: false, message: '필수 항목을 입력해주세요.' });
    }

    try {
        // Insert recipe
        const [result] = await pool.execute(
            'INSERT INTO t_recipe (title, short_description, recipe, time, difficulty, image) VALUES (?, ?, ?, ?, ?, ?)',
            [title, shortDescription, recipe, time, difficulty, image]
        );

        const recipeId = result.insertId;

        // Insert ingredients if provided
        if (ingredientIds && ingredientIds.length > 0) {
            const ingredientArray = Array.isArray(ingredientIds) ? ingredientIds : JSON.parse(ingredientIds);
            const values = ingredientArray.map(ingId => [recipeId, ingId]);

            if (values.length > 0) {
                await pool.query(
                    'INSERT INTO t_recipe_ingredient (recipe_id, ingredient_id) VALUES ?',
                    [values]
                );
            }
        }

        // Fetch ingredients for response
        const [ingredients] = await pool.query(`
            SELECT i.id, i.name, i.icon 
            FROM t_ingredient i
            JOIN t_recipe_ingredient ri ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = ?
        `, [recipeId]);

        res.json({
            success: true,
            recipe: {
                id: recipeId,
                title,
                shortDescription,
                recipe,
                ingredients,
                time,
                difficulty,
                image
            }
        });
    } catch (error) {
        console.error('Add recipe error:', error);
        res.status(500).json({ success: false, message: '레시피 등록 중 오류가 발생했습니다.' });
    }
});

// Get single recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM t_recipe WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '레시피를 찾을 수 없습니다.' });
        }

        // Get ingredients for this recipe
        const [ingredients] = await pool.query(`
            SELECT i.id, i.name, i.icon 
            FROM t_ingredient i
            JOIN t_recipe_ingredient ri ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = ?
        `, [id]);

        const recipe = {
            id: rows[0].id,
            title: rows[0].title,
            shortDescription: rows[0].short_description,
            recipe: rows[0].recipe,
            ingredients: ingredients,
            time: rows[0].time,
            difficulty: rows[0].difficulty,
            image: rows[0].image
        };

        res.json(recipe);
    } catch (error) {
        console.error('Fetch recipe error:', error);
        res.status(500).json({ success: false, message: '레시피를 불러오는 중 오류가 발생했습니다.' });
    }
});

// Delete recipe (admin only)
app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Check if user is admin
    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: '관리자만 레시피를 삭제할 수 있습니다.' });
    }

    try {
        const [result] = await pool.execute('DELETE FROM t_recipe WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '레시피를 찾을 수 없습니다.' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({ success: false, message: '레시피 삭제 중 오류가 발생했습니다.' });
    }
});

// AI Recipe Generation
app.post('/api/recipes/generate-ai', authenticateToken, async (req, res) => {
    const { title } = req.body;

    console.log('AI Generation Request:', { title, hasApiKey: !!process.env.OPENAI_API_KEY });

    if (!title) {
        return res.status(400).json({ success: false, message: '레시피 제목을 입력해주세요.' });
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        return res.status(500).json({ success: false, message: 'OpenAI API 키가 설정되지 않았습니다.' });
    }

    try {
        // Fetch all available ingredients to provide context to AI
        const [ingredients] = await pool.query('SELECT name FROM t_ingredient');
        const ingredientList = ingredients.map(i => i.name).join(', ');

        console.log('Calling OpenAI API...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `당신은 전문 요리사입니다. 사용자가 입력한 레시피 제목을 보고 그에 맞는 상세한 레시피를 한국어로 작성해주세요. 
                    
                    현재 사용 가능한 재료 목록: ${ingredientList}
                    
                    가능하다면 위 목록에 있는 재료 이름을 우선적으로 사용하여 'ingredients' 배열을 구성해주세요.
                    
                    응답은 JSON 형식으로 해주세요: {"shortDescription": "한 줄 짧은 설명 (50자 이내)", "recipe": "상세 레시피 (재료 목록과 조리 방법을 단계별로 상세히 포함)", "time": "조리 시간 (예: 30분)", "difficulty": "쉬움/보통/어려움", "ingredients": ["재료명1", "재료명2", ...]}`
                },
                {
                    role: "user",
                    content: `"${title}" 레시피를 작성해주세요. 짧은 설명과 상세한 레시피, 그리고 사용된 주재료 목록을 알려주세요.`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        console.log('OpenAI Response received');
        const recipeData = JSON.parse(completion.choices[0].message.content);
        console.log('Parsed recipe data:', recipeData);

        res.json({
            success: true,
            recipe: {
                shortDescription: recipeData.shortDescription,
                recipe: recipeData.recipe,
                time: recipeData.time,
                difficulty: recipeData.difficulty,
                ingredients: recipeData.ingredients || []
            }
        });
    } catch (error) {
        console.error('AI generation error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            type: error.type
        });
        res.status(500).json({
            success: false,
            message: 'AI 레시피 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: '파일 크기가 너무 큽니다. (최대 10MB)'
            });
        }
        return res.status(400).json({
            success: false,
            message: `파일 업로드 오류: ${err.message}`
        });
    }

    if (err) {
        console.error('Global error handler caught:', err);
        return res.status(500).json({
            success: false,
            message: '서버 내부 오류가 발생했습니다.',
            error: err.message // Include error message for debugging
        });
    }

    next();
});

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);

    try {
        // Create ingredient table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS t_ingredient (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                icon VARCHAR(10),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('t_ingredient table verified/created');

        // Create recipe table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS t_recipe (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                short_description VARCHAR(255),
                recipe TEXT,
                ingredient_id VARCHAR(50),
                time VARCHAR(50),
                difficulty VARCHAR(20),
                image VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ingredient_id) REFERENCES t_ingredient(id)
            )
        `);
        console.log('t_recipe table verified/created');

        // Create recipe_ingredient table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS t_recipe_ingredient (
                recipe_id BIGINT,
                ingredient_id VARCHAR(50),
                PRIMARY KEY (recipe_id, ingredient_id),
                FOREIGN KEY (recipe_id) REFERENCES t_recipe(id) ON DELETE CASCADE,
                FOREIGN KEY (ingredient_id) REFERENCES t_ingredient(id) ON DELETE CASCADE
            )
        `);
        console.log('t_recipe_ingredient table verified/created');

        // Create favorite table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS t_favorite (
                user_id VARCHAR(50),
                recipe_id BIGINT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, recipe_id),
                FOREIGN KEY (user_id) REFERENCES t_member(member_id) ON DELETE CASCADE,
                FOREIGN KEY (recipe_id) REFERENCES t_recipe(id) ON DELETE CASCADE
            )
        `);
        console.log('t_favorite table verified/created');

        // Insert default ingredients if table is empty
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM t_ingredient');
        if (rows[0].count === 0) {
            await pool.execute(`
                INSERT INTO t_ingredient (id, name, icon) VALUES
                ('carrot', '당근', '🥕'),
                ('kale', '케일', '🥬'),
                ('tomato', '토마토', '🍅'),
                ('potato', '감자', '🥔'),
                ('onion', '양파', '🧅')
            `);
            console.log('Default ingredients inserted');
        }
    } catch (err) {
        console.error('Table creation failed:', err);
    }
});

// Get all ingredients
app.get('/api/ingredients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM t_ingredient ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Fetch ingredients error:', error);
        res.status(500).json({ message: '식재료를 불러오는 중 오류가 발생했습니다.' });
    }
});

// Add new ingredient (admin only)
app.post('/api/ingredients', authenticateToken, async (req, res) => {
    const { id, name, icon } = req.body;

    // Check if user is admin
    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: '관리자만 식재료를 추가할 수 있습니다.' });
    }

    if (!id || !name) {
        return res.status(400).json({ success: false, message: '필수 항목을 입력해주세요.' });
    }

    try {
        await pool.execute(
            'INSERT INTO t_ingredient (id, name, icon) VALUES (?, ?, ?)',
            [id, name, icon || '🥗']
        );

        res.json({
            success: true,
            ingredient: { id, name, icon: icon || '🥗' }
        });
    } catch (error) {
        console.error('Add ingredient error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: '이미 존재하는 식재료 ID입니다.' });
        } else {
            res.status(500).json({ success: false, message: '식재료 추가 중 오류가 발생했습니다.' });
        }
    }
});

// Delete ingredient (admin only)
app.delete('/api/ingredients/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: '관리자만 식재료를 삭제할 수 있습니다.' });
    }

    try {
        await pool.execute('DELETE FROM t_ingredient WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete ingredient error:', error);
        res.status(500).json({ success: false, message: '식재료 삭제 중 오류가 발생했습니다.' });
    }
});
