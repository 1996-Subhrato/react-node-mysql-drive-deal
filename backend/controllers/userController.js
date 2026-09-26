const pool = require('../mysql.config');

var userController = {};
const jwt = require('jsonwebtoken');
const secret_key = 'abcd#$%@12345678';
const emailService = require('../utils/emailService');

userController.renderSignUpPage=(req,res)=>
{
    res.json({ success: true, message: "User signup endpoint reached. Please POST details to /register." });
}
userController.renderLoginPage=(req,res)=>
{
    res.json({ success: true, message: "User login endpoint reached. Please POST credentials to /login." });
}
//register usersPic and login usersPic
userController.registerUser = async (req, res) => {
    try {
        var {first_name, last_name, email, password, mobile, gender, address, city} = req.body;
        
        const [userRows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const [sellerRows] = await pool.execute('SELECT * FROM sellers WHERE email = ?', [email]);

        if (userRows.length === 0 && sellerRows.length === 0) {
            var {photo} = req.files;
            var server_path = `public/usersPic/${photo.name}`;
            var db_path = `/usersPic/${photo.name}`;
            photo.mv(server_path, async (error) => {
                if (error) {
                    res.status(500).json({ success: false, message: "Failed to upload photo", error: error.message });
                } else {
                    try {
                        const query = `
                            INSERT INTO users (first_name, last_name, email, password, mobile, gender, photo, address, city) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        await pool.execute(query, [first_name, last_name, email, password, mobile, gender, db_path, address, city]);

                        emailService.sendUserWelcomeEmail(req.body);
                        res.json({ success: true, message: "User registered Successfully" });
                    } catch (e) {
                        res.status(500).json({ success: false, message: "Failed to register user", error: e.message });
                    }
                }
            });
        } else {
            const collisionType = userRows.length > 0 ? "User" : "Seller";
            res.status(400).json({ success: false, message: `${collisionType} with this email already exists` });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
userController.loginUser = async (req, res) => {
    try {
        var {email, password} = req.body;
        var [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            var result = rows[0];
            if (result.status === 'Active') {
                var payload = {
                    id: result.id,
                    email: result.email,
                    name: result.first_name,
                    first_name: result.first_name
                }
                var token = jwt.sign(payload, secret_key, {expiresIn: '1D'});
                res.cookie('UserToken', token);
                res.json({ success: true, data: { token, user: payload }, message: "Login Successful" });
            } else {
                res.status(403).json({ success: false, message: "User Blocked By Admin", error: "Forbidden" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials", error: "Authentication Failed" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
userController.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [[{ totalCount }]] = await pool.execute('SELECT COUNT(*) as totalCount FROM purchase_requests WHERE user_id = ?', [userId]);
        const [[{ pendingCount }]] = await pool.execute('SELECT COUNT(*) as pendingCount FROM purchase_requests WHERE user_id = ? AND status = "Pending"', [userId]);
        const [[{ soldCount }]] = await pool.execute('SELECT COUNT(*) as soldCount FROM purchase_requests WHERE user_id = ? AND status = "Sold"', [userId]);

        res.json({
            success: true,
            data: {
                total: totalCount,
                pending: pendingCount,
                sold: soldCount
            }
        });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch stats", error: e.message });
    }
}
userController.renderDashboard=(req,res)=>
{
    res.json({ success: true, data: { name: req.user.name }, message: "User Dashboard accessed successfully" });
}
userController.checkToken = (req, res) => {
    if (req.user) {
        res.json({ success: true, message: "Token is valid", data: req.user });
    } else {
        res.status(401).json({ success: false, message: "Unauthorized", error: "No token found" });
    }
}
userController.logoutUser = (req, res) => {
    res.clearCookie('UserToken');
    res.json({ success: true, message: "Logged out successfully" });
}
userController.renderProfile = (req, res) => {
    res.json({ success: true, message: "User Profile endpoint accessed successfully" });
}
userController.showProfile = async (req, res) => {
    try {
        var {id} = req.user;
        var [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0], message: "Profile fetched successfully" });
        } else {
            res.status(404).json({ success: false, message: "User profile not found", error: "Not Found" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
userController.updateProfile = async (req, res) => {
    try {
        let id = req.params.id;
        if (!id || id === 'undefined' || id === 'null') {
            id = req.user.id;
        }

        const updateData = { ...req.body };
        delete updateData.email;
        delete updateData.password;

        if (req.files && req.files.photo) {
            const photo = req.files.photo;
            const extension = photo.name.split('.').pop();
            const fileName = `user_${id}_${Date.now()}.${extension}`;
            const server_path = `public/usersPic/${fileName}`;
            const db_path = `/usersPic/${fileName}`;

            await photo.mv(server_path);
            updateData.photo = db_path;
        }

        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);

        await pool.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
        return res.json({ success: true, message: "Profile Details Updated Successfully" });
    }
 catch (e) {
        console.error("Update profile error:", e);
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}

userController.changePassword = async (req, res) => {
    res.json({ success: true, message: "Change Password endpoint accessed successfully" });
}

userController.updatePassword = async (req, res) => {
    try {
        var {id} = req.user;
        var {password, new_password} = req.body;
        var [rows] = await pool.execute('SELECT * FROM users WHERE id = ? AND password = ?', [id, password]);
        if (rows.length > 0) {
            await pool.execute('UPDATE users SET password = ? WHERE id = ?', [new_password, id]);
            res.json({ success: true, message: "Password Updated SuccessFully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Password", error: "Bad Request" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
userController.addCarRequest=async (req,res)=>
{
    try
    {
        var {id}=req.user;
        const { car: car_id, seller: seller_id } = req.body;
        
        const [existingRows] = await pool.execute('SELECT * FROM purchase_requests WHERE user_id = ? AND car_id = ?', [id, car_id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ success: false, message: 'You have already sent a purchase request for this vehicle' });
        }

        await pool.execute('INSERT INTO purchase_requests (car_id, seller_id, user_id) VALUES (?, ?, ?)', [car_id, seller_id, id]);
        
        try {
            const [[carDoc]] = await pool.execute('SELECT * FROM cars WHERE id = ?', [car_id]);
            const [[sellerDoc]] = await pool.execute('SELECT * FROM sellers WHERE id = ?', [seller_id]);
            const [[userDoc]] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
            if (sellerDoc && carDoc && userDoc) {
                await emailService.sendPurchaseRequestNotificationToSeller(sellerDoc.email, carDoc, userDoc);
            }
        } catch (emailErr) {
            console.error("Failed to notify seller about purchase request:", emailErr);
        }

        res.json({ success: true, message: 'Purchase Interest Sent to Seller' });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to send request", error: e.message });
    }
}
userController.updateCarStatus=async (req,res)=>
{
    try
    {
        var {id}=req.params;
        const fields = Object.keys(req.body).map(key => `${key} = ?`).join(', ');
        const values = Object.values(req.body);
        values.push(id);
        
        const [result] = await pool.execute(`UPDATE cars SET ${fields} WHERE id = ?`, values);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Car status updated SuccessFully" });
        }
        else {
            res.status(404).json({ success: false, message: "Invalid Id", error: "Not Found" });
        }
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
userController.thankyou= (req,res)=>
{
    res.json({ success: true, message: "Thank you for your purchase interest!" });
}
userController.renderMyCarPage= (req,res)=>
{
    res.json({ success: true, message: "My Purchase Requests endpoint accessed successfully" });
}

userController.fetchMyCars = async (req, res) =>
{
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const { id } = req.user;
        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM purchase_requests WHERE user_id = ?', [id]);
        
        const query = `
            SELECT pr.*, 
                   c.*, c.name as car_name, c.photo as car_photo, c.price as car_price,
                   s.name as seller_name, s.email as seller_email, s.mobile as seller_mobile, s.photo as seller_photo, s.city as seller_city, s.address as seller_address
            FROM purchase_requests pr
            JOIN cars c ON pr.car_id = c.id
            JOIN sellers s ON pr.seller_id = s.id
            WHERE pr.user_id = ?
            ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query(query, [id, limit, offset]);

        const rowsWithReviews = await Promise.all(rows.map(async (row) => {
            const [reviews] = await pool.execute('SELECT * FROM reviews WHERE user_id = ? AND car_id = ?', [id, row.car_id]);
            
            // Nesting the data for frontend compatibility
            return {
                id: row.id,
                car_id: row.car_id,
                seller_id: row.seller_id,
                user_id: row.user_id,
                status: row.status,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                existingReview: reviews[0] || null,
                car: {
                    ...row,
                    id: row.car_id,
                    name: row.car_name,
                    photo: row.car_photo,
                    price: row.car_price,
                    category: row.category_id
                },
                seller: {
                    id: row.seller_id,
                    name: row.seller_name,
                    email: row.seller_email,
                    mobile: row.seller_mobile,
                    photo: row.seller_photo,
                    city: row.seller_city,
                    address: row.seller_address
                }
            };
        }));

        res.json({ 
            success: true, 
            data: rowsWithReviews, 
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "My purchase requests fetched successfully" 
        });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch requests", error: e.message });
    }
}

userController.addReview = async (req, res) => {
    try {
        const { carId: car_id, rating, feedback } = req.body;
        const user_id = req.user.id;

        if (!car_id || !rating || !feedback) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const [rows] = await pool.execute('SELECT * FROM reviews WHERE user_id = ? AND car_id = ?', [user_id, car_id]);
        let isNew = false;
        let review_id;

        if (rows.length > 0) {
            await pool.execute('UPDATE reviews SET rating = ?, feedback = ? WHERE user_id = ? AND car_id = ?', [parseInt(rating), feedback, user_id, car_id]);
            review_id = rows[0].id;
        } else {
            const [result] = await pool.execute('INSERT INTO reviews (user_id, car_id, rating, feedback) VALUES (?, ?, ?, ?)', [user_id, car_id, parseInt(rating), feedback]);
            review_id = result.insertId;
            isNew = true;
        }

        try {
            const [[carDoc]] = await pool.execute('SELECT * FROM cars WHERE id = ?', [car_id]);
            const [[userDoc]] = await pool.execute('SELECT * FROM users WHERE id = ?', [user_id]);
            const [[sellerDoc]] = await pool.execute('SELECT * FROM sellers WHERE id = ?', [carDoc.seller_id]);
            if (sellerDoc && carDoc && userDoc) {
                await emailService.sendReviewNotificationToSeller(sellerDoc.email, carDoc, userDoc, { rating, feedback });
            }
        } catch (emailErr) {
            console.error("Failed to send review email to seller:", emailErr);
        }

        res.json({ 
            success: true, 
            message: isNew ? "Review submitted successfully! Seller notified." : "Review updated successfully!", 
            data: { id: review_id, user_id, car_id, rating, feedback } 
        });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to process review", error: e.message });
    }
}

userController.checkCarRequest = async (req, res) => {
    try {
        const { carId } = req.params;
        const userId = req.user.id;
        const [rows] = await pool.execute('SELECT 1 FROM purchase_requests WHERE user_id = ? AND car_id = ? LIMIT 1', [userId, carId]);
        res.json({ success: true, requested: rows.length > 0 });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to check request status", error: e.message });
    }
}

module.exports = userController;