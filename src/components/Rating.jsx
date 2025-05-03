import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserProfile } from '../redux/authSlice';

const Rating = () => {
  const { userProfile } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const submitRating = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/user/rate`,
        {
          userId: userProfile._id,
          value: rating
        },
        {
          withCredentials: true
        }
      );

      if (res.data.success) {
        toast.success(`Rated successfully! New average: ${Number(res.data.averageRating).toFixed(1)}`);
        dispatch(setUserProfile({...userProfile, ratings: res.data.ratings, averageRating: res.data.averageRating}))
      } else {
        toast.error(res.data.message || 'Rating failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
      {/* Display average rating */}
      <div className="text-center">
        <span className="font-semibold text-lg mr-1">
          Rated: {userProfile?.averageRating.toFixed(2) || 0}
        </span>
        <span className="text-sm text-gray-600">
          by {userProfile?.ratings?.length || 0} {userProfile?.ratings?.length > 1 ? "users" : "user"}
        </span>
      </div>

      {/* Rating dial */}
      <div className="flex items-center gap-2 border rounded px-4 py-2 shadow">
        <button
          onClick={() => setRating((prev) => Math.max(prev - 1, 0))}
          className="text-xl px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          -
        </button>
        <span className="text-lg font-medium w-8 text-center">{rating}</span>
        <button
          onClick={() => setRating((prev) => Math.min(prev + 1, 10))}
          className="text-xl px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          +
        </button>
        <button
          onClick={submitRating}
          disabled={loading}
          className="ml-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Rating...' : 'Rate'}
        </button>
      </div>
    </div>
  );
};

export default Rating;
