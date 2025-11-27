import  {useNavigate} from 'react-router-dom';
import { useCallback } from 'react';


export const useAppNavigator = () => {
    const navigate = useNavigate();
    const ToLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const ToRegister = useCallback(() => {
        navigate('/register');
    }, [navigate]);

    const ToForgotPassword = useCallback(() => {
        navigate('/forgot-password');
    }, [navigate]);
    const ToHome = useCallback(() => {
        navigate('/home');
    }, [navigate]);
    const ToViewUsers = useCallback(() => {
        navigate('/view-users');
    }, [navigate]);

    return {
        ToLogin,
        ToRegister,
        ToForgotPassword,
        ToHome,
        ToViewUsers
    };

};