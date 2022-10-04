import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import toast, { Toaster } from 'react-hot-toast';
import Table from './Table';
import { apiCall } from '../api';
import DropdownIcon from '../assets/icons/down-arrow.svg';

const columns = [
    { field: 'id', headerName: 'Ders No', minWidth: 120, editable: true, },
    { field: 'name', headerName: 'Der Adı', width: 150, editable: true, },
    { field: 'classNo', headerName: 'Sınıf', width: 100, editable: true,  },
    { field: 'prerequisiteCode', headerName: 'Öncüllük dersleri', width: 150, editable: true, },
    { field: 'teacher', headerName: 'Hoca Adı', width: 100, editable: true,  },
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

const Lessons = ({ userData, setUserData, token, setToken, allLessons, setAllLessons, allTeachers }) => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isAddLesson, setIsAddLesson] = useState(false);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("false");
    const [lessonCode, setLessonCode] = useState("");
    const [lessonCodeError, setLessonCodeError] = useState("false");
    const [hasPrerequisite, setHasPrerequisite] = useState(false);
    const [hasPrerequisiteError, setHasPrerequisiteError] = useState("false");
    const [prerequisiteCode, setPrerequisiteCode] = useState("");
    const [prerequisiteCodeError, setPrerequisiteCodeError] = useState("false");
    const [classNo, setClassNo] = useState("");
    const [classNoError, setClassNoError] = useState("false");
    const [teacher, setTeacher] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [teacherError, setTeacherError] = useState("false");
    const [isDropdown, setIsDropdown] = useState(false);

    useEffect(() => {
        if (userData.role !== 'admin' && userData.role !== 'teacher' && userData.role !== 'student') {
            return navigate('/dashboard');
        }
        setData(allLessons);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setData = async (lessons) => {
        const _lessons = JSON.parse(JSON.stringify(lessons));

        _lessons.forEach(t => {
            t.id = t.lessonCode;
            const createdAt = new Date(t.createdAt);
            t.createdAt = createdAt.getDate() + "/" + createdAt.toLocaleString('default', { month: '2-digit' }) + "/" + createdAt.getFullYear() + " " + createdAt.toLocaleTimeString();
            const updatedAt = new Date(t.updatedAt);
            t.updatedAt = updatedAt.getDate() + "/" + updatedAt.toLocaleString('default', { month: '2-digit' }) + "/" + updatedAt.getFullYear() + " " + updatedAt.toLocaleTimeString();
            return t;
        });

        setRows(_lessons);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !lessonCode || !classNo || !teacher) {
            setNameError(!name ? "true" : "false");
            setLessonCodeError(!lessonCode ? "true" : "false");
            setClassNoError(!classNo ? "true" : "false");
            setTeacherError(!teacher ? "true" : "false");
            return toast.error('Bütün alanları doldurun.');
        }

        if (hasPrerequisite && !prerequisiteCode) {
            console.log(hasPrerequisiteError, prerequisiteCodeError);
            setHasPrerequisite(hasPrerequisite);
            setHasPrerequisiteError("true");
            setPrerequisiteCodeError(!prerequisiteCode ? "true" : "false");
        }

        return addLesson();
    }

    const addLesson = async () => {
        const _prerequisiteCode = prerequisiteCode?.split(", ");
        const data = {
            token,
            name,
            lessonCode,
            hasPrerequisite,
            prerequisiteCode: _prerequisiteCode,
            classNo,
            teacherID
        };

        const response = await apiCall('POST', '/add_lesson', data);

        if (response.status === 201) {
            setUserData(response.user);
            setToken(response.token);
            setAllLessons(response.data);
            setIsAddLesson(false);
            setData(response.data);
        } else {
            setNameError(response.message.includes('adı') ? "true" : "false");
            setLessonCodeError(response.message.includes('kodu') ? "true" : "false");
            setHasPrerequisiteError(response.message.includes('öncüllükler') ? "true" : "false");
            setClassNoError(response.message.includes('Sınıf') ? "true" : "false");
            
            return toast.error(response.message);
        }
    }

    const handleChange = (e, type) => {
        switch (type) {
            case "name":
                setNameError(e.target.value === name ? "true" : "false");
                return setName(e.target.value);
            case "lessonCode":
                setLessonCodeError(e.target.value === lessonCode ? "true" : "false");
                return setLessonCode(e.target.value);
            case "hasPrerequisite":
                setHasPrerequisiteError(e.target.checked === hasPrerequisite ? "true" : "false");
                return setHasPrerequisite(e.target.checked);
            case "prerequisiteCode":
                setPrerequisiteCodeError(e.target.value === prerequisiteCode ? "true" : "false");
                return setPrerequisiteCode(e.target.value);
            case "classNo":
                setClassNoError(e.target.value === classNo ? "true" : "false");
                return setClassNo(e.target.value);
            case "teacher":
                setTeacherError(e.fullName === teacher ? "true" : "false");
                setTeacher(e.fullName);
                setTeacherID(e._id);
                return setIsDropdown(false);
            default:
                return;
        }
    }

    const showLessons = (
        <div>
            <Typography paragraph>Dersler Listesi:</Typography>
            <Table rows={rows} columns={columns}/>
            {(userData.role === 'admin' || userData.role === 'teacher') && <button
                onClick={() => setIsAddLesson(!isAddLesson)}
                className="submit__btn"
                >Yeni Ders Ekle</button>}
        </div>
    );

    const showAddLesson = (
        <div className="dashboard__container">
            <form className="login__form" onSubmit={handleSubmit}>
                <input
                    // ref={idRef}
                    error={nameError}
                    type="text"
                    placeholder="Ders Adı"
                    value={name}
                    onChange={(e) => handleChange(e, "name")}
                    />
                <input
                    type="text"
                    error={lessonCodeError}
                    placeholder="Ders Kodu"
                    value={lessonCode}
                    onChange={(e) => handleChange(e, "lessonCode")}
                    />
                <h5>{"Öncüllük Dersleri var mı?"}</h5>
                <input
                    type="checkbox"
                    defaultChecked={hasPrerequisite}
                    onChange={(e) => handleChange(e, "hasPrerequisite")}
                    />
                {hasPrerequisite &&
                (<input
                    type="text"
                    error={prerequisiteCode}
                    placeholder="Öncüllük ders kodları (BM2020, BM2023 ...)"
                    value={prerequisiteCode}
                    onChange={(e) => handleChange(e, "prerequisiteCode")}
                    />)}
                <input
                    type="number"
                    error={classNoError}
                    placeholder="Sınıf"
                    value={classNo}
                    onChange={(e) => handleChange(e, "classNo")}
                    />
                <div className="dropdown">
                    <div
                        error={teacherError}
                        onClick={(e) => setIsDropdown(!isDropdown)}
                        className={isDropdown ? "dropdown__container dropdown__container__focus" : "dropdown__container"}
                        >{teacher || "Öğretmen"}<img alt="arrow" src={DropdownIcon}/></div>
                    
                    {isDropdown && (
                        <div className='dropdown__elements'>
                            {allTeachers.length > 0 && allTeachers.map((t, idx) => {
                                return (
                                    <div key={idx} onClick={() => handleChange(t, "teacher")}>{t.fullName}</div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <button
                    className="submit__btn"
                    >Kaydet</button>
            </form>
            <button
                onClick={() => setIsAddLesson(!isAddLesson)}
                className="submit__btn"
                >Dersler Listesi</button>
            <Toaster />
        </div>
    )

    return (userData.role === 'admin' || userData.role === 'teacher') && isAddLesson ? showAddLesson : showLessons;
}

export default Lessons;