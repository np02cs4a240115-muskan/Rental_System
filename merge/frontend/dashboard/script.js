// Sidebar Toggle Functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

// Initialize sidebar state
let isSidebarCollapsed = false;

// Toggle sidebar on button click
sidebarToggle.addEventListener('click', function() {
    isSidebarCollapsed = !isSidebarCollapsed;
    
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
    } else {
        sidebar.classList.remove('collapsed');
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
    }
    
    // Store state in localStorage
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
});

// Restore sidebar state from localStorage
window.addEventListener('DOMContentLoaded', function() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        isSidebarCollapsed = true;
        sidebar.classList.add('collapsed');
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
    }
});

// Active nav item
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') return;
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// Request action buttons
const acceptBtns = document.querySelectorAll('.request-action.accept');
const rejectBtns = document.querySelectorAll('.request-action.reject');

acceptBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const requestItem = this.closest('.request-item');
        showNotification('Request Accepted!', 'success');
        // Optional: animate removal
        setTimeout(() => {
            requestItem.style.opacity = '0.5';
        }, 300);
    });
});

rejectBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const requestItem = this.closest('.request-item');
        showNotification('Request Declined!', 'error');
        // Optional: animate removal
        setTimeout(() => {
            requestItem.style.opacity = '0.5';
        }, 300);
    });
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles dynamically
    const style = document.createElement('style');
    if (!document.getElementById('notification-styles')) {
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                max-width: 400px;
            }

            .notification-success {
                background-color: #DCFCE7;
                color: #166534;
                border: 1px solid #22C55E;
            }

            .notification-error {
                background-color: #FEE2E2;
                color: #991B1B;
                border: 1px solid #EF4444;
            }

            .notification-info {
                background-color: #DBEAFE;
                color: #1E40AF;
                border: 1px solid #3B82F6;
            }

            .notification i {
                font-size: 18px;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Smooth scroll for links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Chart animation on load
const barChart = document.querySelector('.bar-chart');
if (barChart) {
    const bars = barChart.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        const originalHeight = bar.getAttribute('height');
        bar.setAttribute('height', '0');
        
        setTimeout(() => {
            bar.style.transition = 'all 0.6s ease';
            bar.setAttribute('height', originalHeight);
        }, index * 100);
    });
}

// Filter button interactions
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        // Remove active class from siblings
        this.parentElement.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        // Add active class to clicked button
        this.classList.add('active');
    });
});

// Hover effects on vehicle cards
const vehicleCards = document.querySelectorAll('.vehicle-card');
vehicleCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });
    
    card.addEventListener('click', function() {
        showNotification(`Vehicle selected!`, 'info');
    });
});

// Header notification badge animation
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('3 new booking requests!', 'info');
    });
}

// Prevent default link behaviors
document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
    });
});

// Mobile menu toggle (if needed)
function handleMobileMenu() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('mobile-open');
    }
}

// Window resize listener
window.addEventListener('resize', function() {
    handleMobileMenu();
});

// Initialize on load
handleMobileMenu();

// Add smooth transitions to all elements
const addSmoothTransitions = () => {
    const style = document.createElement('style');
    style.textContent = `
        * {
            scroll-behavior: smooth;
        }
        
        body {
            transition: background-color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
};

addSmoothTransitions();

// Handle view all requests click
const viewAllRequests = document.querySelector('.view-all');
if (viewAllRequests) {
    viewAllRequests.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Loading all booking requests...', 'info');
    });
}

// Handle manage vehicle clicks
const manageLinks = document.querySelectorAll('.manage-link, .live-track, .view-logs');
manageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const vehicleTitle = this.closest('.vehicle-info').querySelector('h3').textContent;
        showNotification(`${vehicleTitle} management opened!`, 'info');
    });
});

// Initialize tooltips on hover
const initTooltips = () => {
    const elements = document.querySelectorAll('[title]');
    elements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('title');
            tooltip.style.cssText = `
                position: absolute;
                background-color: #1F2937;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
            
            this.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
        });
    });
};

initTooltips();

