(function () {
  const routes = {
    home: '/',
    rent: '/vehicleListing.html',
    vehicles: '/vehicleListing.html',
    vehicle: '/vehicleListing.html',
    list: '/vehicleListing.html',
    booking: '/dashboard_customer.html',
    bookings: '/dashboard_customer.html',
    'my bookings': '/dashboard_customer.html',
    dashboard: '/dashboard_customer.html',
    payments: '/payment.html',
    payment: '/payment.html',
    login: '/login.html',
    signup: '/signup.html',
    'sign up': '/signup.html',
    support: '/dashboard_customer.html',
    settings: '/dashboard_customer.html',
    profile: '/iddentity_hub.html',
    account: '/iddentity_hub.html',
  };

  function normalize(text) {
    return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function go(path) {
    if (!path) return;
    window.location.href = path;
  }

  function routeForElement(el) {
    const text = normalize(el.textContent || el.getAttribute('aria-label'));
    if (text.includes('logout')) return 'logout';
    if (text.includes('my bookings')) return routes['my bookings'];
    if (text.includes('sign up') || text.includes('signup')) return routes.signup;
    if (text.includes('login')) return routes.login;
    if (text.includes('payment')) return routes.payment;
    if (text.includes('booking')) return routes.bookings;
    if (text.includes('rental history') || text.includes('favorite')) return routes.dashboard;
    if (text.includes('account') || text.includes('profile') || text.includes('identity')) return routes.profile;
    if (text.includes('vehicle') || text.includes('rent') || text.includes('list') || text.includes('browse luxury') || text.includes('browse collection')) return routes.vehicles;
    if (text.includes('dashboard')) return routes.dashboard;
    if (text.includes('home')) return routes.home;
    if (text.includes('support') || text.includes('help')) return routes.support;
    if (text.includes('setting')) return routes.settings;
    return null;
  }

  function enhanceLinks() {
    document.querySelectorAll('a, button').forEach(el => {
      if (el.dataset.vroomBound === 'true') return;
      if (el.matches('.confirm-btn, .btn-complete, .btn-book, .reserve-btn')) return;
      if (el.hasAttribute('onclick')) return;

      const existingHref = el.getAttribute('href');
      const route = routeForElement(el);
      const isPlaceholder = !existingHref || existingHref === '#';

      if (!route || !isPlaceholder) return;

      el.dataset.vroomBound = 'true';

      if (el.tagName === 'A' && route !== 'logout') {
        el.setAttribute('href', route);
      }

      el.addEventListener('click', event => {
        if (route === 'logout') {
          event.preventDefault();
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          go(routes.login);
          return;
        }

        event.preventDefault();
        go(route);
      });
    });
  }

  function enhanceAuthButtons() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user?.name) {
      document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = user.name;
      });

      document.querySelectorAll('.user-avatar, .avatar').forEach(el => {
        el.textContent = user.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
      });
    }

    if (!token) return;

    document.querySelectorAll('.btn-login').forEach(button => {
      button.textContent = 'Dashboard';
      button.addEventListener('click', event => {
        event.preventDefault();
        go(routes.dashboard);
      });
    });

    document.querySelectorAll('.btn-signup').forEach(button => {
      button.textContent = 'Logout';
      button.addEventListener('click', event => {
        event.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        go(routes.login);
      });
    });
  }

  function enhanceLogoLinks() {
    document.querySelectorAll('.logo, .nav-logo, .topnav-logo, .logo-wrap, .sidebar-logo').forEach(el => {
      if (el.dataset.vroomLogoBound === 'true') return;

      el.dataset.vroomLogoBound = 'true';
      el.style.cursor = 'pointer';

      if (el.tagName === 'A') {
        el.setAttribute('href', routes.home);
        return;
      }

      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');

      el.addEventListener('click', () => go(routes.home));
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          go(routes.home);
        }
      });
    });
  }

  async function hydrateCustomerDashboard() {
    if (!location.pathname.toLowerCase().endsWith('/dashboard_customer.html')) return;

    const localBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
    const token = localStorage.getItem('token');
    let backendBookings = [];

    if (token) {
      try {
        const res = await fetch('/api/bookings/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) backendBookings = data.bookings || [];
      } catch (error) {
      }
    }

    try {
      const bookings = [...localBookings, ...backendBookings];
      const active = bookings.filter(item => !['cancelled', 'completed'].includes(item.status)).length;
      const total = bookings.length;
      const spent = bookings.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

      const statValues = document.querySelectorAll('.stat-value');
      if (statValues[0]) statValues[0].textContent = active;
      if (statValues[1]) statValues[1].textContent = total;
      if (statValues[2]) statValues[2].textContent = `Rs. ${spent.toLocaleString('en-IN')}`;

      const tbody = document.getElementById('activityBody');
      if (!tbody || bookings.length === 0) return;

      tbody.innerHTML = bookings.map(booking => `
        <tr>
          <td class="vehicle-name">${booking.car_name || 'Vehicle'}</td>
          <td>${String(booking.start_date).slice(0, 10)} - ${String(booking.end_date).slice(0, 10)}</td>
          <td class="cost">Rs. ${Number(booking.total_price || 0).toLocaleString('en-IN')}</td>
          <td>-</td>
          <td><span class="badge ${booking.status === 'cancelled' ? 'badge-red' : booking.status === 'confirmed' ? 'badge-green' : 'badge-orange'}">${booking.status}</span></td>
          <td><div class="action-btns"><div class="action-btn" onclick="viewTrip('${booking.car_name || 'Vehicle'}')">View</div></div></td>
        </tr>
      `).join('');
    } catch (error) {
    }
  }

  function downloadTextFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function saveLocalBooking(booking) {
    const nextBooking = {
      id: booking.id || `local-${Date.now()}`,
      car_name: booking.car_name || booking.name || 'Selected Vehicle',
      start_date: booking.start_date || new Date().toISOString().slice(0, 10),
      end_date: booking.end_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      total_price: Number(booking.total_price || booking.price || 0),
      status: booking.status || 'pending',
      payment_status: booking.payment_status || 'pending',
      local: true,
      vehicle: booking.vehicle || null,
    };

    const bookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
    localStorage.setItem(
      'localBookings',
      JSON.stringify([nextBooking, ...bookings.filter(item => String(item.id) !== String(nextBooking.id))])
    );
    localStorage.setItem('currentBooking', JSON.stringify(nextBooking));
    return nextBooking;
  }

  function getBookings() {
    return JSON.parse(localStorage.getItem('localBookings') || '[]');
  }

  function enhanceVehicleDetailBundle() {
    if (!location.pathname.toLowerCase().includes('/veh%20section/') && !location.pathname.toLowerCase().includes('/veh section/')) return;

    document.querySelectorAll('.reserve-btn').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        go('/vehicles.html');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    enhanceLinks();
    enhanceLogoLinks();
    enhanceAuthButtons();
    hydrateCustomerDashboard();
    enhanceVehicleDetailBundle();
  });

  window.VroomApp = {
    routes,
    go,
    saveLocalBooking,
    getBookings,
    downloadTextFile,
  };
})();
