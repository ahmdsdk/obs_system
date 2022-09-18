import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as Lesson } from "../../assets/icons/lesson.svg";

export default function LessonIcon(props) {
  return (
    <SvgIcon component={Lesson} viewBox="0 0 700 700" />
  );
}