// Console log for debugging (optional)
function money(value) {
    return `Rs. ${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function initials(name) {
    return (name || 'John Doe')
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'JD';
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
        return null;
    }
}

function getLocalBookings() {
    try {
        return JSON.parse(localStorage.getItem('localBookings') || '[]');
    } catch (error) {
        return [];
    }
}

async function getBackendBookings() {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const response = await fetch('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || !data.success) return [];
    return data.bookings || [];
}

function normalizeBooking(booking) {
    return {
        id: booking.id,
        carName: booking.car_name || booking.vehicle?.name || 'Selected Vehicle',
        customer: booking.user_name || getStoredUser()?.name || 'Customer',
        startDate: String(booking.start_date || '').slice(0, 10),
        endDate: String(booking.end_date || '').slice(0, 10),
        status: String(booking.status || 'pending').toLowerCase(),
        total: Number(booking.total_price || booking.price || 0),
    };
}

function renderBookings(bookings) {
    const normalized = bookings.map(normalizeBooking);
    const activeBookings = normalized.filter(booking => !['cancelled', 'completed'].includes(booking.status));
    const totalRevenue = normalized.reduce((sum, booking) => sum + booking.total, 0);

    const values = document.querySelectorAll('.card-value');
    if (values[0]) values[0].textContent = money(totalRevenue);
    if (values[1]) values[1].textContent = money(totalRevenue);

    const growth = document.querySelector('.growth-badge');
    if (growth) growth.textContent = `${activeBookings.length} Active`;

    const requests = document.querySelector('.requests-container');
    if (!requests) return;

    const title = requests.querySelector('h2');
    requests.innerHTML = '';
    if (title) requests.appendChild(title);

    const requestItems = activeBookings.slice(0, 4);
    if (requestItems.length === 0) {
        requests.insertAdjacentHTML('beforeend', `
            <div class="request-item">
                <div class="request-avatar">VN</div>
                <div class="request-info">
                    <div class="request-name">No active<br>requests</div>
                    <div class="request-details">Bookings will appear<br>here automatically</div>
                </div>
            </div>
        `);
    } else {
        requests.insertAdjacentHTML('beforeend', requestItems.map(booking => `
            <div class="request-item">
                <div class="request-avatar">${initials(booking.customer)}</div>
                <div class="request-info">
                    <div class="request-name">${booking.customer.replace(/\s+/, '<br>')}</div>
                    <div class="request-details">${booking.carName}<br>${booking.startDate || 'Upcoming'}</div>
                </div>
                <button class="request-action accept" type="button" data-booking-id="${booking.id || ''}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="request-action reject" type="button" data-booking-id="${booking.id || ''}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join(''));
    }

    requests.insertAdjacentHTML('beforeend', '<a href="/dashboard_customer.html" class="view-all">View All Requests <i class="fas fa-arrow-right"></i></a>');
}

async function loadFleet() {
    try {
        const response = await fetch('/api/cars');
        const data = await response.json();
        const cars = Array.isArray(data) ? data : data.cars || [];
        if (cars.length === 0) return;

        const fleetCount = document.querySelector('.fleet-count');
        if (fleetCount) fleetCount.textContent = cars.length;

        const available = cars.filter(car => car.availability !== false).length;
        const availableButton = document.querySelector('.fleet-filters .available');
        const rentedButton = document.querySelector('.fleet-filters .rented');
        if (availableButton) availableButton.textContent = `Available (${available})`;
        if (rentedButton) rentedButton.textContent = `Rented (${Math.max(cars.length - available, 0)})`;

        const grid = document.querySelector('.vehicle-grid');
        if (!grid) return;

        grid.innerHTML = cars.slice(0, 6).map(car => `
            <div class="vehicle-card">
                <div class="vehicle-status ${car.availability === false ? 'rented' : 'available'}">${car.availability === false ? 'RENTED' : 'AVAILABLE'}</div>
                <img src="${car.image || '/dashboard/OIP.jpg'}" alt="${car.name || 'Vehicle'}">
                <div class="vehicle-info">
                    <h3>${car.name || 'Vehicle'}</h3>
                    <p class="price">Rs.${Number(car.price_per_day || 0).toLocaleString('en-IN')} <span>day</span></p>
                    <div class="vehicle-specs">
                        <span><i class="fas fa-cog"></i> ${car.brand || 'Vehicle'}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${car.model || car.year || 'Ready'}</span>
                    </div>
                    <a href="/vehicles.html?car_id=${encodeURIComponent(car.id)}" class="manage-link">Manage Vehicle</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
    }
}

async function hydrateDashboard() {
    const user = getStoredUser();
    if (user?.name) {
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = user.name;
        });
        document.querySelectorAll('.user-avatar, .avatar').forEach(el => {
            el.textContent = initials(user.name);
        });
    }

    try {
        const bookings = [...getLocalBookings(), ...(await getBackendBookings())];
        renderBookings(bookings);
    } catch (error) {
        renderBookings(getLocalBookings());
    }

    await loadFleet();
}

document.addEventListener('click', event => {
    const logout = event.target.closest('.logout');
    if (logout) {
        event.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        return;
    }

    const action = event.target.closest('.request-action');
    if (action) {
        event.preventDefault();
        const item = action.closest('.request-item');
        if (item) item.style.opacity = '0.5';
        showNotification(action.classList.contains('accept') ? 'Request Accepted!' : 'Request Declined!', action.classList.contains('accept') ? 'success' : 'error');
    }
});

document.addEventListener('DOMContentLoaded', hydrateDashboard);
