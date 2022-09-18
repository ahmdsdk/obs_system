import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as LogOut } from "../../assets/icons/logout.svg";

export default function LogOutIcon(props) {
  return (
    <SvgIcon component={LogOut} viewBox="0 0 700 700" />
  );
}