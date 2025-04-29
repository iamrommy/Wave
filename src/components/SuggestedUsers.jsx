import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Profilepic from './ui/profilepic'
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setAuthUser, setSuggestedUsers } from '../redux/authSlice';
import axios from 'axios';
import { toast } from 'sonner';

const SuggestedUsers = () => {
    const { suggestedUsers, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    // State to track loading for each button
    const [loadingState, setLoadingState] = useState({});

    const followOrUnfollow = async (userId) => {
        try {
            setLoadingState(prev => ({ ...prev, [userId]: true })); // Set loading for this user

            const res = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}/user/followorunfollow/${userId}`, 
                {}, 
                { withCredentials: true }
            );

            if (res.data.success) {
                let targetUser = res.data.targetUser;

                targetUser = {//replacing the entire follower or following object 
                    ...targetUser,
                    followers: targetUser.followers.map((follower) => follower._id),
                    following: targetUser.following.map((following) => following._id)
                };
                const updatedSuggestedUserData = suggestedUsers.map(s_user => 
                    s_user._id === userId ? targetUser : s_user
                );

                dispatch(setSuggestedUsers(updatedSuggestedUserData));

                const updatedUserData = {
                    ...user,
                    following: res.data.user?.following,
                    followers: res.data.user?.followers,
                };
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong"); 
        } finally {
            setLoadingState(prev => ({ ...prev, [userId]: false })); // Reset loading
        }
    };

    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {suggestedUsers?.map((suggested) => (
                <div key={suggested._id} className='flex items-center justify-between my-5'>
                    <div className='flex items-center gap-2 mr-3'>
                        <Link to={`/profile/${suggested?._id}`}>
                            {/* <Avatar>
                                <AvatarImage src={suggested?.profilePicture} alt="post_image" />
                                <AvatarFallback className="text-white">{suggested?.username[0]}</AvatarFallback>
                            </Avatar> */}
                            <Profilepic url={suggested?.profilePicture}/>
                        </Link>
                        <div>
                            <h1 className='font-semibold text-sm'>
                                <Link to={`/profile/${suggested?._id}`}>{suggested?.username}</Link>
                            </h1>
                            <span className='text-gray-600 text-sm'>{suggested?.bio || 'Bio here...'}</span>
                        </div>
                    </div>
                    <span 
                        className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6] flex items-center'
                        onClick={() => followOrUnfollow(suggested?._id)}
                        disabled={loadingState[suggested._id]} 
                    >
                        {loadingState[suggested._id] ? (
                            <span className="loader2"></span>
                        ) : (
                            suggested.followers.includes(user?._id) ? 'Unfollow' : 'Follow'
                        )}
                    </span>
                </div>
            ))}

            {/* CSS Overrides for Loader */}
            <style>
                {`
                .loader:before { left: -1.5em !important; }
                .loader:after { left: 1.5em !important; }
                `}
            </style>
        </div>
    );
};

export default SuggestedUsers;
