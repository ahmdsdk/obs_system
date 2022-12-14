import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniDrawer from './MiniDrawer';
import Lessons from './Lessons';
import Home from './Home';
import { apiCall } from '../api';

const Dashboard = ({ userData, setUserData, setToken, token }) => {
    const navigate = useNavigate();
    const [allLessons, setAllLessons] = useState([]);
    const [panelItems, setPanelItems] = useState([
        {text: 'Ana Sayfa', path: 'home', isHovered: false, isSelected: true},
        {text: 'Dersler', path: 'lessons', isHovered: false, isSelected: false},
        {text: 'Çıkış', path: 'logout', isHovered: false, isSelected: false},
      ]);

    useEffect(() => {
        if (userData.role === 'admin') {
            return navigate('/admin_dashboard');
        } else if (userData.role === 'teacher') {
            return navigate('/teacher_dashboard');
        }
        getAllLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logOut = async (e) => {
        e.preventDefault();

        await apiCall('DELETE', '/logout');
        return navigate('/');
    }

    const getAllLessons = async () => {
        const response = await apiCall('GET', '/lessons', {token});
        
        if (response.status === 200) {
            setAllLessons(response.data);
        }
    }

    return (
        <MiniDrawer
            userData={userData}
            logOut={logOut}
            panelItems={panelItems}
            setPanelItems={setPanelItems}
            components={[
                <Home userData={userData} setUserData={setUserData} setToken={setToken} token={token} />,
                <Lessons userData={userData} setUserData={setUserData} setToken={setToken} token={token} allLessons={allLessons} setAllLessons={setAllLessons} />
            ]}
            />
    )
}

export default Dashboard;