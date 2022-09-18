import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import toast, { Toaster } from 'react-hot-toast';
import Table from './Table';
import { apiCall } from '../api';

const columns = [
    { field: 'id', headerName: 'Kimlik', minWidth: 120, editable: true, },
    { field: 'username', headerName: 'Öğretmen Numarası', width: 150, editable: true, },
    { field: 'firstName', headerName: 'Ad', width: 100, editable: true,  },
    { field: 'lastName', headerName: 'Soyad', width: 100, editable: true,  },
    { field: 'createdAt', headerName: 'Giriş Tarihi', type: 'date', width: 200, editable: false, },
    { field: 'updatedAt', headerName: 'Güncel Tarihi', type: 'date', width: 200, editable: false, },
    { 
        field: 'status',
        headerName: 'Durumu',
        type: 'singleSelect',
        valueOptions: ['pending', 'active', 'inactive', 'banned', 'restricted'],
        width: 120,
        editable: true,
    },
    {
        field: "action",
        headerName: "",
        sortable: false,
        renderCell: (params) => {
          const onClick = (e) => {
            e.stopPropagation();
    
            const api: GridApi = params.api;
            const thisRow: Record<string, GridCellValue> = {};
    
            api
              .getAllColumns()
              .filter((c) => c.field !== "__check__" && !!c)
              .forEach(
                (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
              );
    
            return alert(JSON.stringify(thisRow, null, 4));
          };
    
          return <Button onClick={onClick}>KAYDET</Button>;
        }
      },
  ];

const Teachers = ({ userData, setUserData, token, setToken, allTeachers, setAllTeachers }) => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isAddTeacher, setIsAddTeacher] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("false");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("false");
    const [identityNum, setIdentityNum] = useState("");
    const [identityNumError, setIdentityNumError] = useState("false");
    const [fullName, setFullName] = useState("");
    const [fullNameError, setFullNameError] = useState("false");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("false");

    useEffect(() => {
        if (userData.role !== 'admin') {
            return navigate('/dashboard');
        }
        setData(allTeachers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setData = async (teachers) => {
        const _teachers = JSON.parse(JSON.stringify(teachers));

        _teachers.forEach(t => {
            t.id = t.identityNum;
            const createdAt = new Date(t.createdAt);
            t.createdAt = createdAt.getDate() + "/" + createdAt.toLocaleString('default', { month: '2-digit' }) + "/" + createdAt.getFullYear() + " " + createdAt.toLocaleTimeString();
            const updatedAt = new Date(t.updatedAt);
            t.updatedAt = updatedAt.getDate() + "/" + updatedAt.toLocaleString('default', { month: '2-digit' }) + "/" + updatedAt.getFullYear() + " " + updatedAt.toLocaleTimeString();
            return t;
        });

        setRows(_teachers);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !identityNum || !fullName || !password) {
            setUsernameError(!username ? "true" : "false");
            setEmailError(!email ? "true" : "false");
            setIdentityNumError(!identityNum ? "true" : "false");
            setFullNameError(!fullName ? "true" : "false");
            setPasswordError(!password ? "true" : "false");
            return toast.error('Bütün alanları doldurun.');
        }

        return addTeacher();
    }

    const addTeacher = async () => {
        const data = {
            token,
            username,
            email,
            password,
            passwordAgain: password,
            fullName,
            identityNum
        };

        const response = await apiCall('POST', '/add_teacher', data);

        if (response.status === 201) {
            setUserData(response.user);
            setToken(response.token);
            setAllTeachers(response.data);
            setIsAddTeacher(false);
            setData(response.data);
        } else {
            setUsernameError(response.message.includes('Kullanıcı') ? "true" : "false");
            setEmailError(response.message.includes('E-posta') ? "true" : "false");
            setIdentityNumError(response.message.includes('Kimlik') ? "true" : "false");
            setPasswordError(response.message.includes('Parola') || response.message.includes('Şifre') ? "true" : "false");
            
            return toast.error(response.message);
        }
    }

    const handleChange = (e, type) => {
        switch (type) {
            case "username":
                setUsernameError(e.target.value === username ? "true" : "false");
                return setUsername(e.target.value);
            case "email":
                setEmailError(e.target.value === email ? "true" : "false");
                return setEmail(e.target.value);
            case "identityNum":
                setIdentityNumError(e.target.value === identityNum ? "true" : "false");
                return setIdentityNum(e.target.value);
            case "fullName":
                setFullNameError(e.target.value === fullName ? "true" : "false");
                return setFullName(e.target.value);
            case "password":
                setPasswordError(e.target.value === password ? "true" : "false");
                return setPassword(e.target.value);
            default:
                return;
        }
    }

    const showTeachers = (
        <div>
            <Typography paragraph>Öğretmenler Listesi:</Typography>
            <Table rows={rows} columns={columns}/>
            <button
                onClick={() => setIsAddTeacher(!isAddTeacher)}
                className="submit__btn"
                >Yeni Öğretmen Ekle</button>
        </div>
    );

    const showAddTeacher = (
        <div className="dashboard__container">
            <form className="login__form" onSubmit={handleSubmit}>
                <input
                    // ref={idRef}
                    error={usernameError}
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => handleChange(e, "username")}
                    />
                <input
                    type="email"
                    error={emailError}
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => handleChange(e, "email")}
                    />
                <input
                    error={identityNumError}
                    type="number"
                    placeholder="Kullanıcı Kimlik No"
                    value={identityNum}
                    onChange={(e) => handleChange(e, "identityNum")}
                    />
                <input
                    type="text"
                    error={fullNameError}
                    placeholder="Ad / Soyad"
                    value={fullName}
                    onChange={(e) => handleChange(e, "fullName")}
                    />
                <input
                    type="password"
                    error={passwordError}
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => handleChange(e, "password")}
                    />
                <button
                    className="submit__btn"
                    >Kaydet</button>
            </form>
            <button
                onClick={() => setIsAddTeacher(!isAddTeacher)}
                className="submit__btn"
                >Öğretmenler Listesi</button>
            <Toaster />
        </div>
    )

    return (
        isAddTeacher ? showAddTeacher : showTeachers
    )
}

export default Teachers;