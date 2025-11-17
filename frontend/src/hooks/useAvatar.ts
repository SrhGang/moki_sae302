import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from "contexts/AuthContext";
import { useApiCall } from "hooks/useApiCall";


export const useAvatar = () => {
    const { apiCall } = useApiCall();
    const { user, setUser } = useAuthContext();

const navigate = useNavigate();
    const updateAvatar = async (profilePicture: string) => {
        try {
            if (!profilePicture) {
                return null;
            }

            const update: {message: string; code: string; } = await apiCall(`/api/avatar/`, {
                method: 'PUT',
                withAuth: true,
                body: JSON.stringify({profilePicture})
            });

            if (update.code === "AVATAR_UPDATED"){console.log("Je vais rediriger");
            
                setUser({
                    ...user!,
                    profileImage: profilePicture
                });
            }

            // setUser({
            //     ...user,
            //     profileImage: update?.profileImage
            // });
            return update;
        } catch (e) {
            
        }
    }

    return { updateAvatar };
}

