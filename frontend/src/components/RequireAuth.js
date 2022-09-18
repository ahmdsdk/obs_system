import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireAuth = ({token}) => {
    const location = useLocation();

    return (
        token ? <Outlet /> : <Navigate to="/" state={{ from: location }} replace />
    )
}
export default RequireAuth;