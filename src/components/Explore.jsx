import React, { useLayoutEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setOpenPost } from '../redux/miscelaneousSlice'
import { IoArrowBack } from "react-icons/io5";
import Post from './Post'

const Explore = () => {

  const {posts} = useSelector(state => state.post)
  const {openPost} = useSelector(state => state.miscelaneous)
  const dispatch = useDispatch();
  const postRefs = useRef({});

  useLayoutEffect(() => {
    if (openPost && postRefs.current[openPost._id]) {
        window.scrollTo(0, 0);
        postRefs.current[openPost._id].scrollIntoView({ block: "center" });
    }
  }, [openPost]); 

  return (
    <div className={`flex flex-col max-w-4xl justify-center mx-auto pl-10`}>
      { !openPost ? ( 
      <>
        <div className='text-3xl py-5 sticky top-0 bg-white z-10 font-bold'>Explore</div>
        <div className='grid grid-cols-3 gap-1'>
          {
            posts?.map((post) => (
              <div key={post?._id} className='relative group cursor-pointer'>
                <img src={post.image} onClick={()=>{dispatch(setOpenPost(post))}} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
              </div>
            ))
          }
        </div>
      </>
      ) : (
        <div>
           { posts && (
            <>
              <div onClick={() => {dispatch(setOpenPost(null));  window.scrollTo(0, 0)}} className='flex hover:bg-gray-800 hover:text-white p-2 pr-3 mt-5 rounded-full cursor-pointer gap-2 fixed'>
                <IoArrowBack className='text-xl mt-1'/>
                <span className='text-lg font-semibold'>Explore </span>
              </div>
              <div className='flex-1 my-8 flex flex-col pl-[20%]'>
                {posts?.map((p) => (
                  <div ref={(el) => (postRefs.current[p._id] = el)}  key={p._id}>
                    <Post post={p} whichPost={"recommendedPosts"} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
  </div>
  )
}

export default Explore
