import React, { useLayoutEffect, useState } from 'react'
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger, DialogHeader} from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { FaBookmark, FaRegBookmark  } from "react-icons/fa";
import { Button } from './ui/button'
import Profilepic from './ui/profilepic';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setActiveTab, setOpenPost } from '../redux/miscelaneousSlice';
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { setAuthUser, setUserProfile } from '../redux/authSlice';
import { Link } from 'react-router-dom';
import { setFeedPosts } from '../redux/postSlice';

const Post = ({ post, whichPost}) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user, userProfile} = useSelector(store => store.auth);
    // console.log(user);
    const { posts, feedPosts } = useSelector(store => store.post);
    const [openDialog, setOpenDialog] = useState(false);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const {openPost} = useSelector(store => store.miscelaneous)
    useLayoutEffect(() => {
        if (openPost && whichPost !== "recommendedPosts") {
            window.scrollTo(0, 0);
        }
    }, [openPost]);
    
    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/post/${post._id}/${action}`, { withCredentials: true });
            // console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                if(whichPost === "profilePost"){
                    const updatedUserProfilePostData = userProfile.posts.map(p =>
                        p._id === post._id ? {
                            ...p,
                            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                        } : p
                    );
                    const updatedUserProfileData = {...userProfile, posts : updatedUserProfilePostData}
                    dispatch(setUserProfile(updatedUserProfileData));
                    toast.success(res.data.message);
                }
                else if(whichPost === "feedPosts"){
                    const updatedPostData = feedPosts.map(p =>
                        p._id === post._id ? {
                            ...p,
                            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                        } : p
                    );
                    dispatch(setFeedPosts(updatedPostData));
                    toast.success(res.data.message);
                }
                else if(whichPost === "recommendedPosts"){
                    const updatedPostData = posts.map(p =>
                        p._id === post._id ? {
                            ...p,
                            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                        } : p
                    );
                    dispatch(setPosts(updatedPostData));
                    toast.success(res.data.message);
                }
                else if(whichPost === "profileBookmark"){
                    const updatedBookmarksData = userProfile?.bookmarks.map(p =>
                        p._id === post._id ? {
                            ...p,
                            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                        } : p
                    );
                    const updatedUserProfileData = {...userProfile, bookmarks : updatedBookmarksData}
                    dispatch(setUserProfile(updatedUserProfileData));
                    toast.success(res.data.message);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedCommentData = [...post.comments, res.data.comment];

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/post/${post?._id}/bookmark`, { withCredentials: true });
    
            if (res.data.success) {
                dispatch(setAuthUser(res.data?.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update bookmark status");
        }
    };
    
    return (
        <div className='my-8 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2' onClick={()=>/*{if(whichPost==="profilePost"||whichPost==="profileBookmark")*/{dispatch(setActiveTab('posts')); dispatch(setOpenPost(null))}}>
                    <Link to={`/profile/${post?.author?._id}`}>
                        {/* <Avatar>
                            <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                            <AvatarFallback className="text-white">{post.author?.username[0]}</AvatarFallback>
                        </Avatar> */}
                        <Profilepic url={post?.author?.profilePicture}/>
                    </Link>
                    <div className='flex items-center gap-3'>
                        <h1>{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>
                { post?.author?._id === user?._id && 
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center text-gray-400">
                        {/* {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                        } */}
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
                }
            </div>
            <img
                className='rounded-sm my-2 w-full aspect-square object-cover'
                src={post.image}
                alt="post_img"
            />

            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                    }

                    <MessageCircle onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer hover:text-gray-600' />
                </div>
                {
                    user?.bookmarks?.includes(post._id) ?
                    (<FaBookmark  onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' /> )
                    : (<FaRegBookmark  onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' /> )
                }
            </div>
            <span onClick={()=>setOpenDialog(true)} className='font-medium block mb-2 cursor-pointer'>{postLike} likes</span>
            <p>
                <span className='font-medium mr-2'>{post.author?.username}</span>
                {post.caption}
            </p>
            {
                post.comments.length > 0 && (
                    <span onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer text-sm text-gray-400'>View all {post.comments.length} comments</span>
                )
            }
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full'
                />
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                }

            </div>

            <Dialog open={openDialog}>
              <DialogContent
                onInteractOutside={() => setOpenDialog(false)}
                aria-describedby={undefined}
              >
                <DialogHeader className="text-center font-semibold text-white">
                  Likes
                </DialogHeader>
                <div
                  id="dialog-description"
                  className="flex flex-col gap-3 max-h-80 overflow-y-auto"
                >
                  {post?.likes?.length > 0 ? (
                    post?.likes.map((dialogUser) => {
                      return (
                        <div key={dialogUser._id+"H"} className="flex items-center gap-3 justify-between">
                          <Link className="flex items-center gap-3" to={`/profile/${dialogUser?._id}`} onClick={() => setOpenDialog(false)}>
                
                            <Profilepic url={dialogUser?.profilePicture} classes={'h-10 w-10'}/>
                            <span className="text-white">{dialogUser.username}</span>
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center">No likes</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

        </div>
    )
}

export default Post