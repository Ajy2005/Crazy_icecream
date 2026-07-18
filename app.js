// 1. DEPARTMENT CONFIGURATION & PRODUCTS
const DEPARTMENT_PRODUCTS = {
    "CONE": ["Strawberry Cone", "Chocolate Small Cone", "Chocolate Big Cone", "Twin Cone"],
    "ICECREAM": ["Vanilla 250ml", "Vanilla 500ml", "Vanilla 1L", "Vanilla 2L"],
    "NOVELTY": ["Mango Dolly", "Chocobar", "Orange Bar"],
    "KULFI": ["Malai Kulfi", "Pista Kulfi", "Matka Kulfi"],
    "MACHINE_PACKING": ["Family Pack 700ml", "Party Pack 2L", "Bulk 5L"],
    "ALL": []
};

// Admin sees all products
DEPARTMENT_PRODUCTS["ALL"] = [
    ...DEPARTMENT_PRODUCTS["CONE"], ...DEPARTMENT_PRODUCTS["ICECREAM"], 
    ...DEPARTMENT_PRODUCTS["NOVELTY"], ...DEPARTMENT_PRODUCTS["KULFI"], 
    ...DEPARTMENT_PRODUCTS["MACHINE_PACKING"]
];

// 2. USER DATABASE (ID, Password, Role, Dept)
let USER_DATABASE = {
    "Admin@Crazy.in": { 
        name: "Admin", createDate: "18-07-2026", role: "ADMIN", 
        department: "Production Manager", password: "Pass@123" 
    },
    "9529978587": { 
        name: "Operator Name", createDate: "19-07-2026", role: "PRODUCTION", 
        department: "ICECREAM", password: "123456" 
    },"a9529978587": { 
        name: "Ajay", createDate: "19-07-2026", role: "RETURN", 
        department: "ICECREAM", password: "123456" 
};

// 3. LOGIN LOGIC
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;
    
    if(USER_DATABASE[loginId] && USER_DATABASE[loginId].password === password) {
        startApp(loginId);
    } else {
        alert("Invalid ID or Password! Please try again.");
    }
});

function logout() { location.reload(); }

// 4. START APP & APPLY RBAC
function startApp(userId) {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    
    const userConfig = USER_DATABASE[userId];
    document.getElementById('user-display').innerText = userConfig.name + " (" + userConfig.role + ")";
    
    const role = userConfig.role;
    const dept = userConfig.department;

    if (role === "ADMIN") {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.production-tab, .dispatch-tab, .returns-tab').forEach(el => el.classList.remove('hidden'));
        switchTab('dashboard-view', 'Live Dashboard');
        renderUserTable();
        renderPieChart();
    } else if (role === "PRODUCTION") {
        document.querySelector('.production-tab').classList.remove('hidden');
        switchTab('production-view', 'Production Entry');
        loadProductsInDropdown("production-product-list", dept);
        updateTime();
        setInterval(updateTime, 60000);
    } else if (role === "DISPATCH") {
        document.querySelector('.dispatch-tab').classList.remove('hidden');
        switchTab('dispatch-view', 'Dispatch Goods');
    } else if (role === "RETURN") {
        document.querySelector('.returns-tab').classList.remove('hidden');
        switchTab('returns-view', 'Returns / Damage Entry');
    }
}

// 5. HELPER FUNCTIONS
function loadProductsInDropdown(dropdownId, department) {
    const select = document.getElementById(dropdownId);
    if (!select) return;
    select.innerHTML = "<option disabled selected>Select Product...</option>";
    DEPARTMENT_PRODUCTS[department].forEach(prod => {
        select.innerHTML += `<option value="${prod}">${prod}</option>`;
    });
}

function updateTime() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    if(document.getElementById('autoDateTime')) {
        document.getElementById('autoDateTime').innerText = now.toLocaleString('en-IN', options);
    }
}

// 6. NAVIGATION LOGIC
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const title = link.innerText.trim();
        switchTab(targetId, title);
        
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
    });
});

function switchTab(tabId, title) {
    document.querySelectorAll('.content-view').forEach(view => view.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById('main-title').innerText = title;
}

// 7. USER CONTROL (Admin) LOGIC
function toggleDepartmentSelect() {
    const role = document.getElementById("new-role").value;
    const deptDiv = document.getElementById("dept-selection-div");
    if (role === "PRODUCTION") { 
        deptDiv.classList.remove("hidden"); 
    } else { 
        deptDiv.classList.add("hidden"); 
    }
}

function saveNewUser() {
    const name = document.getElementById("new-name").value;
    const id = document.getElementById("new-id").value;
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("new-role").value;
    let dept = document.getElementById("new-dept").value;

    if (!name || !id || !password || !role) {
        alert("Please fill all required fields!");
        return;
    }

    if (role === "PRODUCTION" && !dept) {
        alert("Please select a Department for the Operator.");
        return;
    }

    if (role !== "PRODUCTION") { dept = "ALL ACCESS"; }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    // Add to local JSON Database
    USER_DATABASE[id] = {
        name: name,
        createDate: formattedDate,
        role: role,
        department: dept,
        password: password
    };

    alert(`User ${name} added successfully!`);
    document.getElementById("add-user-form").reset();
    toggleDepartmentSelect();
    renderUserTable();
}

function renderUserTable() {
    const tbody = document.getElementById('user-table-body');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    for (let id in USER_DATABASE) {
        let user = USER_DATABASE[id];
        let roleColor = user.role === 'ADMIN' ? 'text-purple-700 bg-purple-100' : 'text-green-700 bg-green-100';
        
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-2 font-bold">${user.name}</td>
                <td class="p-2 text-gray-600">${user.createDate}</td>
                <td class="p-2"><span class="px-2 py-1 rounded text-xs font-bold ${roleColor}">${user.role}</span></td>
                <td class="p-2 text-gray-700 font-medium">${user.department}</td>
                <td class="p-2 font-mono text-blue-700">${id}</td>
                <td class="p-2 font-mono text-red-600">${user.password}</td>
            </tr>
        `;
    }
}

// 8. PIE CHART (Dashboard)
function renderPieChart() {
    const ctx = document.getElementById('myPieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Production', 'Dispatch', 'Damage'],
            datasets: [{ data: [1250, 800, 25], backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'] }]
        }
    });
}
