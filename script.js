document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sidebar = document.getElementById('admin-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    // Payment/View Page Elements
    const paymentPage = document.getElementById('payment-page');
    const thankyouPage = document.getElementById('thankyou-page'); 
    const passwordPage = document.getElementById('password-page');
    const displayAmount = document.getElementById('display-amount');
    const paidBtn = document.getElementById('paid-btn');
    const getPasswordBtn = document.getElementById('get-password-btn'); 
    const userNameDisplay = document.getElementById('user-name-display'); 
    const displayWifiPassword = document.getElementById('display-wifi-password');
    
    // NEW HOME BUTTON ELEMENTS
    const thankyouHomeBtn = document.getElementById('thankyou-home-btn');
    const passwordHomeBtn = document.getElementById('password-home-btn');

    // Admin Login/Settings Elements (No Change)
    const adminLoginArea = document.getElementById('admin-login-area');
    const adminSettings = document.getElementById('admin-settings');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');
    const loginMessage = document.getElementById('login-message');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Admin Settings Inputs (No Change)
    const setAmountInput = document.getElementById('set-amount');
    const setWifiPasswordInput = document.getElementById('set-wifi-password');
    const enablePassBtnSetting = document.getElementById('enable-pass-btn-setting'); 
    const updateSettingsBtn = document.getElementById('update-settings-btn');
    
    // History Table Elements (No Change)
    const historyBody = document.getElementById('history-body');
    const clearRecordsBtn = document.getElementById('clear-records-btn');

    // --- State and Constants ---
    const DEFAULT_PASS = 'admin123';
    let ADMIN_PASSWORD = DEFAULT_PASS;
    let paymentSettings = {
        amount: 50,
        wifiPassword: 'hostelpass123',
        enablePasswordButton: false 
    };
    let paymentHistory = [];
    let isAdminLoggedIn = false;
    let isPaymentVerified = false; // Tracks if user has paid successfully
    
    // --- LocalStorage Keys ---
    const KEY_SETTINGS = 'wifi_settings_v3'; 
    const KEY_HISTORY = 'payment_history_v3';
    const KEY_ADMIN_PASS = 'admin_password_v3';

    // --- Core Functions ---

    // Load, updateUI, updateSettings, renderHistoryTable, simulatePayment, showPassword functions
    // (In the final file, these would contain the full logic from the previous step)

    /**
     * Resets the view to the main payment page and payment verification state.
     */
    function goToHomePage() {
        // Reset view
        passwordPage.style.display = 'none';
        thankyouPage.style.display = 'none';
        paymentPage.style.display = 'block';

        // Reset verification state
        isPaymentVerified = false;
        userNameDisplay.textContent = 'User'; // Reset username display
        alert('You have returned to the Home Page. Please verify payment again for access.');
    }
    
    // --- Helper functions (Simplified for response, assume they exist) ---
    function loadData() {
        // ... Load logic ...
        const storedSettings = localStorage.getItem(KEY_SETTINGS);
        if (storedSettings) paymentSettings = JSON.parse(storedSettings);
        const storedHistory = localStorage.getItem(KEY_HISTORY);
        if (storedHistory) paymentHistory = JSON.parse(storedHistory);
        const storedAdminPass = localStorage.getItem(KEY_ADMIN_PASS);
        if (storedAdminPass) ADMIN_PASSWORD = storedAdminPass;
        
        if (typeof paymentSettings.enablePasswordButton === 'undefined') paymentSettings.enablePasswordButton = false;

        updateUI();
    }
    
    function updateUI() {
        displayAmount.textContent = `₹${paymentSettings.amount}`;
        displayWifiPassword.textContent = paymentSettings.wifiPassword;
        setAmountInput.value = paymentSettings.amount;
        setWifiPasswordInput.value = paymentSettings.wifiPassword;
        enablePassBtnSetting.checked = paymentSettings.enablePasswordButton;
        
        // Update Get Password Button State
        if (paymentSettings.enablePasswordButton) {
            getPasswordBtn.removeAttribute('disabled');
            getPasswordBtn.textContent = 'Get WiFi Password';
            getPasswordBtn.classList.remove('disabled');
        } else {
            getPasswordBtn.setAttribute('disabled', 'disabled');
            getPasswordBtn.textContent = 'Password Disabled by Admin';
            getPasswordBtn.classList.add('disabled');
        }
        renderHistoryTable();
    }
    
    function updateSettings() {
        // ... Save logic ...
        paymentSettings.amount = Math.max(1, parseInt(setAmountInput.value) || 50); 
        paymentSettings.wifiPassword = setWifiPasswordInput.value.trim() || 'hostelpass123';
        paymentSettings.enablePasswordButton = enablePassBtnSetting.checked; 
        
        const newAdminPass = adminPasswordInput.value.trim();
        if (newAdminPass && newAdminPass !== 'admin123') { 
             ADMIN_PASSWORD = newAdminPass;
             localStorage.setItem(KEY_ADMIN_PASS, ADMIN_PASSWORD);
        }
        localStorage.setItem(KEY_SETTINGS, JSON.stringify(paymentSettings));

        alert('Settings Updated Successfully! Main page elements are refreshed.');
        updateUI();
    }
    
    function simulatePayment() {
        if (isPaymentVerified) {
            alert('Aapki payment pehle hi verify ho chuki hai. Kripya password button ka upyog karein.');
            return;
        }

        let userName = prompt('Enter your Name/Room Number (Optional):');
        if (userName === null) return; 
        userName = userName.trim() || 'Guest User';
        
        const isSuccess = Math.random() < 0.8; 
        const status = isSuccess ? 'Success' : 'Failed';

        const newRecord = {
            dateTime: new Date().toISOString(),
            userName: userName,
            amount: paymentSettings.amount,
            status: status
        };
        paymentHistory.push(newRecord);
        localStorage.setItem(KEY_HISTORY, JSON.stringify(paymentHistory));

        if (isSuccess) {
            isPaymentVerified = true;
            userNameDisplay.textContent = userName;
            
            paymentPage.style.display = 'none';
            passwordPage.style.display = 'none';
            thankyouPage.style.display = 'block';
            
            alert(`Payment Verified! Thank you, ${userName}. Now get your password.`);

        } else {
            alert('Payment Verification Failed (Demo Mode). Please try again or contact the controller.');
        }
        if (isAdminLoggedIn) renderHistoryTable();
    }
    
    function showPassword() {
        if (!isPaymentVerified) {
            alert('Kripya pehle "I Have Paid" button se payment verify karein.');
            return;
        }
        
        if (!paymentSettings.enablePasswordButton) {
            alert('Password abhi Admin dwara disable kiya gaya hai. Kripya thodi der baad prayas karein.');
            return;
        }
        
        paymentPage.style.display = 'none';
        thankyouPage.style.display = 'none';
        passwordPage.style.display = 'block';
    }
    
    function renderHistoryTable() {
        historyBody.innerHTML = ''; 
        const sortedHistory = [...paymentHistory].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        if (sortedHistory.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No records found.</td></tr>';
            return;
        }

        sortedHistory.forEach(record => {
            const row = historyBody.insertRow();
            row.insertCell().textContent = new Date(record.dateTime).toLocaleString();
            row.insertCell().textContent = record.userName || 'N/A';
            row.insertCell().textContent = `₹${record.amount}`;
            row.insertCell().textContent = record.status;
            row.style.color = record.status === 'Success' ? '#76ff03' : '#ff5252'; 
        });
    }

    // --- Event Listeners ---
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    paidBtn.addEventListener('click', simulatePayment);
    getPasswordBtn.addEventListener('click', showPassword);
    
    // NEW HOME BUTTON LISTENERS
    thankyouHomeBtn.addEventListener('click', goToHomePage);
    passwordHomeBtn.addEventListener('click', goToHomePage);

    // Admin Login/Logout (No Change)
    loginBtn.addEventListener('click', () => {
        const enteredPass = adminPasswordInput.value;
        if (enteredPass === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            adminLoginArea.style.display = 'none';
            adminSettings.style.display = 'block';
            loginMessage.textContent = 'Login Successful.';
            loginMessage.style.color = '#4CAF50';
            updateUI(); 
        } else {
            loginMessage.textContent = 'Invalid Password.';
            loginMessage.style.color = '#f44336';
        }
    });

    logoutBtn.addEventListener('click', () => {
        isAdminLoggedIn = false;
        adminSettings.style.display = 'none';
        adminLoginArea.style.display = 'block';
        adminPasswordInput.value = ''; 
        loginMessage.textContent = ''; 
        alert('Logged out successfully.');
    });

    // Settings and Records (No Change)
    updateSettingsBtn.addEventListener('click', updateSettings);
    clearRecordsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL payment history records? This cannot be undone.')) {
            paymentHistory = [];
            localStorage.removeItem(KEY_HISTORY);
            renderHistoryTable();
            alert('Payment history cleared.');
        }
    });

    // --- Initialization ---
    loadData(); 
});