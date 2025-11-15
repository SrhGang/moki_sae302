import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from "contexts/AuthContext";
import { useApiCall } from "hooks/useApiCall";



export const useAvatar = () => {
    const { apiCall } = useApiCall();
    const { user, setUser } = useAuthContext();


    const updateAvatar = async (profilePicture: string) => {
        try {
            if (!profilePicture) {
                return null;
            }

            const update = await apiCall(`/api/avatar/`, {
                method: 'PUT',
                withAuth: true,
                body: JSON.stringify({profilePicture})
            });

 
            // setUser({
            //     ...user,
            //     profileImage: update?.profileImage
            // });
            return user;
        } catch (e) {
            
        }
    }

    return { updateAvatar };
}

