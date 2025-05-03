import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFeedPosts, addToFeedPosts, setLoading } from "../redux/postSlice";

const useGetFeedPost = (page = 1) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchFeedPost = async () => {
            dispatch(setLoading(true)); // Start loading
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_APP_BASE_URL}/post/feed?page=${page}`,
                    { withCredentials: true }
                );
                if (res.data.success) {
                    if (page === 1) {
                        dispatch(setFeedPosts(res.data.posts));
                    } else {
                        dispatch(addToFeedPosts(res.data.posts));
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                dispatch(setLoading(false)); // Stop loading
            }
        };

        fetchFeedPost();
    }, [page]);
};

export default useGetFeedPost;
