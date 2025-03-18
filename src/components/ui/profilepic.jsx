import React from 'react'
import profile from '../../assets/profile.jpg'

const Profilepic = ({url, classes}) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${classes}`}>
      <img src={url ? url : profile} className='aspect-square h-full w-full' alt="profile picture" />
    </div>
  )
}

export default Profilepic
