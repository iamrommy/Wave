import React, { useEffect, useRef, useState } from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import axios from 'axios';
import { IoArrowBack } from "react-icons/io5";
import { toast } from 'sonner';
import { setAuthUser, setUserProfile } from '../redux/authSlice';
import { setActiveTab, setOpenPost } from '../redux/miscelaneousSlice';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import Profilepic from './ui/profilepic';
import Post from './Post';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  // const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState([]);
  // const [openPost, setOpenPost] = useState(null);
  const [loadingState, setLoadingState] = useState({});
  const dispatch = useDispatch();
  const postRefs = useRef({});
  
  const {activeTab, openPost} = useSelector(store => store.miscelaneous)
  const { userProfile, user } = useSelector(store => store.auth);
  
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  
  useEffect(()=>{
    dispatch(setActiveTab('posts')); dispatch(setOpenPost(null))
    return ()=>{
      dispatch(setUserProfile(null));
    }
  },[]);
  
  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const handleDialogOpen = (type) => {
    setDialogData(type === 'followers' ? userProfile.followers : userProfile.following);
    setOpenDialog(true);
  };

  const followOrUnfollow = async (userId, profileType) => {
    try {
      if(profileType === "userProfile"){ 
        setLoading(true);
      }
      else if(profileType === "anotherProfile"){
        setLoadingState(prev => ({ ...prev, [userId]: true })); // Set loading for this user
      }
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/user/followorunfollow/${userId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success ) {
        if(profileType === "userProfile"){ //if call is made from user profile
          const updatedTargetUserData = {
            ...userProfile,
            following: res.data.targetUser?.following,
            followers: res.data.targetUser?.followers,
          };
          dispatch(setUserProfile(updatedTargetUserData));
        }
        if(profileType === "anotherProfile" && params.id === user?._id){ //if call is made from dialog box and the userProfile is my own profile
          const updatedTargetUserData = {
            ...user,
            following: res.data.user?.following,
            followers: res.data.user?.followers,
          };
          dispatch(setUserProfile(updatedTargetUserData));
        }

        const updatedUserData = { // to update my own profile
          ...user,
          following: res.data.user?.following,
          followers: res.data.user?.followers,
        };
        dispatch(setAuthUser(updatedUserData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      if(profileType === "userProfile"){
        setLoading(false);
      }
      else if(profileType === "anotherProfile"){
        setLoadingState(prev => ({ ...prev, [userId]: false })); // Set loading for this user
      }
    }
  };

  useEffect(() => {
    if (openPost && postRefs.current[openPost._id]) {
      postRefs.current[openPost._id].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [openPost]);
  

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <>
      { !openPost ? 
        (
          <div className='flex max-w-5xl justify-center mx-auto pl-10'>
            
            {
              userProfile ? (
                <div className='flex flex-col gap-20 p-8'>
                <div className='grid grid-cols-2'>
                  <section className='flex items-center justify-center'>
                    {/* <Avatar className='h-32 w-32'>
                      {userProfile?.profilePicture ? (
                      <AvatarImage src={userProfile.profilePicture} alt="profilephoto" />
                      ) : null}
                      <AvatarFallback className="text-white">{userProfile.username[0]}</AvatarFallback>
                    </Avatar> */}
                    <Profilepic url={userProfile?.profilePicture} classes={'h-32 w-32'}/>
                  </section>
                  <section>
                    <div className='flex flex-col gap-5'>
                      <div className='flex items-center gap-2'>
                        <span>{userProfile?.username}</span>
                        {
                          isLoggedInUserProfile ? (
                            <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button></Link>
                          ) : (
                            userProfile?.followers?.some(follower => follower._id === user._id) ? (
                              <Button variant='destructive' className='h-8' onClick={() => followOrUnfollow(userId, "userProfile")}>
                                {loading ? (<span className="loader"></span>) : "Unfollow"}
                              </Button>
                            ) : (
                              <Button variant='secondary' className='bg-[#0095F6] hover:bg-[#3192d2] h-8' onClick={() => followOrUnfollow(userId, "userProfile")}>
                                {loading ? (<span className="loader"></span>) : "Follow"}
                              </Button>
                            )
                          )
                        }
                      </div>
                      <div className='flex items-center gap-4'>
                        <p><span className='font-semibold'>{userProfile?.posts?.length} </span>posts</p>
                        <p className='cursor-pointer' onClick={() => handleDialogOpen('followers')}>
                          <span className='font-semibold'>{userProfile?.followers?.length} </span>followers
                        </p>
                        <p className='cursor-pointer' onClick={() => handleDialogOpen('following')}>
                          <span className='font-semibold'>{userProfile?.following?.length} </span>following
                        </p>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                      </div>
                    </div>
                  </section>
                </div>

                <div className='border-t border-t-gray-200'>
                  <div className='flex items-center justify-center gap-10 text-sm'>
                    <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
                      POSTS
                    </span>
                    <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
                      SAVED
                    </span>
                  </div>
                  <div className='grid grid-cols-3 gap-1'>
                    {
                      displayedPost?.map((post) => (
                        <div key={post?._id} className='relative group cursor-pointer'>
                          <img src={post.image} onClick={()=>{dispatch(setOpenPost(post))}} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              ) : (
                <div className='h-screen w-screen flex items-center justify-center'>
                  <span className='loader3'></span>
                </div>
              )
            }

            {/* Followers/Following Dialog */}
            <Dialog open={openDialog}>
              <DialogContent
                onInteractOutside={() => setOpenDialog(false)}
                aria-describedby={undefined}
              >
                <DialogHeader className="text-center font-semibold text-white">
                  {dialogData === userProfile?.followers ? "Followers" : "Following"}
                </DialogHeader>
                <div
                  id="dialog-description"
                  className="flex flex-col gap-3 max-h-80 overflow-y-auto"
                >
                  {dialogData?.length > 0 ? (
                    dialogData.map((dialogUser) => {
                      const isFollowing = user?.following?.some((following) => following._id === dialogUser._id);
                      return (
                        <div key={dialogUser._id} className="flex items-center gap-3 justify-between">
                          <Link className="flex items-center gap-3" to={`/profile/${dialogUser?._id}`} onClick={() => setOpenDialog(false)}>
                            {/* <Avatar className="h-10 w-10">
                              <AvatarImage src={dialogUser.profilePicture} alt="profile" />
                              <AvatarFallback className="text-white">{dialogUser.username[0]}</AvatarFallback>
                            </Avatar> */}
                            <Profilepic url={dialogUser?.profilePicture} classes={'h-10 w-10'}/>
                            <span className="text-white">{dialogUser.username}</span>
                          </Link>
                          {dialogUser._id !== user._id && (
                            <Button
                              variant={isFollowing ? 'destructive' : 'secondary'}
                              className={`h-8 ${isFollowing ? 'bg-red-500 hover:bg-red-700' : 'bg-[#0095F6] hover:bg-[#3192d2]'}`}
                              onClick={() => followOrUnfollow(dialogUser._id, "anotherProfile")}
                              disabled={loadingState[dialogUser._id]} 
                            >
                              {loadingState[dialogUser._id] ? (
                                  <span className="loader2"></span>
                              ) : (
                                isFollowing ? 'Unfollow' : 'Follow'
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center">No users found</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

          </div>
        ) : (
          displayedPost && (
            <div className='flex-1 my-8 flex flex-col pl-[20%]'>
              <div onClick={() => dispatch(setOpenPost(null))} className='flex hover:bg-gray-800 hover:text-white p-2 pr-3 rounded-full w-min cursor-pointer gap-2'>
                <IoArrowBack className='text-xl mt-1'/>
                <span className='text-lg font-semibold'>Profile </span>
              </div>
              {displayedPost?.map((p) => (
                <Post key={p._id} post={p} whichPost={activeTab === 'posts' ? "profilePost" : "profileBookmark"} ref={(el) => (postRefs.current[p._id] = el)} />
              ))}
            </div>
          )
        )
      }
    </>
  );
};

export default Profile;
