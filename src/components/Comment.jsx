import React from 'react'
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import Profilepic from './ui/profilepic'

const Comment = ({ comment }) => {
    // console.log(comment);
    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <Link to={`/profile/${comment?.author?._id}`}>
                {/* <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>{comment?.author?.username[0]}</AvatarFallback>
                </Avatar> */}
                <Profilepic url={comment?.author?.profilePicture}/>
                </Link>
                <h1 className='font-bold text-sm'>{comment?.author.username} <span className='font-normal pl-1'>{comment?.text}</span></h1>
            </div>
        </div>
    )
}

export default Comment