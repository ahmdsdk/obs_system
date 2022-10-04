import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniDrawer from './MiniDrawer';
import Teachers from './Teachers';
import Students from './Students';
import Lessons from './Lessons';
import Home from './Home';
import { apiCall } from '../api';

const AdminDashboard = ({ userData, setUserData, setToken, token }) => {
    const navigate = useNavigate();
    const [allTeachers, setAllTeachers] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [allLessons, setAllLessons] = useState([]);
    const [panelItems, setPanelItems] = useState([
        {text: 'Ana Sayfa', path: 'home', isHovered: false, isSelected: true},
        {text: 'Öğretmenler', path: 'students', isHovered: false, isSelected: false},
        {text: 'Öğrenciler', path: 'teachers', isHovered: false, isSelected: false},
        {text: 'Dersler', path: 'lessons', isHovered: false, isSelected: false},
        {text: 'Çıkış', path: 'logout', isHovered: false, isSelected: false},
      ]);

    useEffect(() => {
        if (userData.role !== 'admin') {
            return navigate('/dashboard');
        }
        getAllTeachers();
        getAllStudents();
        getAllLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logOut = async (e) => {
        e.preventDefault();

        await apiCall('DELETE', '/logout');
        return navigate('/');
    }

    const getAllTeachers = async () => {
        const response = await apiCall('GET', '/teachers', {token});
        
        if (response.status === 200) {
            setAllTeachers(response.data);
        }
    }

    const getAllStudents = async () => {
        const response = await apiCall('GET', '/students', {token});
        
        if (response.status === 200) {
            setAllStudents(response.data);
        }
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
                <Teachers userData={userData} setUserData={setUserData} setToken={setToken} token={token} allTeachers={allTeachers} setAllTeachers={setAllTeachers} />,
                <Students userData={userData} setUserData={setUserData} setToken={setToken} token={token} allStudents={allStudents} setAllStudents={setAllStudents}/>,
                <Lessons userData={userData} setUserData={setUserData} setToken={setToken} token={token} allLessons={allLessons} setAllLessons={setAllLessons} allTeachers={allTeachers} />
            ]}
            />
    )
}

export default AdminDashboard;