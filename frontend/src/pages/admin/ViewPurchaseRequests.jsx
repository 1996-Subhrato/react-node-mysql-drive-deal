import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import styles from './AdminShared.module.css';

const ViewBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (photo) => {
        if (!photo) return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600';
        if (photo.startsWith('http')) return photo;
        if (photo.startsWith('/')) return `http://localhost:5000${photo}`;
        return `http://localhost:5000/uploads/${photo}`;
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await adminService.getPurchaseRequests({ limit: 1000 });
                if (response.data.success) {
                    setBookings(response.data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed':
            case 'Sold':
                return `${styles.statusBadge} ${styles.statusCompleted}`;
            case 'Pending':
                return `${styles.statusBadge} ${styles.statusPending}`;
            case 'Cancelled':
            case 'Rejected':
                return `${styles.statusBadge} ${styles.statusCancelled}`;
            case 'Approved':
                return `${styles.statusBadge} ${styles.statusApproved}`;
            default:
                return styles.statusBadge;
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className={styles.title}>Booking Management</h2>
                <div className={styles.statsBadge}>
                    <i className="fas fa-calendar-check"></i>
                    <span>Total Bookings: <strong>{bookings.length}</strong></span>
                </div>
            </div>

            {bookings.length > 0 ? (
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Vehicle</th>
                                <th className={styles.th}>Price</th>
                                <th className={styles.th}>Customer Details</th>
                                <th className={styles.th}>Dealer Details</th>
                                <th className={styles.th}>Requested Date</th>
                                <th className={styles.th} style={{ textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ 
                                                width: '80px', 
                                                height: '50px', 
                                                borderRadius: '12px', 
                                                overflow: 'hidden', 
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <img 
                                                    src={getImageUrl(booking.car_photo)} 
                                                    alt="car" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=120'}
                                                />
                                            </div>
                                            <div>
                                                <span className="d-block fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                                                    {booking.brand} {booking.car_name}
                                                </span>
                                                <span className="small text-muted">Model: {booking.model}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className="fw-bold" style={{ color: '#0f172a' }}>
                                            Rs. {Number(booking.car_price || 0).toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div>
                                            <span className="d-block fw-bold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                                                {booking.first_name} {booking.last_name}
                                            </span>
                                            <span className="d-block small text-muted">{booking.user_email}</span>
                                            {booking.user_mobile && (
                                                <span className="d-block small text-muted">
                                                    <i className="fa-solid fa-phone me-1" style={{ fontSize: '0.75rem' }}></i> {booking.user_mobile}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div>
                                            <span className="d-block fw-bold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                                                {booking.seller_name}
                                            </span>
                                            <span className="d-block small text-muted">{booking.seller_email}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className="small" style={{ color: '#475569' }}>
                                            <i className="fa-regular fa-calendar me-1"></i> {new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'center' }}>
                                        <span className={getStatusStyle(booking.status)}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="col-12 text-center py-5">
                    <p className="fs-5" style={{ color: '#94a3b8' }}>No bookings found in the system.</p>
                </div>
            )}
        </div>
    );
};

export default ViewBookings;
