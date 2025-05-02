import React from 'react';
import { Link } from 'react-router-dom';
import Profilepic from './ui/profilepic';
import { setActiveTab, setOpenPost } from '../redux/miscelaneousSlice';
import { useDispatch } from 'react-redux';

const Comment = ({ comment }) => {
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch(setActiveTab('posts'));
        dispatch(setOpenPost(null));
        window.scrollTo(0, 0); 
    };

    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center' onClick={handleClick}>
                <Link to={`/profile/${comment?.author?._id}`}>
                    <Profilepic url={comment?.author?.profilePicture} />
                </Link>
                <h1 className='font-bold text-sm'>
                    {comment?.author.username}
                    <span className='font-normal pl-1'>{comment?.text}</span>
                </h1>
            </div>
        </div>
    );
};

export default Comment;

