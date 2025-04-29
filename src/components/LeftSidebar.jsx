import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import SearchUser from './SearchUser'
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { setSuggestedUsers, setUserProfile } from '../redux/authSlice'
import Profilepic from './ui/profilepic'
import { setMessages, setOnlineUsers } from '../redux/chatSlice'
import { setLikeNotification } from '../redux/rtnSlice'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const [open, setOpen] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(likeNotification.length);

    // Reset unread notifications count whenever new notifications arrive
    useEffect(() => {
        setUnreadNotifications(likeNotification.length);
    }, [likeNotification]);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/user/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                dispatch(setSuggestedUsers([]))
                dispatch(setOnlineUsers([]));
                dispatch(setMessages([]));
                dispatch(setLikeNotification([]));
                dispatch(setUserProfile(null));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Search') {
            setOpenSearch(true);
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Profilepic url={user?.profilePicture} classes={'!w-6 !h-6'} />
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]

    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>WΛVE</h1>
                <div>
                    {
                        sidebarItems.map((item, index) => {
                            return (
                                item.text === "Notifications" ? (
                                    <Popover key={index}>
                                        <PopoverTrigger asChild>
                                            <div
                                                onClick={() => {
                                                    sidebarHandler(item.text);
                                                    setUnreadNotifications(0);  // Reset count on click
                                                }}
                                                className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'
                                            >
                                                {item.icon}
                                                <span>{item.text}</span>
                                                {
                                                    unreadNotifications > 0 && (
                                                        <Button size='icon' className="rounded-full h-5 w-5 !bg-red-600 absolute bottom-6 left-6">
                                                            {unreadNotifications}
                                                        </Button>
                                                    )
                                                }
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div>
                                                {
                                                    likeNotification.length === 0 ? (
                                                        <p>No new notification</p>
                                                    ) : (
                                                        likeNotification.map((notification) => {
                                                            return (
                                                                <Link key={notification.userId} className='flex items-center gap-2 my-2' to={`/profile/${notification?.userDetails?._id}`}>
                                                                    <Profilepic url={notification.userDetails?.profilePicture} />
                                                                    <p className='text-sm'>
                                                                        <span className='font-bold'>{notification.userDetails?.username}</span> liked your post
                                                                    </p>
                                                                </Link>
                                                            )
                                                        })
                                                    )
                                                }
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                                        {item.icon}
                                        <span>{item.text}</span>
                                    </div>
                                )
                            )
                        })
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
            <SearchUser openSearch={openSearch} setOpenSearch={setOpenSearch} />
        </div>
    )
}

export default LeftSidebar