import React, { useEffect, useState } from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import useGetFeedPost from '../hooks/useGetFeedPost'

const Home = () => {
    const [page, setPage] = useState(1);

    useGetFeedPost(page);
    useGetAllPost(page);
    useGetSuggestedUsers();

    const handleInfiniteScroll = async () => {
        try {
          if (
            window.innerHeight + document.documentElement.scrollTop + 1 >=
            document.documentElement.scrollHeight
          ) {
            setPage((prev) => prev + 1);
          }
        } catch (error) {
          console.log(error);
        }
      };

    useEffect(()=>{
        window.addEventListener("scroll", handleInfiniteScroll);
        return () => {
            window.removeEventListener("scroll", handleInfiniteScroll);
            window.scrollTo(0,0);
        }
    }, [])

    return (
        <div className='flex'>
            <div className='flex-grow'>
                <Feed />
                <Outlet />
            </div>
            <RightSidebar />
        </div>
    )
}

export default Home