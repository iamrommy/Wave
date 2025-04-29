import React, { useState } from 'react'
import { Dialog, DialogContent} from './ui/dialog';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Profilepic from './ui/profilepic';

const SearchUser = ({openSearch, setOpenSearch}) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/user/search`,
        {
          params: { searchTerm },
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      if (res.data.success) {
        setUsers(res.data.users)
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

    return (
      <Dialog open={openSearch}>
        <DialogContent onInteractOutside={() => setOpenSearch(false)} aria-describedby={undefined}>
          <div className='flex gap-x-4'>
            <span className='text-center font-semibold text-white'>Search User</span>
            { loading && <span className='loader mt-1'></span> }
          </div>
          
          <form onSubmit={handleSubmit} className="flex items-center w-full mx-auto">   
              <label htmlFor="simple-search" className="sr-only">Search</label>
              <div className="relative w-full">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"/>
                      </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value);}}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
              </div>
              <button type="submit" className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                  <span className="sr-only">Search</span>
              </button>
          </form>

          <div className='h-[70vh] overflow-auto'>
            {users?.length > 0 ? (
              users.map((userItem) => (
                <div key={userItem._id} className="flex items-center gap-3 justify-between">
                  <Link
                    className="flex items-center gap-3"
                    to={`/profile/${userItem._id}`}
                    onClick={() => setOpenSearch(false)}
                    >
                    <Profilepic url={userItem?.profilePicture} classes={'h-10 w-10'} />
                    <span className="text-white">{userItem.username}</span>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No users found</p>
            )}
          </div>
        
        </DialogContent>
      </Dialog>
    )
}

export default SearchUser;
