const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Institute = require('../models/InstituteRequest');
const Notification = require('../models/Notification');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const RegisteredInstitute = require('../models/approveInstitute');
const { io } = require('../app'); // Import the io instance

let notifyAdmins;
setTimeout(() => {
    const appModule = require('../app'); 
    notifyAdmins = appModule.notifyAdmins;
}, 1000);

// ✅ Email Transporter Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Send Verification Email to `username`
const sendVerificationEmail = async (username, token) => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const verificationLink = `${backendUrl}/sub-admin/verify-email/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: username, // ✅ Now sending to `username`
        subject: 'Verify Your Email',
        html: `<p>Please click the link below to verify your email and complete registration:</p>
               <a href="${verificationLink}">${verificationLink}</a>`
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', username);
};

// ✅ Send Institute Request Confirmation Email to `username`
const sendEmailToInstituteAdmin = async (username, instituteName, instituteAdminName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: username, // ✅ Now sending to `username`
            subject: 'Registration Request Received',
            html: `<p>Dear ${instituteAdminName},</p>
                   <p>We have received your registration request for <strong>${instituteName}</strong>. We will review it and get back to you shortly.</p>
                   <p>For queries, contact: <a href="mailto:admin@smartclassroomlms.com">admin@smartclassroomlms.com</a>.</p>
                   <p>Thank you,<br>SmartClassroom Team</p>`
        };
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', username);
    } catch (error) {
        console.error('Error sending email to institute admin:', error);
    }
};

// ✅ Registration Route (Sends Verification Link)
exports.registerInstitute = async (req, res) => {
    const { instituteName, numberOfStudents, region, instituteAdminName, instituteAdminEmail, institutePhoneNumber, domainName, username, password } = req.body;

    if (!instituteName || typeof instituteName !== 'string') return res.status(400).json({ error: 'Invalid instituteName' });
    if (!numberOfStudents || typeof numberOfStudents !== 'string') return res.status(400).json({ error: 'Invalid numberOfStudents' });
    if (!region || typeof region !== 'string') return res.status(400).json({ error: 'Invalid region' });
    if (!instituteAdminName || typeof instituteAdminName !== 'string') return res.status(400).json({ error: 'Invalid instituteAdminName' });
    if (!username || typeof username !== 'string' || !username.includes('@')) return res.status(400).json({ error: 'Invalid username' });
    if (!institutePhoneNumber || typeof institutePhoneNumber !== 'string') return res.status(400).json({ error: 'Invalid institutePhoneNumber' });
    if (!domainName || typeof domainName !== 'string') return res.status(400).json({ error: 'Invalid domainName' });
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'Invalid password' });

    try {
        const existingRequest = await Institute.findOne({ username });
        if (existingRequest) return res.status(400).json({ error: 'A request has already been sent from this email address.' });

        const existingUser = await RegisteredInstitute.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'This username is already taken.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ username, hashedPassword, instituteName, numberOfStudents, region, instituteAdminName, institutePhoneNumber, domainName }, process.env.JWT_SECRET, { expiresIn: '1d' });

        await sendVerificationEmail(username, token);
        res.status(200).json({ message: 'Verification email sent' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Verification Route (Stores Data in DB After Verification)
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Received token for verification:', token); // Debugging log
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Debugging log

        const { username, hashedPassword, instituteName, numberOfStudents, region, instituteAdminName, institutePhoneNumber, domainName } = decoded;

        const newInstitute = new Institute({
            instituteName,
            numberOfStudents,
            region,
            instituteAdminName,
            instituteAdminEmail: username, // ✅ Store username as email
            institutePhoneNumber,
            domainName,
            username,
            password: hashedPassword
        });

        await newInstitute.save();
        console.log('New institute saved:', newInstitute); // Debugging log

        // ✅ Save Notification in DB
        const notification = new Notification({
            title: 'New Registration Request',
            message: `New registration request from "${instituteName}"`,
            type: 'request'
        });
        await notification.save();
        console.log('Notification saved:', notification); // Debugging log

        // ✅ Notify Admins via WebSocket
        if (notifyAdmins) {
            notifyAdmins({
                instituteName,
                message: `New registration request from "${instituteName}"`,
                time: new Date().toISOString()
            });
            console.log('Admins notified'); // Debugging log
        } else {
            console.error("notifyAdmins is not yet available");
        }

        // Emit a Socket.IO event to notify the client
        req.io.emit('emailVerified', { username });
        console.log('Socket.IO event emitted for email verification:', username); // Debugging log

        // ✅ Send Confirmation Email to `username`
        await sendEmailToInstituteAdmin(username, instituteName, instituteAdminName);
        console.log('Confirmation email sent to:', username); // Debugging log

        res.status(200).json({ message: 'Email verified, registration request sent!' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

// New endpoint to check verification status
exports.checkVerificationStatus = async (req, res) => {
    try {
        const { username } = req.query;
        const institute = await Institute.findOne({ username });

        if (institute) {
            res.status(200).json({ verified: true });
        } else {
            res.status(200).json({ verified: false });
        }
    } catch (error) {
        console.error('Error checking verification status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, registrationId, email, password, status } = req.body;
        console.log('password:', password);
        console.log('id:', id);
        // Find student by ID
        const student = await Student.findOne({studentId:id});
        console.log('student:', student);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        console.log('student:', student);
        

        // Update student details
        student.name = name || student.name;
        student.registrationId = registrationId || student.registrationId;
        student.email = email || student.email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(password, salt);
        }
        student.status = status || student.status;

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('id:', id);

        // Find and delete student by studentId
        const student = await Student.findOneAndDelete({ studentId: id });
        console.log('student:', student);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// Updated addStudent controller
exports.addStudent = async (req, res) => {
    try {
        const { name, registrationId, email } = req.body;
        // Validate required fields
        if (!name || !registrationId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name, registrationId and email are required'
            });
        }
        const salt = await bcrypt.genSalt(10);
        // Use registrationId as the password
        const hashedPassword = await bcrypt.hash(registrationId, salt);

        const studentData = {
            name,
            registrationId,
            email,
            password: hashedPassword,
            status: 'active'
        };

        const newStudent = new Student(studentData);
        await newStudent.save();

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            data: newStudent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding student',
            error: error.message
        });
    }
};

// Updated importStudents controller
exports.importStudents = async (req, res) => {
    try {
        let records = [];
        if (req.body.data) {
            const csvData = req.body.data;
            const rows = csvData.split('\n').filter(line => line.trim() !== '');
            if (rows.length < 2) {
                return res.status(400).json({ msg: 'CSV data must include header and at least one row.' });
            }
            const header = rows.shift().split(',').map(h => h.trim().toLowerCase());
            // Expected header: name, registrationid, email
            for (const row of rows) {
                const values = row.split(',').map(val => val.trim());
                if (values.length < 3) {
                    continue; // Skip if not enough columns
                }
                const record = {};
                header.forEach((key, idx) => {
                    record[key] = values[idx];
                });
                records.push(record);
            }
        } else if (Array.isArray(req.body)) {
            records = req.body;
        } else {
            return res.status(400).json({ msg: 'Invalid data format: CSV string or array expected.' });
        }

        const results = { success: [], errors: [] };

        for (const record of records) {
            const { name, registrationid, email } = record;
            if (!name || !registrationid || !email) {
                results.errors.push({ email: email || null, msg: 'Missing required fields.' });
                continue;
            }
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                results.errors.push({ email, msg: 'Duplicate entry.' });
                continue;
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(registrationid, salt);
            const newStudent = new Student({
                name,
                registrationId: registrationid,
                email,
                password: hashedPassword,
                status: 'active'
            });
            await newStudent.save();
            results.success.push({ email, msg: 'Imported successfully.' });
        }
        res.status(201).json({ 
            msg: `Import completed for chunk ${req.body.chunk || 1} of ${req.body.totalChunks || 1}.`, 
            results 
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error.', error: error.message });
    }
};

// Teacher controllers
exports.addTeacher = async (req, res) => {
    try {
        const { name, registrationId, email, password, status } = req.body;

        // Ensure password is provided
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create teacher object
        const teacherData = {
            name,
            registrationId,
            email,
            password: hashedPassword,
            status: status || 'active'
        };

        // Save to Teacher collection
        const newTeacher = new Teacher(teacherData);
        await newTeacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            data: newTeacher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding teacher',
            error: error.message
        });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json({
            success: true,
            data: teachers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers',
            error: error.message
        });
    }
};

exports.editTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, registrationId, email, password, status } = req.body;

        // Find teacher by ID
        const teacher = await Teacher.findOne({ teacherId: id });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Update teacher details
        teacher.name = name || teacher.name;
        teacher.registrationId = registrationId || teacher.registrationId;
        teacher.email = email || teacher.email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            teacher.password = await bcrypt.hash(password, salt);
        }
        teacher.status = status || teacher.status;

        await teacher.save();

        res.status(200).json({
            success: true,
            message: 'Teacher updated successfully',
            data: teacher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating teacher',
            error: error.message
        });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete teacher by teacherId
        const teacher = await Teacher.findOneAndDelete({ teacherId: id });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting teacher',
            error: error.message
        });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await RegisteredInstitute.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const payload = {
            id: user._id,
            role: 'subAdmin'
        };

        // Generate JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Clear conflicting admin token before setting sub-admin token
        res.clearCookie('adminToken');

        // Set cookie
        res.cookie('subAdminToken', token, {
            httpOnly: true, // Prevents JavaScript from accessing it
            secure: process.env.NODE_ENV === 'production', // Sends cookie over HTTPS in production
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 60 * 60 * 1000, // Token expiration (1 hour)
        });

        console.log('SubAdmin cookie set:', token); // Add this line to log the token

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('subAdminToken'); // Clear the HTTP-only cookie
    res.status(401).json({ msg: 'Logged out successfully' });
};
