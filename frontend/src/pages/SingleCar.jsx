import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import carService from '../services/carService';
import { toast } from 'react-hot-toast';
import styles from './SingleCar.module.css';

const SingleCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Purchase Request States
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isRequested, setIsRequested] = useState(false);

    const getImageUrl = (photo) => {
        if (!photo) return '/assets/img/cars/car_placeholder.png';
        if (photo.startsWith('http')) return photo;
        const cleanPath = photo.startsWith('/') ? photo : `/uploads/${photo}`;
        return `http://localhost:5000${cleanPath}`;
    };

    const fetchCar = useCallback(async () => {
        try {
            setLoading(true);
            const response = await carService.getSingleCar(id);
            if (response.data.success) {
                setCar(response.data.data);
            } else {
                setError('Vehicle not found');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch car details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const checkRequestStatus = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await carService.checkPurchaseRequest(id);
            if (response.data.success) {
                setIsRequested(response.data.requested);
            }
        } catch (error) {
            console.error("Failed to check request status:", error);
        }
    }, [id, isAuthenticated]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCar();
        checkRequestStatus();
    }, [fetchCar, checkRequestStatus]);

    const handleOpenRequest = () => {
        if (!isAuthenticated) {
            toast.error("Please login to send a purchase request");
            navigate('/user/login', { state: { from: `/single_car/${id}` } });
            return;
        }

        if (isRequested) {
            toast.error("You have already sent a purchase request for this vehicle");
            return;
        }

        setShowRequestModal(true);
    };

    const submitPurchaseRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const loadingToast = toast.loading('Sending your request to seller...');
        try {
            const requestData = {
                car: car.id,
                seller: car.seller?.id || car.seller
            };

            const res = await carService.addPurchaseRequest(requestData);
            if (res.data.success) {
                toast.success("Purchase request sent successfully!", { id: loadingToast });
                setShowRequestModal(false);
                navigate('/user/mypurchase_requests');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request", { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p>Gathering specifications...</p>
        </div>
    );

    if (error) return (
        <div className={styles.errorWrapper}>
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/cars')} className={styles.backBtn}>Browse Other Cars</button>
        </div>
    );

    if (!car) return null;

    const specs = [
        { label: 'Year/Model', value: car.model, icon: 'fa-calendar-alt' },
        { label: 'Fuel Type', value: car.fuelType, icon: 'fa-gas-pump' },
        { label: 'Transmission', value: car.transmissionType, icon: 'fa-cog' },
        { label: 'Engine', value: `${car.engineCapacity} cc`, icon: 'fa-microchip' },
        { label: 'Kilometers', value: `${new Intl.NumberFormat('en-IN').format(car.kmDriven || 0)} km`, icon: 'fa-road' },
        { label: 'Mileage', value: `${car.mileage} km/l`, icon: 'fa-tachometer-alt' },
        { label: 'Owners', value: car.ownerType, icon: 'fa-user-friends' },
        { label: 'Category', value: car.category?.name || 'Standard', icon: 'fa-tag' },
        { label: 'Mfg. Year', value: car.manufacturingYear, icon: 'fa-industry' },
        { label: 'Color', value: car.color, icon: 'fa-palette' },
        { label: 'Reg. Number', value: car.registrationNumber, icon: 'fa-id-card' },
        { label: 'Insurance', value: car.insuranceValidity, icon: 'fa-shield-alt' },
        { label: 'Location', value: car.location, icon: 'fa-map-marker-alt' },
        { label: 'Chassis No.', value: car.chassisNumber, icon: 'fa-fingerprint' },
        { label: 'Accidents', value: car.accidentalHistory || 'No', icon: 'fa-car-crash' },
    ];

    return (
        <div className={styles.pageContainer}>
            {/* 1. Premium Hero Header */}
            <header className={styles.heroSection}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <nav className={styles.breadcrumb}>
                            <Link to="/">Home</Link>
                            <i className="fas fa-chevron-right"></i>
                            <Link to="/cars">Showroom</Link>
                            <i className="fas fa-chevron-right"></i>
                            <span>{car.name}</span>
                        </nav>
                        <span className={styles.badge}>{car.category?.name || 'Exclusive Selection'}</span>
                        <h1 className={styles.heroTitle}>
                            {car.brand} <span className={styles.gradientText}>{car.name}</span>
                        </h1>
                        <p className={styles.heroDesc}>
                            Experience unparalleled performance and style. This {car.model} {car.brand} {car.name} is meticulously inspected and ready for its next journey.
                        </p>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                {/* 2. Left Column: Media & Specifications */}
                <div className={styles.visualColumn}>
                    <div className={styles.imageGallery}>
                        <img src={getImageUrl(car.photo)} alt={car.name} className={styles.mainImage} />
                        <div className={styles.statusOverlay}>
                            <i className="fas fa-circle me-2" style={{ color: car.status === 'Available' ? '#10b981' : '#ef4444', fontSize: '8px' }}></i>
                            {car.status}
                        </div>
                    </div>

                    <section className={styles.detailsSection}>
                        <div className={styles.sectionHeader}>
                            <i className="fas fa-microchip"></i>
                            <h2>Technical Specifications</h2>
                        </div>
                        <div className={styles.specsGrid}>
                            {specs.map((spec, index) => (
                                <div key={index} className={styles.specTile}>
                                    <span className={styles.tileLabel}>{spec.label}</span>
                                    <div className={styles.tileValueWrap}>
                                        <div className={styles.tileIcon}>
                                            <i className={`fas ${spec.icon}`}></i>
                                        </div>
                                        <span className={styles.tileValue}>{spec.value || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.detailsSection}>
                        <div className={styles.sectionHeader}>
                            <i className="fas fa-info-circle"></i>
                            <h2>Additional Insights</h2>
                        </div>
                        <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                            This vehicle features a robust {car.engineCapacity}cc engine with {car.transmissionType} transmission,
                            delivering a smooth and efficient driving experience. With only {car.ownerType} history and
                            a verified mileage of {car.mileage} km/l, it stands as a testament to quality maintenance.
                            Located in {car.location}, it is available for immediate inspection.
                        </p>
                    </section>
                </div>

                {/* 3. Right Column: Sticky Pricing & Seller */}
                <aside className={styles.ctaColumn}>
                    <div className={styles.ctaCard}>
                        <div className={styles.priceSection}>
                            <span className={styles.priceLabel}>Reserve Price</span>
                            <div className={styles.priceValue}>₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(car.price || 0)}</div>
                        </div>

                        <div className={styles.ctaActions}>
                            <button
                                className={`${styles.mainBookBtn} ${isRequested ? styles.requestedBtn : ''}`}
                                onClick={handleOpenRequest}
                                disabled={car.status === 'Sold' || isRequested}
                            >
                                <i className={isRequested ? "fas fa-check-circle" : "fas fa-bolt"}></i>
                                {car.status === 'Sold' ? 'Vehicle Sold' : isRequested ? 'Interest Sent' : 'Express Interest'}
                            </button>
                            <div className={styles.secureListing}>
                                <i className="fas fa-shield-check"></i>
                                Verified Drive Deal Listing
                            </div>
                        </div>
                    </div>

                    <div className={styles.sellerCard}>
                        <div className={styles.sellerHeader}>
                            <div className={styles.sellerAvatar}>
                                {car.seller?.name?.[0] || 'S'}
                            </div>
                            <div className={styles.sellerMeta}>
                                <h4>{car.seller?.name}</h4>
                                <span>Verified Partner</span>
                            </div>
                        </div>
                        <div className={styles.sellerContact}>
                            <div className={styles.contactItem}>
                                <i className="fas fa-envelope"></i>
                                {car.seller?.email}
                            </div>
                            <div className={styles.contactItem}>
                                <i className="fas fa-phone"></i>
                                {car.seller?.mobile}
                            </div>
                            <div className={styles.contactItem}>
                                <i className="fas fa-map-marker-alt"></i>
                                {car.seller?.city}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Purchase Request Modal */}
            {showRequestModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleArea}>
                                <h3>Express Interest</h3>
                                <p>{car.brand} {car.name}</p>
                            </div>
                            <button className={styles.closeModal} onClick={() => setShowRequestModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={submitPurchaseRequest} className={styles.bookingForm}>
                            <div className={styles.modalBody}>
                                <p className="text-muted mb-4 small">
                                    Send a formal inquiry to the seller. Your contact details will be shared securely to facilitate the transaction.
                                </p>
                                <div className={styles.invoiceSummary}>
                                    <div className={styles.invoiceRow}>
                                        <span>Listing Price</span>
                                        <span>₹{new Intl.NumberFormat('en-IN').format(car.price || 0)}</span>
                                    </div>
                                    <div className={styles.invoiceTotal}>
                                        <span>Total Reserve</span>
                                        <span>₹{new Intl.NumberFormat('en-IN').format(car.price || 0)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="submit" className={styles.finalizeBtn} disabled={submitting}>
                                    {submitting ? 'Processing...' : 'Confirm Inquiry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleCar;
