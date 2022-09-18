require('dotenv').config();
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

const jwtRefreshSecret = process.env.JWT_REFRESH_TOKEN;

module.exports = {
    checkWhiteSpace: (string) => /\s/.test(string),
    checkMaxLength: (string, max) => string.length <= max,   
    checkMinLength: (string, min) => string.length >= min,
    setToken: (data, secret) => {
        const expiresIn = process.env.TOKEN_EXPIRATION;

        const token = jwt.sign(data, secret, {
            expiresIn
        });

        return token;
    },
    setRefreshToken: (data, secret) => {
        const expiresIn = process.env.REFRESH_EXPIRATION;

        const refreshToken = jwt.sign(data, secret, {
            expiresIn
        });

        return refreshToken;
    },
    checkToken: (token, secret) => {
        return jwt.verify(token, secret, (err, user) => {
            if (err) {
                return false;
            }

            return user;
        });
    },
    decodeToken: (token) => {
        const decodedToken = jwt.decode(token, {
            complete: true
        });
        
        if (!decodedToken) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `provided token does not decode as JWT`);
        }

        return decodedToken.payload;
    },
    encryptToken: (token) => {
        const encryptedToken = CryptoJS.AES.encrypt(token, jwtRefreshSecret).toString();

        return encryptedToken;
    },
    decryptToken: (cipher) => {
        const token = CryptoJS.AES.decrypt(cipher, jwtRefreshSecret).toString(CryptoJS.enc.Utf8);

        return token;
    }
};