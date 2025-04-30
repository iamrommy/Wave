import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFeedPosts } from "../redux/postSlice";


const useGetFeedPost = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchFeedPost = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/post/feed`, { withCredentials: true });
                if (res.data.success) { 
                    dispatch(setFeedPosts(res.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchFeedPost();
    }, []);
};
export default useGetFeedPost;