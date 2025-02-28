// import React from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { Link } from 'react-router-dom';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { setAuthUser, setSuggestedUsers } from '../redux/authSlice';
// import axios from 'axios';
// import { toast } from 'sonner';

// const SuggestedUsers = () => {
//     const { suggestedUsers } = useSelector(store => store.auth);
//     const { user } = useSelector(store => store.auth);
//     const dispatch = useDispatch();
//     const followOrUnfollow = async (userId) => {
//         try {
//             const res = await axios.post(
//                 `${import.meta.env.VITE_APP_BASE_URL}/user/followorunfollow/${userId}`, 
//                 {}, 
//                 { withCredentials: true }
//             );
//             console.log(res.data.targetUser, res.data.user, suggestedUsers);

//             if (res.data.success) {

//                 const updatedSuggestedUserData = suggestedUsers.map(s_user => s_user._id === userId ? res.data.targetUser : s_user);
//                 // console.log(updatedSuggestedUserData);
//                 dispatch(setSuggestedUsers(updatedSuggestedUserData));

//                 const updatedUserData = {
//                     ...user,
//                     following: res.data.user?.following,
//                     followers: res.data.user?.followers,
//                 };
//                 // console.log(updatedUserData)
//                 dispatch(setAuthUser(updatedUserData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//             toast.error(error.response?.data?.message || "Something went wrong"); 
//         }
//       };

//     return (
//         <div className='my-10'>
//             <div className='flex items-center justify-between text-sm'>
//                 <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
//                 <span className='font-medium cursor-pointer'>See All</span>
//             </div>
//             {
//                 suggestedUsers.map((suggested) => {
                    
//                     return (
//                         <div key={suggested._id} className='flex items-center justify-between my-5'>
//                             <div className='flex items-center gap-2'>
//                                 <Link to={`/profile/${suggested?._id}`}>
//                                     <Avatar>
//                                         <AvatarImage src={suggested?.profilePicture} alt="post_image" />
//                                         <AvatarFallback>CN</AvatarFallback>
//                                     </Avatar>
//                                 </Link>
//                                 <div>
//                                     <h1 className='font-semibold text-sm'><Link to={`/profile/${suggested?._id}`}>{suggested?.username}</Link></h1>
//                                     <span className='text-gray-600 text-sm'>{suggested?.bio || 'Bio here...'}</span>
//                                 </div>
//                             </div>
//                             {
//                                 suggested.followers.includes(user?._id) ? (
//                                     <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]' onClick={()=>followOrUnfollow(suggested?._id)}>
//                                         {/* {
//                                             loading ? (<span className="loader"></span>) : ( */}
//                                             <span>Unfollow</span>
//                                         {/* )
//                                         } */}
//                                     </span>
//                                 ) : (
//                                     <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]' onClick={()=>followOrUnfollow(suggested?._id)}>
//                                         {/* {
//                                             loading ? (<span className="loader"></span>) : ( */}
//                                             <span>Follow</span>
//                                         {/* )
//                                         } */}
//                                     </span>
//                                 )
//                             }
//                             {/* <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'>Follow</span> */}
//                         </div>
//                     )
//                 })
//             }

//         </div>
//     )
// }

// export default SuggestedUsers

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
                const updatedSuggestedUserData = suggestedUsers.map(s_user => 
                    s_user._id === userId ? res.data.targetUser : s_user
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
            {suggestedUsers.map((suggested) => (
                <div key={suggested._id} className='flex items-center justify-between my-5'>
                    <div className='flex items-center gap-2'>
                        <Link to={`/profile/${suggested?._id}`}>
                            <Avatar>
                                <AvatarImage src={suggested?.profilePicture} alt="post_image" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
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
