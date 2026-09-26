var indexController = {};
const jwt = require("jsonwebtoken");

var nodemailer = require('nodemailer');

const pool = require('../mysql.config');

indexController.RenderIndexPage=(req,res)=>
{
    res.json({ success: true, message: "Welcome to Drive Deal API" });
}
indexController.renderCarpage=(req,res)=>
{
    res.json({ success: true, message: "Cars page endpoint accessed successfully" });
}
indexController.fetchCategories=async (req,res)=>
{
    try
    {
        var [records]=await pool.execute('SELECT * FROM categories');
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
indexController.fetchCars=async (req,res)=>
{
    try
    {
        let { id } = req.params;
        let { page = 1, limit = 10, brand, minPrice, maxPrice, fuelType, transmissionType, sortBy = 'createdAt', order = 'DESC' } = req.query;
        
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = 'SELECT c.*, cat.name as category_name FROM cars c JOIN categories cat ON c.category_id = cat.id WHERE c.status = "Available"';
        let countQuery = 'SELECT COUNT(*) as total FROM cars WHERE status = "Available"';
        let params = [];

        if (id !== 'all') {
            query += ' AND c.category_id = ?';
            countQuery += ' AND category_id = ?';
            params.push(id);
        }
        if (brand) {
            query += ' AND c.brand = ?';
            countQuery += ' AND brand = ?';
            params.push(brand);
        }
        if (fuelType) {
            query += ' AND c.fuelType = ?';
            countQuery += ' AND fuelType = ?';
            params.push(fuelType);
        }
        if (transmissionType) {
            query += ' AND c.transmissionType = ?';
            countQuery += ' AND transmissionType = ?';
            params.push(transmissionType);
        }
        if (minPrice) {
            query += ' AND c.price >= ?';
            countQuery += ' AND price >= ?';
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            query += ' AND c.price <= ?';
            countQuery += ' AND price <= ?';
            params.push(parseFloat(maxPrice));
        }

        const validSortFields = ['createdAt', 'price', 'brand', 'mileage'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY c.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
        
        const [countResult] = await pool.execute(countQuery, params);
        const total = countResult[0].total;
        
        params.push(limit, offset);
        const [rows] = await pool.query(query, params);

        const formattedRows = rows.map(car => ({
            ...car,
            category: { id: car.category_id, name: car.category_name }
        }));

        res.json({ 
            success: true, 
            data: formattedRows, 
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Cars fetched successfully" 
        });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to fetch cars", error: e.message });
    }
}
indexController.renderSingleCar=async (req,res)=>
{
    res.json({ success: true, data: { id: req.params.id }, message: "Single car page endpoint accessed successfully" });
}
indexController.fetchSingleCar=async (req,res)=>
{
    try
    {
        var {id}=req.params;
        var query = `
            SELECT c.*, 
                   s.name as seller_name, s.email as seller_email, s.adhar_card, s.pan_card, 
                   s.mobile as seller_mobile, s.gender as seller_gender, s.photo as seller_photo, 
                   s.address as seller_address, s.city as seller_city,
                   cat.name as category_name
            FROM cars c
            JOIN sellers s ON c.seller_id = s.id
            JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ?
        `;
        var [rows]=await pool.execute(query, [id]);
        
        if (rows.length > 0) {
            const car = rows[0];
            const formattedCar = {
                ...car,
                seller: {
                    id: car.seller_id,
                    name: car.seller_name,
                    email: car.seller_email,
                    mobile: car.seller_mobile,
                    gender: car.seller_gender,
                    photo: car.seller_photo,
                    address: car.seller_address,
                    city: car.seller_city,
                    adhar_card: car.adhar_card,
                    pan_card: car.pan_card
                },
                category: {
                    id: car.category_id,
                    name: car.category_name
                }
            };
            res.json({ success: true, data: formattedCar, message: "Car details fetched successfully" });
        } else {
            res.status(404).json({ success: false, message: "Car not found", error: "Not Found" });
        }
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
}
indexController.renderCompareCar= (req,res)=>
{
    res.json({ success: true, message: "Compare cars endpoint accessed successfully" });
}
indexController.renderAboutPage= (req,res)=>
{
    res.json({ success: true, message: "About page endpoint accessed successfully" });
}
indexController.renderContactPage= (req,res)=>
{
    res.json({ success: true, message: "Contact page endpoint accessed successfully" });
}
indexController.fetchReviews=async (req,res)=>
{
    try
    {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM reviews');
        const query = `
            SELECT r.*, 
                   u.first_name, u.last_name, u.photo as user_photo,
                   c.name as car_name, c.photo as car_photo, c.model as car_model
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN cars c ON r.car_id = c.id
            ORDER BY r.createdAt DESC LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query(query, [limit, offset]);
        
        res.json({ 
            success: true, 
            data: rows, 
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Reviews fetched successfully" 
        });
    }
    catch (e)
    {
        res.status(500).json({ success: false, message: "Failed to fetch reviews", error: e.message });
    }
}
module.exports = indexController;