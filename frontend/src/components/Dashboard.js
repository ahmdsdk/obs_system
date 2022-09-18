import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from '../api';

const Dashboard = ({ userData, token }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (userData.role === 'admin') {
            return navigate('/admin_dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logOut = async (e) => {
        e.preventDefault();

        await apiCall('DELETE', '/logout');
        return navigate('/');
    }
    return (
        <div className="dashboard__main">
            <div className="dashboard__container">
                <h1>Merhaba, {userData.fullName.charAt(0).toUpperCase() + userData.fullName.slice(1).split("@")[0]}!</h1>
                <button
                    type="submit"
                    className="logout__btn"
                    onClick={(e) => logOut(e)}>Çıkış Yap</button>
            </div>
        </div>
    )
}

export default Dashboard;