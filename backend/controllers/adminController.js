const pool = require('../mysql.config');
var adminController={};
var jwt=require('jsonwebtoken');
//for email sending
var nodemailer = require('nodemailer');
const emailService = require('../utils/emailService');


var secret_key='abcd#$%@12345678';
//making function to call in admin.js route directly
//adding data too the table

adminController.renderAdminPage=(req,res)=>
{
    res.json({ success: true, message: "Admin login endpoint reached. Please POST credentials to /login." });
}
adminController.loginAdmin=async (req,res)=>
{
    try
    {
        var {email, password} = req.body;
        var [rows]=await pool.execute('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password]);
        if(rows.length > 0)
        {
            var result = rows[0];
            var payload={
                id:result.id,
                email:result.email,
                name:result.name
            }
            var token=jwt.sign(payload,secret_key,{expiresIn:'1D'});
            res.cookie('AdminToken',token);
            res.json({ success: true, data: { token, admin: payload }, message: "Login Successful" });
        }
        else
        {
            res.status(401).json({ success: false, message: "Invalid Credentials", error: "Authentication Failed" });
        }
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
adminController.renderDashboard=(req,res)=>
{
    res.json({ success: true, message: "Admin Dashboard accessed successfully" });
}
adminController.renderManageSeller=(req,res)=>
{
    res.json({ success: true, message: "Manage Seller endpoint accessed successfully" });
}
adminController.fetchSellers=async (req,res)=>
{
    try
    {
        let { page = 1, limit = 10, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM sellers';
        let countQuery = 'SELECT COUNT(*) as total FROM sellers';
        let params = [];

        if (status) {
            query += ' WHERE status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [[{ total }]] = await pool.execute(countQuery, status ? [status] : []);
        const [rows] = await pool.query(query, params);

        res.json({ 
            success: true, 
            data: rows, 
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Sellers fetched successfully" 
        });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to fetch sellers", error: e.message });
    }
}
adminController.updateSellerStatus=async (req,res)=>
{
    try
    {
        var {id}=req.params;
        var {status}=req.body;
        
        await pool.execute('UPDATE sellers SET status = ? WHERE id = ?', [status, id]);
        const [rows] = await pool.execute('SELECT * FROM sellers WHERE id = ?', [id]);
        const seller = rows[0];
        
        try {
            await emailService.sendSellerStatusUpdateEmail(seller, status);
        } catch (emailErr) {
            console.error("Failed to send status update email:", emailErr);
        }
        
        res.json({ success: true, message: "Seller status updated successfully" });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to update seller status", error: e.message });
    }
}
adminController.deleteSeller=async (req,res)=>
{
    try
    {
        var {id}=req.params;
        await pool.execute('DELETE FROM sellers WHERE id = ?', [id]);
        res.json({ success: true, message: "Seller deleted successfully" });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to delete seller", error: e.message });
    }
}
adminController.sendEmail = async (req, res) => {
    try {
        var {email,status,name} = req.body;
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
            subject: 'Subject: Your KYC Verification Request Has Been '+status,
            html: `<h1>Dear ${name}</h1>
<p>This is to inform you that your KYC verification status for selling on Drive Deal has been ${status}.</p>`,
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
adminController.renderManageCategory=(req,res)=>
{
    res.json({ success: true, message: "Manage Category endpoint accessed successfully" });
}
adminController.addCategory=async (req,res)=>
{
    try {
        var {name} = req.body;
        var [result] = await pool.execute('SELECT * FROM categories WHERE name = ?', [name]);
        if (result.length == 0) {
            var {photo} = req.files;
            var server_path = `public/categoryPic/${photo.name}`;
            var db_path = `/categoryPic/${photo.name}`;
            photo.mv(server_path, async (error) => {
                if (error) {
                    res.status(500).json({ success: false, message: "Failed to upload photo", error: error.message });
                }
                else {
                    try {
                        await pool.execute('INSERT INTO categories (name, photo) VALUES (?, ?)', [name, db_path]);
                        res.json({ success: true, message: "Category Created Successfully" });
                    } catch (e) {
                        res.status(500).json({ success: false, message: "Failed to create category", error: e.message });
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, message: "Category Already Exists" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
adminController.viewCategory=async (req,res)=>
{
    try
    {
        var [records] = await pool.execute('SELECT * FROM categories');
        res.json({ 
            success: true, 
            data: records, 
            meta: { total: records.length },
            message: "Categories fetched successfully" 
        });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to fetch categories", error: e.message });
    }
}

adminController.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        if (req.files && req.files.photo) {
            const { photo } = req.files;
            const server_path = `public/categoryPic/${photo.name}`;
            const db_path = `/categoryPic/${photo.name}`;
            
            photo.mv(server_path, async (error) => {
                if (error) {
                    return res.status(500).json({ success: false, message: "Failed to upload photo", error: error.message });
                }
                await pool.execute('UPDATE categories SET name = ?, photo = ? WHERE id = ?', [name, db_path, id]);
                res.json({ success: true, message: "Category updated successfully" });
            });
        } else {
            await pool.execute('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
            res.json({ success: true, message: "Category updated successfully" });
        }
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to update category", error: e.message });
    }
}
adminController.deleteCategory=async (req,res)=>
{
    try
    {
        var {id}=req.params;
        await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ success: true, message: "Category deleted successfully" });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to delete category", error: e.message });
    }
}
//change password
adminController.changePassword=async (req,res)=>
{
    res.json({ success: true, message: "Change Password endpoint accessed successfully" });
}
adminController.updatePassword=async (req,res)=>
{
    try
    {
        var id = req.admin.id;
        var {password,new_password}=req.body;
        var [rows] = await pool.execute('SELECT * FROM admins WHERE id = ? AND password = ?', [id, password]);
        if(rows.length > 0)
        {
            await pool.execute('UPDATE admins SET password = ? WHERE id = ?', [new_password, id]);
            res.json({ success: true, message: "Password Updated SuccessFully" });
        }
        else
        {
            res.status(400).json({ success: false, message: "Invalid Password" });
        }
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
adminController.logout=(req,res)=>
{
    res.clearCookie('AdminToken');
    res.json({ success: true, message: "Logged out successfully" });
}
adminController.checkToken = (req, res) => {
    if (req.admin) {
        res.json({ success: true, message: "Token is valid", data: req.admin });
    } else {
        res.status(401).json({ success: false, message: "Unauthorized", error: "No token found" });
    }
}
adminController.renderPurchaseRequests=(req,res)=>
{
    res.json({ success: true, message: "View Purchase Requests endpoint accessed successfully" });
}
adminController.fetchPurchaseRequests = async (req, res) => {
    try
    {
        let { page = 1, limit = 10, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = `
            SELECT pr.*, 
                   c.brand, c.model, c.name as car_name, c.mileage, c.photo as car_photo, c.price as car_price,
                   u.first_name, u.last_name, u.email as user_email, u.mobile as user_mobile,
                   s.name as seller_name, s.email as seller_email
            FROM purchase_requests pr
            JOIN cars c ON pr.car_id = c.id
            JOIN users u ON pr.user_id = u.id
            JOIN sellers s ON pr.seller_id = s.id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM purchase_requests';
        let params = [];

        if (status) {
            query += ' WHERE pr.status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [[{ total }]] = await pool.execute(countQuery, status ? [status] : []);
        const [rows] = await pool.query(query, params);

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
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to fetch purchase requests", error: e.message });
    }
}

adminController.fetchUsers = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const [rows] = await pool.query('SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset]);
        
        res.json({
            success: true,
            data: rows,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Users fetched successfully"
        });
    }
 catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch users", error: e.message });
    }
}

adminController.getDashboardStats = async (req, res) => {
    try {
        const [[{ sellers }]] = await pool.execute('SELECT COUNT(*) as sellers FROM sellers');
        const [[{ categories }]] = await pool.execute('SELECT COUNT(*) as categories FROM categories');
        const [[{ purchaseRequests }]] = await pool.execute('SELECT COUNT(*) as purchaseRequests FROM purchase_requests');
        const [[{ users }]] = await pool.execute('SELECT COUNT(*) as users FROM users');
        const [[{ cars }]] = await pool.execute('SELECT COUNT(*) as cars FROM cars');

        res.json({
            success: true,
            data: {
                sellers: sellers || 0,
                categories: categories || 0,
                purchaseRequests: purchaseRequests || 0,
                users: users || 0,
                cars: cars || 0
            },
            message: "Dashboard statistics fetched successfully"
        });
    } catch (e) {
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats", error: e.message });
    }
}

module.exports = adminController;

