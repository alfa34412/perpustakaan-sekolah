// Data storage (in a real app, this would be a database)
let books = JSON.parse(localStorage.getItem('books')) || [
    {
        title: "Buku di Perpustakaan",
        synopsis: "ini adalah buku digital. tekan tombol baca buku untuk melihat buku yang tersedia",
        link: "https://fliphtml5.com/bookcase/ycmev"
    }
];
let history = JSON.parse(localStorage.getItem('history')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const closeModal = document.querySelector('.close');
const booksContainer = document.getElementById('books-container');
const historyContainer = document.getElementById('history-container');
const activityContainer = document.getElementById('activity-container');
const addBookForm = document.getElementById('add-book-form');
const addStudentForm = document.getElementById('add-student-form');
const studentsList = document.getElementById('students-list');
const historyLink = document.getElementById('history-link');
const adminLink = document.getElementById('admin-link');

// Event listeners
if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (closeModal) closeModal.addEventListener('click', closeLoginModal);
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (addBookForm) addBookForm.addEventListener('submit', addBook);
if (addStudentForm) addStudentForm.addEventListener('submit', addStudent);

// Password toggle event listeners
const toggleLogin = document.getElementById('toggle-password-login');
if (toggleLogin) toggleLogin.addEventListener('click', function() {
    togglePasswordVisibility('password', 'toggle-password-login');
});

const toggleStudent = document.getElementById('toggle-password-student');
if (toggleStudent) toggleStudent.addEventListener('click', function() {
    togglePasswordVisibility('student-password', 'toggle-password-student');
});

// Functions
function openLoginModal() {
    loginModal.style.display = 'block';
}

function closeLoginModal() {
    loginModal.style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const userType = document.getElementById('user-type').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple authentication (in a real app, this would be server-side)
    if (userType === 'admin' && username === 'admin' && password === 'admin123') {
        currentUser = { type: 'admin', username: 'admin' };
        showAdminFeatures();
    } else if (userType === 'student') {
        // Check against registered students
        const student = students.find(s => s.username === username && s.password === password);
        if (student) {
            currentUser = { type: 'student', username: username };
            showStudentFeatures();
        } else {
            alert('Login gagal. Periksa kredensial Anda.');
            return;
        }
    } else {
        alert('Login gagal. Periksa kredensial Anda.');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeLoginModal();
    updateUI();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
}

function showAdminFeatures() {
    historyLink.style.display = 'none';
    adminLink.style.display = 'block';
    document.getElementById('admin').style.display = 'block';
}

function showStudentFeatures() {
    historyLink.style.display = 'block';
    adminLink.style.display = 'none';
    document.getElementById('admin').style.display = 'none';
    document.getElementById('history').style.display = 'block';
}

function updateUI() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        if (currentUser.type === 'admin') {
            showAdminFeatures();
        } else {
            showStudentFeatures();
        }
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        historyLink.style.display = 'none';
        adminLink.style.display = 'none';
        document.getElementById('history').style.display = 'none';
        document.getElementById('admin').style.display = 'none';
    }
    renderBooks();
    renderHistory();
    renderActivities();
    renderStudents();
    renderStudentStats();
    renderAdminStats();
}

function renderBooks() {
    booksContainer.innerHTML = '';
    books.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-synopsis">${book.synopsis}</p>
                <button class="read-btn" onclick="readBook(${index})">Baca Buku</button>
            </div>
        `;
        booksContainer.appendChild(bookCard);
    });
}

function readBook(index) {
    const book = books[index];
    const startTime = new Date().getTime();

    // Open book in iframe within the page
    const bookViewer = document.createElement('div');
    bookViewer.id = 'book-viewer';
    bookViewer.innerHTML = `
        <div class="viewer-header">
            <h2>${book.title}</h2>
            <button id="close-viewer">Tutup</button>
        </div>
        <iframe src="${book.link}" width="100%" height="600px" frameborder="0" allowfullscreen></iframe>
    `;
    document.body.appendChild(bookViewer);

    // Close viewer function
    document.getElementById('close-viewer').addEventListener('click', () => {
        document.body.removeChild(bookViewer);
    });

    // Record reading activity
    const activity = {
        bookTitle: book.title,
        username: currentUser.username,
        startTime: startTime,
        endTime: null,
        duration: null
    };

    // Simulate reading duration (in a real app, this would track actual time)
    setTimeout(() => {
        const endTime = new Date().getTime();
        activity.endTime = endTime;
        activity.duration = Math.round((endTime - startTime) / 1000); // duration in seconds

        activities.push(activity);
        localStorage.setItem('activities', JSON.stringify(activities));

        // Add to history
        history.push({
            bookTitle: book.title,
            username: currentUser.username,
            readDate: new Date().toLocaleString(),
            startTime: startTime,
            duration: activity.duration
        });
        localStorage.setItem('history', JSON.stringify(history));

        renderHistory();
        renderActivities();
    }, 5000); // Simulate 5 seconds of reading
}

function renderHistory() {
    historyContainer.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <h4>${item.bookTitle}</h4>
            <p>Dibaca pada: ${item.readDate}</p>
            <p>Durasi: ${Math.floor(item.duration / 60)} menit ${item.duration % 60} detik</p>
        `;
        historyContainer.appendChild(historyItem);
    });
}

