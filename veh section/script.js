document.addEventListener('DOMContentLoaded', function () {

    const calendarDaysContainer = document.getElementById('calendarDays');
    const calendarMonthSpan = document.querySelector('.calendar-month');
    const calendarNavs = document.querySelectorAll('.calendar-nav');

    const dateInputs = document.querySelectorAll('.date-input input');

    // TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // CURRENT MONTH
    let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // DEFAULT DATES
    let selectedStart = new Date(today);
    selectedStart.setDate(today.getDate() + 1);

    let selectedEnd = new Date(today);
    selectedEnd.setDate(today.getDate() + 2);

    function formatDateForInput(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function generateCalendar() {

        calendarDaysContainer.innerHTML = '';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = [
            'January','February','March','April','May','June',
            'July','August','September','October','November','December'
        ];

        calendarMonthSpan.textContent = `${monthNames[month]} ${year}`;

        // empty cells
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            calendarDaysContainer.appendChild(empty);
        }

        // days
        for (let day = 1; day <= daysInMonth; day++) {

            const dayDate = new Date(year, month, day);
            dayDate.setHours(0, 0, 0, 0);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // ❌ past disable
            if (dayDate < today) {
                dayElement.classList.add('disabled');
            } else {

                if (dayDate.toDateString() === selectedStart.toDateString()) {
                    dayElement.classList.add('selected');
                }
                else if (dayDate.toDateString() === selectedEnd.toDateString()) {
                    dayElement.classList.add('selected');
                }
                else if (dayDate > selectedStart && dayDate < selectedEnd) {
                    dayElement.classList.add('range');
                }

                dayElement.addEventListener('click', () => {
                    selectDate(dayDate);
                });
            }

            calendarDaysContainer.appendChild(dayElement);
        }
    }

    function selectDate(date) {

        if (date <= selectedStart) {
            selectedStart = date;

            selectedEnd = new Date(date);
            selectedEnd.setDate(selectedStart.getDate() + 1);
        } else {
            selectedEnd = date;
        }

        updateInputs();
        generateCalendar();
    }

    function updateInputs() {

        dateInputs[0].value = formatDateForInput(selectedStart);
        dateInputs[1].value = formatDateForInput(selectedEnd);

        updatePricing();
    }

    function updatePricing() {

        const days = Math.ceil((selectedEnd - selectedStart) / (1000 * 60 * 60 * 24));

        const price = 2449;

        const subtotal = days * price;

        const total = subtotal + 800 + 485;

        const items = document.querySelectorAll('.breakdown-item');

        if (items.length >= 4) {

            items[0].innerHTML = `
                <span>${days} days x Rs. ${price}</span>
                <span>Rs. ${subtotal}</span>
            `;

            items[3].innerHTML = `
                <span>TOTAL</span>
                <span>Rs. ${total}</span>
            `;
        }
    }

    // MONTH NAV
    calendarNavs[0].addEventListener('click', () => {

        const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return;

        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar();
    });

    calendarNavs[1].addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar();
    });

    // INPUT CHANGE → SYNC CALENDAR
    dateInputs[0].addEventListener('change', (e) => {

        const d = new Date(e.target.value);

        if (d >= today) {
            selectedStart = d;
            currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
            generateCalendar();
        }
    });

    dateInputs[1].addEventListener('change', (e) => {

        const d = new Date(e.target.value);

        if (d > selectedStart) {
            selectedEnd = d;
            currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
            generateCalendar();
        }
    });

    // INIT
    generateCalendar();
    updateInputs();

});