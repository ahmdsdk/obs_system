require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require("crypto");
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Lesson = require('../models/Lesson');

const jwtSecret = process.env.JWT_ACCESS_TOKEN;
const tokenExpiration = parseInt(process.env.TOKEN_EXPIRATION);

const jwtRefreshSecret = process.env.JWT_REFRESH_TOKEN;
const refreshExpiration = parseInt(process.env.REFRESH_EXPIRATION);

const {
    checkWhiteSpace,
    checkMinLength,
    checkMaxLength,
    setToken,
    setRefreshToken,
    checkToken,
    decodeToken,
    encryptToken,
    decryptToken
} = require('../utils');

module.exports = {
    getUserData: async (user) => {
        const userData = {
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
        };
        
        return userData;
    },
    checkIfAdmin: async (req, res, next) => {
        const { user } = res.locals;

        const admin = await User.findOne(user);

        if (admin && admin.role === 'admin') {
            res.locals.user = admin;
            return next();
        }

        res.locals = {
            status: 400,
            message: 'Admin değilsiniz.'
        };
        return module.exports.sendResponse(req, res);
    },
    checkIfAdminOrTeacher: async (req, res, next) => {
        const { user } = res.locals;

        const admin = await User.findOne(user);

        if (admin && (admin.role === 'admin' || admin.role === 'teacher')) {
            res.locals.user = admin;
            return next();
        }

        res.locals = {
            status: 400,
            message: 'Admin / öğretmen değilsiniz.'
        };
        return module.exports.sendResponse(req, res);
    },
    sendResponse: async (req, res) => {
        const { status, user, data, token, refreshToken, options, message } = res.locals;
        
        if (refreshToken) {
            return res.status(status).cookie('refreshToken', refreshToken, options).json({
                status,
                user,
                data,
                token
            });
        } else {
            return res.status(status).cookie('refreshToken', "").json({
                status,
                message
            });
        }
    },
    getStudents: async (req, res) => {
        const { status, user, data, token, refreshToken, options, message } = res.locals;

        const users = await Student.find();

        res.locals = {
            status,
            user: await module.exports.getUserData(user),
            token,
            data: users,
            refreshToken,
            options
        };

        return module.exports.sendResponse(req, res);
    },
    getTeachers: async (req, res) => {
        const { status, user, data, token, refreshToken, options, message } = res.locals;

        const users = await Teacher.find();

        res.locals = {
            status,
            user: await module.exports.getUserData(user),
            token,
            data: users,
            refreshToken,
            options
        };

        return module.exports.sendResponse(req, res);
    },
    getLessons: async (req, res) => {
        const { status, user, data, token, refreshToken, options, message } = res.locals;

        const lessons = await Lesson.find();

        res.locals = {
            status,
            user: await module.exports.getUserData(user),
            token,
            data: lessons,
            refreshToken,
            options
        };

        return module.exports.sendResponse(req, res);
    },
    addTeacher: async (req, res) => {
        let { username, email, password, passwordAgain, fullName, identityNum } = req.body;

        username = username?.toLowerCase().trim();
        email = email?.toLowerCase().trim();
        password = password?.trim();

        if (!username || !email || !password || !passwordAgain || !fullName || !identityNum) {
            res.locals = {
                status: 401,
                message: "Bütün alanları doldurun."
            };
            return module.exports.sendResponse(req, res);
        }
        if (checkWhiteSpace(password)) {
            res.locals = {
                status: 401,
                message: "Parola boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }
        if (checkWhiteSpace(username)) {
            res.locals = {
                status: 401,
                message: "Kullanıcı adı boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }
        if (checkWhiteSpace(email)) {
            res.locals = {
                status: 401,
                message: "E-posta boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }
        if (password !== passwordAgain) {
            res.locals = {
                status: 401,
                message: "Parolalar uyuşmuyor."
            };
            return module.exports.sendResponse(req, res);
        }
        if (!checkMinLength(password, 8)) {
            res.locals = {
                status: 401,
                message: "Şifre en az 8 harf olmalıdır."
            };
            return module.exports.sendResponse(req, res);
        }
        if (!checkMaxLength(password, 42)) {
            res.locals = {
                status: 401,
                message: "Şifre 42 harften kısa olmalıdır."
            };
            return module.exports.sendResponse(req, res);
        }
        
        if (!validator.isEmail(email)) {
            res.locals = {
                status: 401,
                message: "Geçerli bir E-posta adresi girin."
            };
            return module.exports.sendResponse(req, res);
        }

        const emailFound = await User.findOne({ email });
        const usernameFound = await User.findOne({ username });
        const identityFound = await Teacher.findOne({ identityNum });
        
        if (emailFound || usernameFound || identityFound) {
            const message = (emailFound ? 'E-posta' : usernameFound ? 'Kullanıcı' : 'Kimlik') + ' zaten mevcüt.'
            res.locals = {
                status: 401,
                message
            };
            return module.exports.sendResponse(req, res);
        }

        const firstName = fullName.split(' ').slice(0, -1).join(' '),
                lastName = fullName.split(' ').slice(-1).join(' ');

        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            email,
            password: bcrypt.hashSync(password, 10),
            role: 'teacher',
            fullName
        });

        const token = setToken(
            {
                email: newUser.email,
                username: newUser.username,
                _id: newUser._id
            },
            jwtSecret
        );

        const refreshToken = setRefreshToken(
            {
                email: newUser.email,
                username: newUser.username,
                _id: newUser._id
            },
            jwtRefreshSecret
        );

        newUser.refreshToken = encryptToken(refreshToken);

        newUser.save().then(async user => {
            const newTeacher = new Teacher({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                firstName,
                lastName,
                identityNum,
                status: 'active'
            }).save().then(async teacher => {
                res.locals.status = 201;
                return module.exports.getTeachers(req, res);
            }).catch(async err => {
                await User.deleteOne({ _id: user._id});
                await Teacher.deleteOne({ _id: user._id });
                console.log(err);
                res.locals = {
                    status: 500,
                    message: err
                };
                return module.exports.sendResponse(req, res);
            });
        }).catch(err => {
            console.log(err);
            res.locals = {
                status: 500,
                message: err
            };
            return module.exports.sendResponse(req, res);
        });
    },
    addStudent: async (req, res) => {
        let { username, email, password, passwordAgain, fullName, identityNum } = req.body;

        username = username?.toLowerCase().trim();
        email = email?.toLowerCase().trim();
        password = password?.trim();

        if (!username || !email || !password || !passwordAgain || !fullName || !identityNum) {
            res.locals = {
                status: 401,
                message: "Bütün alanları doldurun."
            };
            return module.exports.sendResponse(req, res);
        }
        if (checkWhiteSpace(password)) {
            res.locals = {
                status: 401,
                message: "Parola boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }
        if (checkWhiteSpace(username)) {
            res.locals = {
                status: 401,
                message: "Kullanıcı adı boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }
        if (checkWhiteSpace(email)) {
            res.locals = {
                status: 401,
                message: "E-posta boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }
        if (password !== passwordAgain) {
            res.locals = {
                status: 401,
                message: "Parolalar uyuşmuyor."
            };
            return module.exports.sendResponse(req, res);
        }
        if (!checkMinLength(password, 8)) {
            res.locals = {
                status: 401,
                message: "Şifre en az 8 harf olmalıdır."
            };
            return module.exports.sendResponse(req, res);
        }
        if (!checkMaxLength(password, 42)) {
            res.locals = {
                status: 401,
                message: "Şifre 42 harften kısa olmalıdır."
            };
            return module.exports.sendResponse(req, res);
        }
        
        if (!validator.isEmail(email)) {
            res.locals = {
                status: 401,
                message: "Geçerli bir E-posta adresi girin."
            };
            return module.exports.sendResponse(req, res);
        }

        const emailFound = await User.findOne({ email });
        const usernameFound = await User.findOne({ username });
        const identityFound = await Student.findOne({ identityNum });
        
        if (emailFound || usernameFound || identityFound) {
            const message = (emailFound ? 'E-posta' : usernameFound ? 'Kullanıcı' : 'Kimlik') + ' zaten mevcüt.'
            res.locals = {
                status: 401,
                message
            };
            return module.exports.sendResponse(req, res);
        }

        const firstName = fullName.split(' ').slice(0, -1).join(' '),
                lastName = fullName.split(' ').slice(-1).join(' ');

        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            email,
            password: bcrypt.hashSync(password, 10),
            role: 'student',
            fullName
        });

        const token = setToken(
            {
                email: newUser.email,
                username: newUser.username,
                _id: newUser._id
            },
            jwtSecret
        );

        const refreshToken = setRefreshToken(
            {
                email: newUser.email,
                username: newUser.username,
                _id: newUser._id
            },
            jwtRefreshSecret
        );

        newUser.refreshToken = encryptToken(refreshToken);

        newUser.save().then(async user => {
            const newTeacher = new Student({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                firstName,
                lastName,
                identityNum,
                status: 'active'
            }).save().then(async teacher => {
                res.locals.status = 201;
                return module.exports.getStudents(req, res);
            }).catch(async err => {
                await User.deleteOne({ _id: user._id});
                await Student.deleteOne({ _id: user._id });
                console.log(err);
                res.locals = {
                    status: 500,
                    message: err
                };
                return module.exports.sendResponse(req, res);
            });
        }).catch(err => {
            console.log(err);
            res.locals = {
                status: 500,
                message: err
            };
            return module.exports.sendResponse(req, res);
        });
    },
    addLesson: async (req, res) => {
        let { name, lessonCode, hasPrerequisite, prerequisiteCode, classNo, teacherID } = req.body;

        name = name?.toLowerCase().trim();
        lessonCode = lessonCode?.toLowerCase().trim();
        classNo = classNo?.trim();
        teacherID = teacherID?.toLowerCase().trim();

        if (!name || !lessonCode || !classNo || !teacherID) {
            res.locals = {
                status: 401,
                message: "Bütün alanları doldurun."
            };
            return module.exports.sendResponse(req, res);
        }

        if (hasPrerequisite && !prerequisiteCode) {
            res.locals = {
                status: 401,
                message: "Ders öncüllükleri eksik."
            };
            return module.exports.sendResponse(req, res);
        }

        if (checkWhiteSpace(lessonCode) || checkWhiteSpace(teacherID) || checkWhiteSpace(classNo)) {
            res.locals = {
                status: 401,
                message: "Veriler boşluk içeremez."
            };
            return module.exports.sendResponse(req, res);
        }

        const foundTeacher = await Teacher.findOne({ _id: teacherID });

        if (!foundTeacher) {
            res.locals = {
                status: 401,
                message: "Öğretmen bulunamadı."
            };
            return module.exports.sendResponse(req, res);
        }

        const prerequisiteId = [];

        let allLessons = await Lesson.find().exec();

        if (hasPrerequisite) {
            for (let i = 0; i < prerequisiteCode.length; i++) {
                const code = prerequisiteCode[i].toString();
                const foundPrerequisite = await Lesson.findOne({ lessonCode: code }).exec();

                if (!foundPrerequisite) {
                    res.locals = {
                        status: 401,
                        message: "Öncüllük ders bulunamadı."
                    };
                    return module.exports.sendResponse(req, res);
                }

                prerequisiteId.push(foundPrerequisite._id);
            }
        }

        const newLesson = new Lesson({
            _id: new mongoose.Types.ObjectId(),
            name,
            lessonCode,
            hasPrerequisite,
            prerequisiteCode,
            prerequisiteId,
            classNo,
            teacher: teacherID,
        }).save().then(lesson => {
            res.locals.status = 201;
            return module.exports.getLessons(req, res);
        }).catch(err => {
            console.log(err);
            res.locals = {
                status: 500,
                message: err
            };
            return module.exports.sendResponse(req, res);
        });
    }
};