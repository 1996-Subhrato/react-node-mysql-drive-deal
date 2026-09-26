import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        sellers: 0,
        categories: 0,
        purchaseRequests: 0,
        users: 0,
        cars: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [recentSellers, setRecentSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAnimated, setIsAnimated] = useState(false);
    const [systemTime, setSystemTime] = useState('');

    useEffect(() => {
        // Update local system clock in header
        const updateClock = () => {
            const now = new Date();
            setSystemTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' | ' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
        };
        updateClock();
        const clockInterval = setInterval(updateClock, 1000);

        const fetchAllDashboardData = async () => {
            try {
                // Fetch stats, recent sellers and recent purchase requests concurrently
                const [statsRes, sellersRes, requestsRes] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getSellers({ limit: 5 }),
                    adminService.getPurchaseRequests({ limit: 5 })
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
                if (sellersRes.data.success) {
                    setRecentSellers(sellersRes.data.data.slice(0, 4));
                }
                if (requestsRes.data.success) {
                    setRecentRequests(requestsRes.data.data.slice(0, 4));
                }

                // Trigger animations
                setTimeout(() => {
                    setIsAnimated(true);
                }, 100);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDashboardData();

        return () => clearInterval(clockInterval);
    }, []);

    const cards = [
        {
            title: 'Marketplace Sellers',
            value: stats.sellers,
            icon: 'fas fa-users-cog',
            colorClass: styles.iconYellow,
            barColor: '#fbbf24',
            trend: '+12.4% vs last week',
            desc: 'Awaiting KYC: ' + (recentSellers.filter(s => s.status === 'Inactive').length)
        },
        {
            title: 'Registered Users',
            value: stats.users,
            icon: 'fas fa-users',
            colorClass: styles.iconTeal,
            barColor: '#0d9488',
            trend: '+8.3% vs last week',
            desc: 'Active buying accounts'
        },
        {
            title: 'Car Listings',
            value: stats.cars,
            icon: 'fas fa-car',
            colorClass: styles.iconIndigo,
            barColor: '#6366f1',
            trend: '+15.1% vs last week',
            desc: 'Total active & sold cars'
        },
        {
            title: 'Vehicle Categories',
            value: stats.categories,
            icon: 'fas fa-tags',
            colorClass: styles.iconOrange,
            barColor: '#f97316',
            trend: 'Stable',
            desc: 'Active vehicle segments'
        },
        {
            title: 'Purchase Requests',
            value: stats.purchaseRequests,
            icon: 'fas fa-hand-holding-usd',
            colorClass: styles.iconRed,
            barColor: '#f43f5e',
            trend: '+24.5% vs last month',
            desc: 'Completed sales: ' + (recentRequests.filter(r => r.status === 'Sold').length)
        }
    ];

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className={styles.premiumSpinnerWrapper}>
                <div className={styles.spinnerCore}></div>
                <p className={styles.spinnerLabel}>Securing Control Center Connection...</p>
            </div>
        </div>
    );

    return (
        <div className={styles.dashboard}>
            {/* Command Header Banner */}
            <div className={styles.dashboardHeader}>
                <div className={styles.headerWelcome}>
                    <span className={styles.badgeControl}>SYSTEM COMMAND CENTER</span>
                    <h1 className={styles.welcomeTitle}>Administrative Console</h1>
                    <p className={styles.welcomeText}>Real-time system telemetry and transaction monitoring logs.</p>
                </div>
                <div className={styles.headerTimebox}>
                    <div className={styles.timeLabel}>CURRENT SYSTEM TIMESTAMP</div>
                    <div className={styles.timeValue}>{systemTime}</div>
                    <div className={styles.healthUptime}>
                        <span className={styles.pingDot}></span>
                        <span>API Core Gateway: Online (99.98% Uptime)</span>
                    </div>
                </div>
            </div>

            {/* Statistics Dashboard Cards Grid */}
            <div className={styles.statsGrid}>
                {cards.map((card, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.cardHeaderArea}>
                            <div className={`${styles.statIcon} ${card.colorClass}`}>
                                <i className={card.icon}></i>
                            </div>
                            {/* <span className={styles.cardTrend}>{card.trend}</span> */}
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>{card.title}</span>
                            {" "}
                            <span className={`${styles.statValue} text-success`}>{card.value}</span>
                            {/* <span className={styles.cardSubtext}>{card.desc}</span> */}
                        </div>
                        <div className={styles.cardGlowBorder} style={{ background: card.barColor }}></div>
                    </div>
                ))}
            </div>

            {/* Visual Analytics and Charts Dashboard */}
            <div className={styles.analyticsSection}>
                {/* Visual Statistics Bars Chart */}
                <div className={styles.chartPanel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>System Ratio Index</h3>
                        <p className={styles.panelSubtitle}>Relative ratio mapping across platform models</p>
                    </div>
                    <div className={styles.chartContainer}>
                        {cards.map((card, index) => {
                            const maxVal = Math.max(...cards.map(c => c.value)) || 1;
                            const percentage = (card.value / maxVal) * 100;
                            return (
                                <div key={index} className={styles.barWrapper}>
                                    <div className={styles.barColumnOuter}>
                                        <div 
                                            className={styles.barColumnInner}
                                            style={{ 
                                                height: isAnimated ? `${percentage}%` : '0%',
                                                backgroundColor: card.barColor
                                            }}
                                            title={`${card.title}: ${card.value}`}
                                        >
                                            <span className={styles.barValueTooltip}>{card.value}</span>
                                        </div>
                                    </div>
                                    <span className={styles.barLabel}>{card.title.split(' ')[1]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Platform Target listings indicator (Radial Donut Gauge) */}
                {/* <div className={styles.donutPanel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Listing Target</h3>
                        <p className={styles.panelSubtitle}>Active cars progress toward target capacity</p>
                    </div>
                    <div className={styles.donutGaugeArea}>
                        <svg className={styles.radialGauge} viewBox="0 0 100 100">
                            <circle className={styles.radialBg} cx="50" cy="50" r="40" />
                            <circle
                                className={styles.radialProgress}
                                cx="50"
                                cy="50"
                                r="40"
                                style={{
                                    strokeDasharray: '251.2',
                                    strokeDashoffset: isAnimated ? `${251.2 - (251.2 * 0.74)}` : '251.2',
                                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                            <text className={styles.gaugeText} x="50" y="50" dominantBaseline="middle" textAnchor="middle">74%</text>
                        </svg>
                        <div className={styles.gaugeLegend}>
                            <div className={styles.legendTitle}>MONTHLY TARGET: 100 Listings</div>
                            <div className={styles.legendDesc}>74 Listings Active | 26 Slots Available</div>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Platform Health Monitor & Admin Action shortcuts */}
            <div className={styles.healthActionGrid}>
                {/* Platform Uptime & Server Telemetry */}
                <div className={styles.telemetryCard}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Platform Telemetry & Gateway</h3>
                        <p className={styles.panelSubtitle}>Real-time simulation logs for web server node hosts</p>
                    </div>
                    <div className={styles.telemetryRows}>
                        <div className={styles.telemetryRow}>
                            <span className={styles.telemetryName}>API Node Router</span>
                            <span className={styles.telemetryStatus}><span className={styles.statusDotGreen}></span>Online</span>
                        </div>
                        <div className={styles.telemetryRow}>
                            <span className={styles.telemetryName}>Database Connection Pool</span>
                            <span className={styles.telemetryStatus}><span className={styles.statusDotGreen}></span>12ms (Good)</span>
                        </div>
                        <div className={styles.telemetryRow}>
                            <span className={styles.telemetryName}>Transactional Mail Gateway</span>
                            <span className={styles.telemetryStatus}><span className={styles.statusDotGreen}></span>Online</span>
                        </div>
                        <div className={styles.telemetryRow}>
                            <span className={styles.telemetryName}>File Storage Upload Node</span>
                            <span className={styles.telemetryStatus}><span className={styles.statusDotYellow}></span>68% Used</span>
                        </div>
                    </div>
                </div>

                {/* Admin Quick Action Shortcuts */}
                <div className={styles.actionsCard}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Console Action Shortcuts</h3>
                        <p className={styles.panelSubtitle}>Direct shortcuts to control center workspaces</p>
                    </div>
                    <div className={styles.actionsGrid}>
                        <Link to="/admin/manage_sellers" className={styles.actionBox}>
                            <div className={`${styles.actionIcon} ${styles.actionBgYellow}`}>
                                <i className="fas fa-users-cog"></i>
                            </div>
                            <span className={styles.actionLabel}>Verify KYC Sellers</span>
                        </Link>
                        <Link to="/admin/manage_categories" className={styles.actionBox}>
                            <div className={`${styles.actionIcon} ${styles.actionBgOrange}`}>
                                <i className="fas fa-tags"></i>
                            </div>
                            <span className={styles.actionLabel}>Manage Categories</span>
                        </Link>
                        <Link to="/admin/view_purchase_requests" className={styles.actionBox}>
                            <div className={`${styles.actionIcon} ${styles.actionBgRed}`}>
                                <i className="fas fa-hand-holding-usd"></i>
                            </div>
                            <span className={styles.actionLabel}>Audit Purchase logs</span>
                        </Link>
                        <Link to="/admin/change_password" className={styles.actionBox}>
                            <div className={`${styles.actionIcon} ${styles.actionBgIndigo}`}>
                                <i className="fas fa-lock"></i>
                            </div>
                            <span className={styles.actionLabel}>Change Credentials</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Platform Dynamic Logs tables */}
            <div className={styles.logsSectionGrid}>
                {/* Recent Booking Transactions Table */}
                <div className={styles.tablePanel}>
                    <div className={styles.tablePanelHeader}>
                        <div>
                            <h3 className={styles.panelTitle}>Recent Booking Transactions</h3>
                            <p className={styles.panelSubtitle}>Recent buyer vehicle booking requests from database</p>
                        </div>
                        <Link to="/admin/view_purchase_requests" className={styles.btnViewAll}>View Audit Logs</Link>
                    </div>
                    <div className={styles.tableContainer}>
                        {recentRequests.length === 0 ? (
                            <div className={styles.emptyLogState}>No transaction logs found in database.</div>
                        ) : (
                            <table className={styles.premiumTable}>
                                <thead>
                                    <tr>
                                        <th>Buyer Name</th>
                                        <th>Vehicle Listed</th>
                                        <th>Seller</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRequests.map((req) => (
                                        <tr key={req.id}>
                                            <td className={styles.primaryCell}>{req.first_name} {req.last_name}</td>
                                            <td>{req.brand} {req.car_name}</td>
                                            <td>{req.seller_name}</td>
                                            <td className={styles.priceCell}>₹{parseFloat(req.car_price).toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`${styles.badgeStatus} ${req.status === 'Sold' ? styles.badgeGreen :
                                                    req.status === 'Approved' ? styles.badgeBlue :
                                                        styles.badgeYellow
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sellers KYC Inbox Table */}
                <div className={styles.tablePanel}>
                    <div className={styles.tablePanelHeader}>
                        <div>
                            <h3 className={styles.panelTitle}>Sellers KYC Verification Inbox</h3>
                            <p className={styles.panelSubtitle}>Recently registered sellers requesting validation</p>
                        </div>
                        <Link to="/admin/manage_sellers" className={styles.btnViewAll}>Open KYC Queue</Link>
                    </div>
                    <div className={styles.tableContainer}>
                        {recentSellers.length === 0 ? (
                            <div className={styles.emptyLogState}>No seller registration logs found in database.</div>
                        ) : (
                            <table className={styles.premiumTable}>
                                <thead>
                                    <tr>
                                        <th>Seller Details</th>
                                        <th>Contact</th>
                                        <th>City Location</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSellers.map((seller) => (
                                        <tr key={seller.id}>
                                            <td>
                                                <div className={styles.sellerCellWrapper}>
                                                    {seller.photo ? (
                                                        <img src={`http://localhost:5000${seller.photo}`} alt={seller.name} className={styles.avatarImg} onError={(e) => { e.target.src = '/assets/img/default-avatar.png' }} />
                                                    ) : (
                                                        <div className={styles.avatarPlaceholder}><i className="fas fa-user"></i></div>
                                                    )}
                                                    <div>
                                                        <div className={styles.primaryCell}>{seller.name}</div>
                                                        <div className={styles.cellSubtitle}>{seller.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{seller.mobile}</td>
                                            <td>{seller.city}</td>
                                            <td>
                                                <span className={`${styles.badgeStatus} ${seller.status === 'Active' ? styles.badgeGreen : styles.badgeRed
                                                    }`}>
                                                    {seller.status === 'Active' ? 'Active' : 'Awaiting KYC'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
