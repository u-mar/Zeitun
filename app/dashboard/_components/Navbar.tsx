import React from 'react'
import UserAvatar from './UserAvatar'
import { AuthOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { getServerSession } from 'next-auth'
import MobileMenu from './MobileMenu'
import { FaGlobe, FaMoon, FaShoppingCart, FaBell, FaTh, FaSlidersH, FaSearch } from 'react-icons/fa' // Importing necessary icons
import FullScreenButton from './FullScreenButton'

const Navbar = async () => {

    const session = await getServerSession(AuthOptions);

    return (
        <div className='p-4 border-b flex h-full items-center justify-between bg-white bg-opacity-90 shadow-sm'>
            <div className='hidden  md:flex items-center space-x-4'>
                
                <FullScreenButton />
            </div>

            <div className='hidden md:flex items-center'>
                <UserAvatar user={session?.user!} />
            </div>
            <MobileMenu />
        </div>
    )
}

export default Navbar