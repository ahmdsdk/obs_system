import { useState } from 'react';
import Login from './Login';

const Public = ({ setUserData, setToken, loading, userData }) => {
    const [loginType, setLoginType] = useState("");
    const [isLogin, setIsLogin] = useState(false);

    const toggleUser = (userType) => {
        setLoginType(userType);
        setIsLogin(true);
    }
    
  return (
    <div className="app">

      <div className="auth__container">

        {loading ?
            (<p>Yükleniyor...</p>)
            :
            isLogin ? 
            (<Login
                loginType={loginType}
                setIsLogin={setIsLogin}
                setUserData={setUserData}
                setToken={setToken}
                />)
            :
            (<div className="public__container">
                <p>OBS Hoşgeldiniz!</p>
                <button
                    onClick={() => toggleUser("admin")}
                    type="submit"
                    className="submit__btn">Admin Girişi</button>
                <button
                    onClick={() => toggleUser("teacher")}
                    type="submit"
                    className="submit__btn">Öğretmen Girişi</button>
                <button
                    onClick={() => toggleUser("student")}
                    type="submit"
                    className="submit__btn">Öğrenci Girişi</button>
            </div>)
        }

      </div>
    </div>
  );
}

export default Public;