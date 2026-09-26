const jwt = require("jsonwebtoken");
const emailService = require('../utils/emailService');
const sellerController = {};
var secret_key = 'abcd#$%@12345678';

var nodemailer = require('nodemailer');

const pool = require('../mysql.config');

sellerController.RenderSignup = (req, res) => {
    res.json({ success: true, message: "Seller signup endpoint reached. Please POST details to /register." });
}
sellerController.RenderLogin = (req, res) => {
    res.json({ success: true, message: "Seller login endpoint reached. Please POST credentials to /login." });
}
sellerController.registerSeller = async (req, res) => {
    try {
        if (req.body.aadhaar_card && !req.body.adhar_card) {
            req.body.adhar_card = req.body.aadhaar_card;
        }

        var { name, email, password, adhar_card, pan_card, mobile, gender, address, city } = req.body;
        
        const [sellerRows] = await pool.execute('SELECT * FROM sellers WHERE email = ?', [email]);
        const [userRows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (sellerRows.length === 0 && userRows.length === 0) {
            if (!req.files || !req.files.photo) {
                return res.status(400).json({ success: false, message: "Profile photo is required" });
            }

            var { photo } = req.files;
            var server_path = `public/sellersPic/${photo.name}`;
            var db_path = `/sellersPic/${photo.name}`;

            photo.mv(server_path, async (error) => {
                if (error) {
                    res.status(500).json({ success: false, message: "Failed to upload photo", error: error.message });
                } else {
                    try {
                        const query = `
                            INSERT INTO sellers (name, email, password, adhar_card, pan_card, mobile, gender, photo, address, city) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        await pool.execute(query, [
                            name || null, 
                            email || null, 
                            password || null, 
                            adhar_card || null, 
                            pan_card || null, 
                            mobile || null, 
                            gender || null, 
                            db_path || null, 
                            address || null, 
                            city || null
                        ]);
                        res.json({ success: true, message: "Seller registered Successfully" });
                    } catch (e) {
                        res.status(500).json({ success: false, message: "Failed to register seller", error: e.message });
                    }
                }
            });
        } else {
            const collisionType = sellerRows.length > 0 ? "Seller" : "User";
            res.status(400).json({ success: false, message: `${collisionType} with this email already exists` });
        }
    }
 catch (e) {
        console.error("Internal Server Error in registerSeller:", e);
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.loginSeller = async (req, res) => {
    try {
        var { email, password } = req.body;
        var [rows] = await pool.execute('SELECT * FROM sellers WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            var result = rows[0];
            if (result.status === 'Active') {
                var payload = {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    photo: result.photo
                }
                var token = jwt.sign(payload, secret_key, { expiresIn: '1D' });
                res.cookie('SellerToken', token);
                res.json({ success: true, data: { token, seller: payload }, message: "Login Successful" });
            } else {
                res.status(403).json({ success: false, message: "KYC DETAILS ARE UNDER PROCESS", error: "Forbidden" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials", error: "Authentication Failed" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.renderDashBoard = (req, res) => {
    res.json({ success: true, message: "Seller Dashboard accessed successfully" });
}
sellerController.getStats = async (req, res) => {
    try {
        const sellerId = req.seller.id;
        
        const [[{ totalCars }]] = await pool.execute('SELECT COUNT(*) as totalCars FROM cars WHERE seller_id = ?', [sellerId]);
        const [[{ pendingCount }]] = await pool.execute('SELECT COUNT(*) as pendingCount FROM purchase_requests WHERE seller_id = ? AND status = "Pending"', [sellerId]);
        const [[{ soldCount }]] = await pool.execute('SELECT COUNT(*) as soldCount FROM purchase_requests WHERE seller_id = ? AND status = "Sold"', [sellerId]);
        const [[{ totalRevenue }]] = await pool.execute('SELECT SUM(price) as totalRevenue FROM cars WHERE seller_id = ? AND status = "Sold"', [sellerId]);

        res.json({
            success: true,
            data: {
                vehicles: totalCars,
                pending: pendingCount,
                sold: soldCount,
                revenue: totalRevenue || 0
            }
        });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch stats", error: e.message });
    }
}
sellerController.checkToken = (req, res) => {
    if (req.seller) {
        res.json({ success: true, message: "Token is valid", data: req.seller });
    } else {
        res.status(401).json({ success: false, message: "Unauthorized", error: "No token found" });
    }
}
sellerController.logoutUser = (req, res) => {
    res.clearCookie('SellerToken');
    res.json({ success: true, message: "Logged out successfully" });
}
sellerController.renderProfile = (req, res) => {
    res.json({ success: true, message: "Seller Profile endpoint accessed successfully" });
}
sellerController.showProfile = async (req, res) => {
    try {
        var { id } = req.seller;
        var [rows] = await pool.execute('SELECT * FROM sellers WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0], message: "Profile fetched successfully" });
        } else {
            res.status(404).json({ success: false, message: "Seller profile not found", error: "Not Found" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.updateProfile = async (req, res) => {
    try {
        let id = req.params.id;
        if (!id || id === 'undefined' || id === 'null') {
            id = req.seller.id;
        }
        
        const updateData = { ...req.body };
        delete updateData.email; 
        delete updateData.password;

        if (req.files) {
            if (req.files.photo) {
                const photo = req.files.photo;
                const fileName = `seller_photo_${id}_${Date.now()}.${photo.name.split('.').pop()}`;
                const server_path = `public/sellersPic/${fileName}`;
                const db_path = `/sellersPic/${fileName}`;
                await photo.mv(server_path);
                updateData.photo = db_path;
            }

            if (req.files.banner) {
                const banner = req.files.banner;
                const fileName = `seller_banner_${id}_${Date.now()}.${banner.name.split('.').pop()}`;
                const server_path = `public/sellersPic/${fileName}`;
                const db_path = `/sellersPic/${fileName}`;
                await banner.mv(server_path);
                updateData.banner = db_path;
            }
        }

        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);

        await pool.execute(`UPDATE sellers SET ${fields} WHERE id = ?`, values);
        return res.json({ success: true, message: "Profile updated successfully" });
    }
 catch (e) {
        console.error("Update profile error:", e);
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}

sellerController.changePassword = async (req, res) => {
    res.json({ success: true, message: "Change Password endpoint accessed successfully" });
}

sellerController.updatePassword = async (req, res) => {
    try {
        var { id } = req.seller;
        var { password, new_password } = req.body;
        var [rows] = await pool.execute('SELECT * FROM sellers WHERE id = ? AND password = ?', [id, password]);
        if (rows.length > 0) {
            await pool.execute('UPDATE sellers SET password = ? WHERE id = ?', [new_password, id]);
            res.json({ success: true, message: "Password Updated SuccessFully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Password", error: "Bad Request" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.renderManageCar = async (req, res) => {
    res.json({ success: true, message: "Manage Car endpoint accessed successfully" });
}
sellerController.addCar = async (req, res) => {
    try {
        if (!req.files || !req.files.photo) {
            return res.status(400).json({ success: false, message: "Car photo is required" });
        }

        var { photo } = req.files;
        var { id } = req.seller;
        var server_path = `public/uploads/${photo.name}`;
        var db_path = `/uploads/${photo.name}`;

        photo.mv(server_path, async (error) => {
            if (error) {
                console.error("Photo upload error:", error);
                res.status(500).json({ success: false, message: "Failed to upload photo", error: error.message });
            } else {
                try {
                    const [sellerRows] = await pool.execute('SELECT * FROM sellers WHERE id = ?', [id]);
                    if (sellerRows.length === 0) {
                        return res.status(404).json({ success: false, message: "Seller not found" });
                    }
                    const seller = sellerRows[0];

                    const { brand, model, manufacturingYear, name, fuelType, transmissionType, mileage, kmDriven, engineCapacity, color, chassisNumber, registrationNumber, insuranceValidity, price, ownerType, category } = req.body;
                    
                    const address = req.body.address || seller.city || seller.address;
                    const location = req.body.location || seller.address || seller.city;
                    const contact = req.body.contact || seller.mobile;

                    const query = `
                        INSERT INTO cars (brand, model, manufacturingYear, name, fuelType, transmissionType, mileage, kmDriven, engineCapacity, color, chassisNumber, registrationNumber, insuranceValidity, price, ownerType, address, location, contact, photo, seller_id, category_id) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    // Sanitize inputs: replace undefined with null for MySQL
                    const params = [
                        brand || null, 
                        model || null, 
                        manufacturingYear || null, 
                        name || null, 
                        fuelType || null, 
                        transmissionType || null, 
                        mileage || null, 
                        kmDriven || null, 
                        engineCapacity || null, 
                        color || null, 
                        chassisNumber || null, 
                        registrationNumber || null, 
                        insuranceValidity || null, 
                        price || null, 
                        ownerType || null, 
                        address || null, 
                        location || null, 
                        contact || null, 
                        db_path || null, 
                        id || null, 
                        category || null
                    ];

                    await pool.execute(query, params);

                    res.json({ success: true, message: "Car Added Successfully" });
                }
                catch (e) {
                    console.error("Database error in addCar:", e);
                    res.status(500).json({ success: false, message: "Failed to add car", error: e.message });
                }
            }
        });
    } catch (e) {
        console.error("Internal Server Error in addCar:", e);
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.fetchCategories = async (req, res) => {
    try {
        var [records] = await pool.execute('SELECT * FROM categories');
        res.json({ success: true, data: records, message: "Categories fetched successfully" });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch categories", error: e.message });
    }
}
sellerController.fetchcars = async (req, res) => {
    try {
        let { page = 1, limit = 10, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM cars WHERE seller_id = ?';
        let params = [req.seller.id];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM cars WHERE seller_id = ? ${status ? 'AND status = ?' : ''}`, params);
        
        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        // Check for requests for each car
        const carsWithRequestStatus = await Promise.all(rows.map(async (car) => {
            const [requestRows] = await pool.execute('SELECT 1 FROM purchase_requests WHERE car_id = ? LIMIT 1', [car.id]);
            return {
                ...car,
                hasRequests: requestRows.length > 0
            };
        }));

        res.json({
            success: true,
            data: carsWithRequestStatus,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Cars fetched successfully"
        });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch cars", error: e.message });
    }
}

sellerController.updateCar = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller.id;

        const [requestRows] = await pool.execute('SELECT 1 FROM purchase_requests WHERE car_id = ? LIMIT 1', [id]);
        if (requestRows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot edit car details as purchase requests have already been made for this vehicle." 
            });
        }

        const updateData = { ...req.body };
        delete updateData.photo;

        if (req.files && req.files.photo) {
            const { photo } = req.files;
            const server_path = `public/uploads/${photo.name}`;
            const db_path = `/uploads/${photo.name}`;
            await photo.mv(server_path);
            updateData.photo = db_path;
        }

        // Remove undefined values and handle category mapping
        if (updateData.category) {
            updateData.category_id = updateData.category;
            delete updateData.category;
        }

        const filteredKeys = Object.keys(updateData).filter(key => updateData[key] !== undefined);
        if (filteredKeys.length === 0) {
            return res.json({ success: true, message: "No changes to update" });
        }

        const fields = filteredKeys.map(key => `${key} = ?`).join(', ');
        const values = filteredKeys.map(key => updateData[key] === undefined ? null : updateData[key]);
        values.push(id, sellerId);

        await pool.execute(`UPDATE cars SET ${fields} WHERE id = ? AND seller_id = ?`, values);
        res.json({ success: true, message: "Car updated successfully" });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to update car", error: e.message });
    }
}
sellerController.deleteCar = async (req, res) => {
    try {
        var { id } = req.params;
        
        const [requestRows] = await pool.execute('SELECT 1 FROM purchase_requests WHERE car_id = ? LIMIT 1', [id]);
        if (requestRows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete car as purchase requests have already been made for this vehicle." 
            });
        }

        await pool.execute('DELETE FROM cars WHERE id = ?', [id]);
        res.json({ success: true, message: "Car deleted successfully" });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Failed to delete car", error: e.message });
    }
}
sellerController.renderManageCarReq = async (req, res) => {
    res.json({ success: true, message: "Manage Purchase Requests endpoint accessed successfully" });
}
sellerController.fetchCarReq = async (req, res) => {
    try {
        let { page = 1, limit = 10, status = 'Pending' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM purchase_requests WHERE seller_id = ? AND status = ?', [req.seller.id, status]);
        
        const query = `
            SELECT pr.*, 
                   c.brand, c.model, c.name as car_name, c.mileage, c.photo as car_photo, c.price as car_price,
                   u.first_name, u.last_name, u.email as user_email, u.mobile as user_mobile
            FROM purchase_requests pr
            JOIN cars c ON pr.car_id = c.id
            JOIN users u ON pr.user_id = u.id
            WHERE pr.seller_id = ? AND pr.status = ?
            ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query(query, [req.seller.id, status, limit, offset]);

        res.json({
            success: true,
            data: rows,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Purchase requests fetched successfully"
        });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch purchase requests", error: e.message });
    }
}
sellerController.UpdateCarReq = async (req, res) => {
    try {
        var { id } = req.params;
        const { status } = req.body;
        
        const [requestRows] = await pool.execute('SELECT * FROM purchase_requests WHERE id = ?', [id]);
        if (requestRows.length === 0) {
            return res.status(404).json({ success: false, message: "Purchase request not found" });
        }
        const purchaseReq = requestRows[0];

        await pool.execute('UPDATE purchase_requests SET status = ? WHERE id = ?', [status, id]);

        if (status === 'Approved') {
            await pool.execute('UPDATE cars SET status = "Approved" WHERE id = ?', [purchaseReq.car_id]);
            await pool.execute('UPDATE purchase_requests SET status = "Rejected" WHERE car_id = ? AND id != ? AND status = "Pending"', [purchaseReq.car_id, id]);
        } else if (status === 'Sold') {
            await pool.execute('UPDATE cars SET status = "Sold" WHERE id = ?', [purchaseReq.car_id]);
            await pool.execute('UPDATE purchase_requests SET status = "Rejected" WHERE car_id = ? AND id != ? AND status IN ("Pending", "Approved")', [purchaseReq.car_id, id]);

            try {
                const [[user]] = await pool.execute('SELECT * FROM users WHERE id = ?', [purchaseReq.user_id]);
                const [[car]] = await pool.execute('SELECT * FROM cars WHERE id = ?', [purchaseReq.car_id]);
                if (user && car) {
                    await emailService.sendSaleConfirmationEmail(user.email, car);
                }
            } catch (emailErr) {
                console.error("Failed to send sale confirmation email:", emailErr);
            }
        } else if (status === 'Pending') {
            await pool.execute('UPDATE cars SET status = "Available" WHERE id = ?', [purchaseReq.car_id]);
            await pool.execute('UPDATE purchase_requests SET status = "Pending" WHERE car_id = ? AND status = "Rejected"', [purchaseReq.car_id]);
        }

        res.json({ success: true, message: `Request updated to ${status} successfully` });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Failed to update request", error: e.message });
    }
}
sellerController.updateCarStatus = async (req, res) => {
    try {
        var { id } = req.params;
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
    catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.renderApprovedReq = (req, res) => {
    res.json({ success: true, message: "Approved Requests endpoint accessed successfully" });
}
sellerController.fetchApprovedReq = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM purchase_requests WHERE seller_id = ? AND status = "Sold"', [req.seller.id]);
        
        const query = `
            SELECT pr.*, 
                   c.brand, c.model, c.name as car_name, c.mileage, c.photo as car_photo, c.price as car_price,
                   u.first_name, u.last_name, u.email as user_email, u.mobile as user_mobile
            FROM purchase_requests pr
            JOIN cars c ON pr.car_id = c.id
            JOIN users u ON pr.user_id = u.id
            WHERE pr.seller_id = ? AND pr.status = "Sold"
            ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query(query, [req.seller.id, limit, offset]);

        res.json({
            success: true,
            data: rows,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Sold cars fetched successfully"
        });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch sold cars", error: e.message });
    }
}

sellerController.sendEmail = async (req, res) => {
    try {
        var { email, vehicle_name, status, name } = req.body;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dummymail2003s@gmail.com',
                pass: 'uevludqlpergxtje',
            },
        });
        const mailOptions = {
            from: 'dummymail2003s@gmail.com',
            to: email,
            subject: `Subject: Your ${vehicle_name} Purchase Interest Has Been ${status}`,
            html: `<h1>Dear ${name}</h1>
<p>This is to inform you that your interest in purchasing ${vehicle_name} at Drive Deal has been ${status}.</p>`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
            } else {
                res.json({ success: true, message: "E-Mail Sent Successfully" });
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
sellerController.fetchCarsWithRequests = async (req, res) => {
    try {
        const sellerId = req.seller.id;
        const { status } = req.query;
        
        let carQuery = 'SELECT c.*, cat.name as category_name FROM cars c JOIN categories cat ON c.category_id = cat.id WHERE c.seller_id = ?';
        let params = [sellerId];

        if (status === 'Sold') {
            carQuery += ' AND c.status = "Sold"';
        } else {
            carQuery += ' AND c.status IN ("Available", "Approved")';
        }

        carQuery += ' ORDER BY c.updatedAt DESC';

        const [cars] = await pool.execute(carQuery, params);

        const carsWithRequests = await Promise.all(cars.map(async (car) => {
            const [requestRows] = await pool.execute(`
                SELECT pr.*, u.first_name, u.last_name, u.email as user_email, u.mobile as user_mobile, u.photo as user_photo
                FROM purchase_requests pr
                JOIN users u ON pr.user_id = u.id
                WHERE pr.car_id = ?
                ORDER BY pr.createdAt DESC
            `, [car.id]);

            const requests = requestRows.map(row => ({
                ...row,
                customer: {
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email: row.user_email,
                    mobile: row.user_mobile,
                    photo: row.user_photo
                }
            }));
            
            let review = null;
            if (car.status === 'Sold') {
                const [reviews] = await pool.execute(`
                    SELECT r.*, u.first_name, u.last_name
                    FROM reviews r
                    JOIN users u ON r.user_id = u.id
                    WHERE r.car_id = ?
                `, [car.id]);
                review = reviews[0] || null;
            }
            
            return {
                ...car,
                purchaseRequests: requests,
                review: review
            };
        }));

        const filteredCars = carsWithRequests.filter(c => c.purchaseRequests.length > 0 || c.status === 'Sold' || c.status === 'Approved');

        res.json({ success: true, data: filteredCars });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch cars with requests", error: e.message });
    }
}

module.exports = sellerController;