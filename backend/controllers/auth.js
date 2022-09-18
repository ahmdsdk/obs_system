require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require("crypto");
const User = require('../models/User');

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
    sendResponse: async (req, res) => {
        const { status, user, token, refreshToken, options, message } = res.locals;
        
        if (refreshToken) {
            return res.status(status).cookie('refreshToken', refreshToken, options).json({
                status,
                user,
                token
            });
        } else {
            return res.status(status).cookie('refreshToken', "").json({
                status,
                message
            });
        }
    },
    verifyToken: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.locals = {
                status: 401,
                message: 'Token bulunamadı.'
            };
            return module.exports.sendResponse(req, res);
        }

        const user = checkToken(token, jwtSecret);

        if (!user) {
            res.locals = {
                status: 403,
                message: 'Token yanlış.'
            };
            return module.exports.sendResponse(req, res);
        }

        const { _id } = user;

        User.findOne({ _id }).then(async userFound => {
            if (!userFound) {
                res.locals = {
                    status: 401,
                    message: 'Kullanıcı bulunamadı.'
                };
                return module.exports.sendResponse(req, res);
            }
            let encryptedToken = userFound.refreshToken;

            let refreshToken = decryptToken(encryptedToken);

            const validToken = checkToken(refreshToken, jwtRefreshSecret);

            if (!validToken) {
                refreshToken = setRefreshToken(
                    {
                        email: userFound.email,
                        username: userFound.username,
                        _id: userFound._id
                    },
                    jwtRefreshSecret
                );

                encryptedToken = encryptToken(refreshToken);

                userFound.refreshToken = encryptedToken;

                userFound.save().then(async user => {
                    const options = {
                        secure: process.env.NODE_ENV !== "development",
                        httpOnly: true,
                        expires: new Date(Date.now() + refreshExpiration)
                    };
                    
                    res.locals = {
                        status: 200,
                        user: await module.exports.getUserData(user),
                        token,
                        refreshToken,
                        options
                    };
                    next();
                }).catch(err => {
                    console.log(err);
                    res.locals = {
                        status: 500,
                        message: err
                    };
                    return module.exports.sendResponse(req, res);
                });
            }

            const { exp } = decodeToken(refreshToken);

            if (!exp) {
                res.locals = {
                    status: 403,
                    message: 'Token yanlış.'
                };
                return module.exports.sendResponse(req, res);
            }


            const options = {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: new Date(exp * 1000)
            };

            res.locals = {
                status: 200,
                user: await module.exports.getUserData(userFound),
                token,
                refreshToken,
                options
            };
            next();
        });
    },
    refreshToken: (req, res) => {
        const authHeader = req.headers['cookie'];
        const refreshToken = authHeader && authHeader.split('=')[1];

        if (!refreshToken) {
            res.locals = {
                status: 401,
                message: 'Token bulunamadı.'
            };
            return module.exports.sendResponse(req, res);
        }

        const user = checkToken(refreshToken, jwtRefreshSecret);
        if (!user) {
            res.locals = {
                status: 403,
                message: 'Token yanlış.'
            };
            return module.exports.sendResponse(req, res);
        }

        const encryptedToken = encryptToken(refreshToken);

        User.findOne({ _id: user._id }).then(async userFound => {
            if (!userFound) {
                res.locals = {
                    status: 401,
                    message: 'Kullanıcı bulunamadı.'
                };
                return module.exports.sendResponse(req, res);
            }

            const decodedToken = decryptToken(userFound.refreshToken);

            if (decodedToken !== refreshToken) {
                res.locals = {
                    status: 403,
                    message: 'Token yanlış.'
                };
                return module.exports.sendResponse(req, res);
            }

            const token = setToken(
                {
                    email: user.email,
                    username: user.username,
                    _id: user._id
                },
                jwtSecret
            );

            const { exp } = decodeToken(refreshToken);

            if (!exp) {
                res.locals = {
                    status: 403,
                    message: 'Token yanlış.'
                };
                return module.exports.sendResponse(req, res);
            }

            const options = {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: new Date(exp * 1000)
            };

            res.locals = {
                status: 201,
                user: await module.exports.getUserData(userFound),
                token,
                refreshToken,
                options
            };

            return module.exports.sendResponse(req, res);
        });
    },
    createAdmin: async (req, res) => {
        let { username, email, password, passwordAgain } = req.body;

        username = username?.toLowerCase().trim();
        email = email?.toLowerCase().trim();
        password = password?.trim();
        passwordAgain = passwordAgain?.trim();

        const adminFound = await User.findOne({ role: 'admin' });

        if (adminFound) {
            res.locals = {
                status: 401,
                message: "Admin hesabi zaten mevcüt."
            };
            return module.exports.sendResponse(req, res);
        }
        if (!username || !email || !password || !passwordAgain) {
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
                message: "Geçerli bir e-posta adresi girin."
            };
            return module.exports.sendResponse(req, res);
        }

        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            email,
            password: bcrypt.hashSync(password, 10),
            role: 'admin',
            fullName: 'admin'
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

        const options = {
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            expires: new Date(Date.now() + refreshExpiration)
        };

        newUser.save().then(async user => {
            res.locals = {
                status: 201,
                user: await module.exports.getUserData(user),
                token,
                refreshToken,
                options
            };

            return module.exports.sendResponse(req, res);
        }).catch(err => {
            console.log(err);
            res.locals = {
                status: 500,
                message: err
            };
            return module.exports.sendResponse(req, res);
        });

    },
    login: async (req, res) => {
        let { username, password, authType } = req.body;
        username = username?.toLowerCase().trim();
        password = password?.trim();

        if (!authType) {
            res.locals = {
                status: 401,
                message: "Eksik bilgi."
            };
            return module.exports.sendResponse(req, res);
        }
        if (!username || !password) {
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
        const userFound = await User.findOne({ username });

        if (!userFound) {
            res.locals = {
                status: 401,
                message: 'Kullanıcı bulunamadı.'
            };
            return module.exports.sendResponse(req, res);
        }

        if (userFound && userFound.role !== authType) {
            res.locals = {
                status: 401,
                message: `Yanlış ${authType} hesabı.`
            };
            return module.exports.sendResponse(req, res);
        }

        const match = await bcrypt.compare(password, userFound.password);

        if (!match) {
            res.locals = {
                status: 400,
                message: 'Şifre yanlış.'
            };
            return module.exports.sendResponse(req, res);
        }

        const token = setToken(
            {
                email: userFound.email,
                username: userFound.username,
                _id: userFound._id
            },
            jwtSecret
        );

        const refreshToken = setRefreshToken(
            {
                email: userFound.email,
                username: userFound.username,
                _id: userFound._id
            },
            jwtRefreshSecret
        );

        userFound.refreshToken = encryptToken(refreshToken);

        const options = {
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            expires: new Date(Date.now() + refreshExpiration)
        };

        userFound.save().then(async user => {
            res.locals = {
                status: 200,
                user: await module.exports.getUserData(user),
                token,
                refreshToken,
                options
            };

            return module.exports.sendResponse(req, res);
        }).catch(err => {
            console.log(err);
            res.locals = {
                status: 500,
                message: err
            };
            return module.exports.sendResponse(req, res);
        });
    },
    // logout function
    logout: (req, res) => {
        // const { refreshToken } = req.cookies;
        const authHeader = req.headers['cookie'];
        const refreshToken = authHeader && authHeader.split('=')[1];

        const options = {
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            expires: new Date(Date.now())
        };

        res.locals = {
            status: 200,
            refreshToken: "",
            message: "Log out successful.",
            options
        };

        module.exports.sendResponse(req, res);

        if (!refreshToken) {
            return;
        }

        const encryptedToken = encryptToken(refreshToken);

        User.findOne({ encryptedToken }).then(userFound => {
            if (!userFound) {
                return;
            }
            const user = checkToken(refreshToken, jwtRefreshSecret);

            if (!user) {
                return;
            }

            const newRefreshToken = setRefreshToken(
                {
                    email: userFound.email,
                    username: userFound.username,
                    _id: userFound._id
                },
                jwtRefreshSecret
            );

            userFound.refreshToken = encryptToken(newRefreshToken);
            userFound.save();
        });
    }
}