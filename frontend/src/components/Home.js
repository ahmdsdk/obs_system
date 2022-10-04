import { useState } from 'react';
import { Typography } from "@mui/material";
import toast, { Toaster } from 'react-hot-toast';
import { apiCall } from '../api';

const Home = ({ userData, token, setToken, setUserData }) => {
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("false");
    const [oldPassword, setOldPassword] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("false");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [passwordAgainError, setPasswordAgainError] = useState("false");
    
    const changePassword = async () => {
        const data = {
            token,
            oldPassword,
            password,
            passwordAgain,
        };

        const response = await apiCall('PUT', '/change_password', data);

        if (response.status === 201) {
            setUserData(response.user);
            setToken(response.token);
            setIsChangePassword(false);
            toast.success("Şifre değiştirildi!");
        } else {
            setOldPasswordError(response.message.includes('Şifre yanlış') ? "true" : "false");
            setPasswordError(response.message.includes('Parola') || response.message.includes('Şifre') ? "true" : "false");
            setPasswordAgainError(response.message.includes('Parola') || response.message.includes('Şifre') ? "true" : "false");

            return toast.error(response.message);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !passwordAgain) {
            setPasswordError(!password ? "true" : "false");
            setPasswordAgainError(!passwordAgain ? "true" : "false");
            return toast.error('Bütün alanları doldurun.');
        }

        return changePassword();
    }

    const handleChange = (e, type) => {
        switch (type) {
            case "oldPassword":
                setOldPasswordError(e.target.value === oldPassword ? "true" : "false");
                return setOldPassword(e.target.value);
            case "password":
                setPasswordError(e.target.value === password ? "true" : "false");
                return setPassword(e.target.value);
            case "passwordAgain":
                setPasswordAgainError(e.target.value === password ? "true" : "false");
                return setPasswordAgain(e.target.value);
            default:
                return;
        }
    }

    const showChangePassword = (
        <div className="dashboard__container">
            <form className="login__form" onSubmit={handleSubmit}>
             <input
                    type="password"
                    error={oldPasswordError}
                    placeholder="Eski Şifre"
                    value={oldPassword}
                    onChange={(e) => handleChange(e, "oldPassword")}
                    />
                <input
                    type="password"
                    error={passwordError}
                    placeholder="Yeni Şifre"
                    value={password}
                    onChange={(e) => handleChange(e, "password")}
                    />
                <input
                    type="password"
                    error={passwordAgainError}
                    placeholder="Yeni Şifre Tekrar"
                    value={passwordAgain}
                    onChange={(e) => handleChange(e, "passwordAgain")}
                    />

                <button
                    className="submit__btn"
                    >Kaydet</button>
            </form>
            <button
                onClick={() => setIsChangePassword(!isChangePassword)}
                className="submit__btn"
                >Geri Dön</button>
            <Toaster />
        </div>
    );

    return isChangePassword ? showChangePassword : 
    (
        <div>
            <Typography variant="h4" gutterBottom>
                Merhaba, {userData.role === 'admin' ? 'admin' : userData.role === 'teacher' ? 'öğretmen' : 'öğrenci'}: {userData.fullName.charAt(0).toUpperCase() + userData.fullName.slice(1).split("@")[0]}!
            </Typography>
            <button
                onClick={() => setIsChangePassword(!isChangePassword)}
                type="submit"
                className="submit__btn" >Şifre Değiştir</button>
            <Toaster />
        </div>
    )
}

export default Home;