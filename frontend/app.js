const API_URL = 'http://localhost:3000/api/students';
let editingId = null;

// โหลดข้อมูลเมื่อเปิดหน้า
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    setupEventListeners();
});

// ตั้งค่า Event Listeners
function setupEventListeners() {
    document.getElementById('studentForm').addEventListener('submit', handleSubmit);
    document.getElementById('majorFilter').addEventListener('change', handleFilter);
}

// โหลดข้อมูลนักเรียนทั้งหมด
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// แสดงข้อมูลในตาราง
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">ไม่มีข้อมูล</td></tr>';
        return;
    }
    
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.age}</td>
            <td>${student.major}</td>
            <td>${student.gpa.toFixed(2)}</td>
            <td class="action-buttons">
                <button class="btn btn-edit" onclick="editStudent('${student._id}')">แก้ไข</button>
                <button class="btn btn-delete" onclick="deleteStudent('${student._id}')">ลบ</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// จัดการการ Submit ฟอร์ม
async function handleSubmit(e) {
    e.preventDefault();
    
    const studentData = {
        studentId: document.getElementById('studentId').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        age: parseInt(document.getElementById('age').value),
        major: document.getElementById('major').value,
        gpa: parseFloat(document.getElementById('gpa').value)
    };
    
    try {
        if (editingId) {
            // Update
            await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            alert('แก้ไขข้อมูลสำเร็จ!');
        } else {
            // Create
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            alert('เพิ่มข้อมูลสำเร็จ!');
        }
        
        resetForm();
        loadStudents();
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาด!');
    }
}

// แก้ไขข้อมูล
async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();
        
        editingId = id;
        document.getElementById('studentId').value = student.studentId;
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('email').value = student.email;
        document.getElementById('age').value = student.age;
        document.getElementById('major').value = student.major;
        document.getElementById('gpa').value = student.gpa;
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// ลบข้อมูล
async function deleteStudent(id) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        alert('ลบข้อมูลสำเร็จ!');
        loadStudents();
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

// กรองตามสาขา
async function handleFilter(e) {
    const major = e.target.value;
    
    try {
        let url = API_URL;
        if (major) {
            url = `${API_URL}/search/major/${major}`;
        }
        
        const response = await fetch(url);
        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการค้นหา');
    }
}

// รีเซ็ตฟอร์ม
function resetForm() {
    editingId = null;
    document.getElementById('studentForm').reset();
}