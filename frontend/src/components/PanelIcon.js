import { useState } from 'react';
import TeacherIcon from './Icons/TeacherIcon';
import StudentIcon from './Icons/StudentIcon';
import LessonIcon from './Icons/LessonIcon';
import LogOutIcon from './Icons/LogOutIcon';
import HomeIcon from '@mui/icons-material/Home';

export default function PanelIcon({ index, item }) {
    const [text] = useState(item.text.toLowerCase());

  return text.includes('ana') ? <HomeIcon /> :
            text.includes('öğretmen') ? <TeacherIcon /> :
            text.includes('öğrenci') ? <StudentIcon /> :
            text.includes('ders') ? <LessonIcon /> :
            text.includes('çıkış') ? <LogOutIcon />
            : null;
}