function renderActivities() {
    activityContainer.innerHTML = '';
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'history-item';
        activityItem.innerHTML = `
            <h4>${activity.bookTitle}</h4>
            <p>Siswa: ${activity.username}</p>
            <p>Waktu mulai: ${new Date(activity.startTime).toLocaleString()}</p>
            <p>Durasi: ${Math.floor(activity.duration / 60)} menit ${activity.duration % 60} detik</p>
        `;
        activityContainer.appendChild(activityItem);
    });
}

function addBook(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const synopsis = document.getElementById('book-synopsis').value;
    const cover = document.getElementById('book-cover').value;
    const link = document.getElementById('book-link').value;

    books.push({ title, author, synopsis, cover, link });
    localStorage.setItem('books', JSON.stringify(books));

    renderBooks();
    addBookForm.reset();
    alert('Buku berhasil ditambahkan!');
}

function addStudent(e) {
    e.preventDefault();
    const username = document.getElementById('student-username').value;
    const password = document.getElementById('student-password').value;

    // Check if student already exists
    const existingStudent = students.find(student => student.username === username);
    if (existingStudent) {
        alert('Username siswa sudah ada!');
        return;
    }

    students.push({ username, password });
    localStorage.setItem('students', JSON.stringify(students));

    renderStudents();
    addStudentForm.reset();
    alert('Akun siswa berhasil ditambahkan!');
}

function renderStudents() {
    studentsList.innerHTML = '';
    students.forEach((student, index) => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        studentItem.innerHTML = `
            <p><strong>Username:</strong> ${student.username}</p>
            <button class="delete-btn" onclick="deleteStudent(${index})">Hapus</button>
        `;
        studentsList.appendChild(studentItem);
    });
}

function deleteStudent(index) {
    if (confirm('Apakah Anda yakin ingin menghapus akun siswa ini?')) {
        const studentToDelete = students[index];

        // Get all activities for this student before deleting them
        const studentActivities = activities.filter(activity => activity.username === studentToDelete.username);

        // Remove the student from the array
        students.splice(index, 1);
        localStorage.setItem('students', JSON.stringify(students));

        // Remove all activities for this student
        activities = activities.filter(activity => activity.username !== studentToDelete.username);
        localStorage.setItem('activities', JSON.stringify(activities));

        // Remove all history entries for this student
        history = history.filter(item => item.username !== studentToDelete.username);
        localStorage.setItem('history', JSON.stringify(history));

        // If the deleted student is currently logged in, log them out
        if (currentUser && currentUser.username === studentToDelete.username) {
            logout();
        }

        // Re-render everything
        renderStudents();
        renderActivities();
        renderHistory();
        renderStudentStats();
        renderAdminStats();

        alert('Akun siswa berhasil dihapus!');
    }
}

// Initialize the app
updateUI();

// Password toggle function
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == loginModal) {
        closeLoginModal();
    }
}

function renderStudentStats() {
    const studentStatsContainer = document.getElementById('student-stats');
    if (!studentStatsContainer) return;

    // Calculate stats for the current student
    const userActivities = activities.filter(activity => activity.username === currentUser.username);
    const totalBooksRead = new Set(userActivities.map(activity => activity.bookTitle)).size;
    const totalReadingTime = userActivities.reduce((total, activity) => total + (activity.duration || 0), 0);
    const averageReadingTime = userActivities.length > 0 ? Math.round(totalReadingTime / userActivities.length) : 0;

    studentStatsContainer.innerHTML = `
        <div class="stats-card">
            <h3>Total Buku Dibaca</h3>
            <p>${totalBooksRead}</p>
        </div>
        <div class="stats-card">
            <h3>Total Waktu Membaca</h3>
            <p>${Math.floor(totalReadingTime / 60)} menit</p>
        </div>
        <div class="stats-card">
            <h3>Rata-rata Waktu per Buku</h3>
            <p>${Math.floor(averageReadingTime / 60)} menit</p>
        </div>
    `;
}

function renderAdminStats() {
    const adminStatsContainer = document.getElementById('admin-stats');
    if (!adminStatsContainer) return;

    // Calculate overall stats
    const totalStudents = students.length;
    const totalBooks = books.length;
    const totalActivities = activities.length;
    const totalReadingTime = activities.reduce((total, activity) => total + (activity.duration || 0), 0);

    adminStatsContainer.innerHTML = `
        <div class="stats-card">
            <h3>Total Siswa</h3>
            <p>${totalStudents}</p>
        </div>
        <div class="stats-card">
            <h3>Total Buku</h3>
            <p>${totalBooks}</p>
        </div>
        <div class="stats-card">
            <h3>Total Aktivitas Membaca</h3>
            <p>${totalActivities}</p>
        </div>
        <div class="stats-card">
            <h3>Total Waktu Membaca</h3>
            <p>${Math.floor(totalReadingTime / 60)} menit</p>
        </div>
    `;
}
