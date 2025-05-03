import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const { posts, feedPosts, loading} = useSelector(store => store.post);
  const { user } = useSelector(store => store.auth);
  return (
    <div>
      {user?.following?.length > 0 ? (
        feedPosts?.length > 0 ? (
          <>
            <div className='text-lg font-semibold'>Your Feed</div>
            {feedPosts.map((post) => (
              <Post key={post._id} post={post} whichPost="feedPosts"/>
            ))}
            {loading && <div className='w-full flex justify-center h-32'> <span className='loader3 '></span> </div>}
          </>
        ) : (
          <div className='loader3 mt-[40vh]'></div>
        )
      ) : (
        posts?.length > 0 ? (
          <>
            <div className='text-lg font-semibold'>Recommended Posts</div>
            {posts.map((post) => (
              <Post key={post._id} post={post} whichPost="recommendedPosts"/>
            ))}
            {loading && <div className='w-full flex justify-center h-32'> <span className='loader3 '></span> </div>}
          </>
        ) : (
          <div className='loader3 mt-[40vh]'></div>
        )
      )}
    </div>
  )
}

export default Posts
