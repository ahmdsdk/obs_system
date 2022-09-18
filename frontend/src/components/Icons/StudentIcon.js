import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as Student } from "../../assets/icons/student.svg";

export default function StudentIcon(props) {
  return (
    <SvgIcon component={Student} viewBox="0 0 700 700" />
  );
}