import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, addPosts } from "@/redux/postSlice";
import { setPosts } from "../redux/postSlice";

const useGetAllPost = (page) => {
  const dispatch = useDispatch();
  const { posts } = useSelector(state => state.post);

  useEffect(() => {
    const fetchAllPosts = async () => {
      dispatch(setLoading(true));
      try {
        console.log('here1')
        const res = await axios.get( `${import.meta.env.VITE_APP_BASE_URL}/post/all?page=${page}`, { withCredentials: true });
        console.log('here2', res);
        if (res.data.success) {
            if (page === 1) {
                dispatch(setPosts(res.data.posts));
            } else {
                const newPost = res.data.posts.filter(
                    post => !posts.some(existing => existing._id === post._id)
                );
                dispatch(setPosts([...posts, ...newPost]));
            }
        }
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAllPosts();
  }, [page]);

};

export default useGetAllPost;
