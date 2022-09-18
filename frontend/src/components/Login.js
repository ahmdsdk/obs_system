import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../api';

const Login = ({ loginType, setIsLogin, setUserData, setToken }) => {
    const idRef = useRef();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("false");
    const [passwordError, setPasswordError] = useState("false");
    const navigate = useNavigate();

    useEffect(() => {
        idRef.current.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setUsernameError(!username ? "true" : "false");
            setPasswordError(!password ? "true" : "false");
            return toast.error('Bütün alanları doldurun.');
        }

        return logIn();
    }

    const handleChange = (e, type) => {
        switch (type) {
            case "username":
                setUsernameError(e.target.value === username ? "true" : "false");
                return setUsername(e.target.value);
            case "password":
                setPasswordError(e.target.value === password ? "true" : "false");
                return setPassword(e.target.value);
            default:
                return;
        }
    }

    const logIn = async () => {
        
        const data = {
            authType: loginType,
            username: username,
            password: password,
        }

        const response = await apiCall('POST', '/login', data);
        
        if (response.status === 200) {
            setUserData(response.user);
            setToken(response.token);

            const path = response.user.role === 'admin' ? '/admin_dashboard' : '/dashboard';
            return navigate(path);
        } else {
            setUsernameError(response.message.includes('Kullanıcı') ? "true" : "false");
            setPasswordError(response.message.includes('Parola') || response.message.includes('Şifre') ? "true" : "false");
            
            return toast.error(response.message);
        }
    }

    return (
        <div className="login">
            {loginType === "admin" ? <p>Admin, Merhaba!</p> : <p>Size verilmiş {loginType === "teacher" ? "öğretmen" : "öğrenci" } numarayla giriş yapin</p>}
            <form className="login__form" onSubmit={handleSubmit}>
                <input
                    ref={idRef}
                    error={usernameError}
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => handleChange(e, "username")}
                    />
                <input
                    type="password"
                    error={passwordError}
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => handleChange(e, "password")}
                    />
                <button
                    type="submit"
                    className="submit__btn" >Giriş</button>
            </form>
            <button
                onClick={() => setIsLogin(false)}
                type="submit"
                className="submit__btn" >Geri Dön</button>
            <Toaster />
        </div>
    )
}

export default Login;