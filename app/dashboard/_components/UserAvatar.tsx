"use client"
import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LockIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'

export interface UserProps {
    id?: string;        // Made optional
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;      // Made optional
}

const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
}

const UserAvatar = ({ user }: { user: UserProps }) => {
    return (
        <div className='flex items-center justify-around space-x-4'>
            <div className='flex items-center justify-between space-x-2'>
                <Avatar>
                    <AvatarImage src={user?.image!} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <span className="text-base text-slate-600 font-[500]">
                    {user.name}
                </span>
            </div>
            <LockIcon
                onClick={() => signOut({ callbackUrl: "/auth/signIn" })}
                className='text-gray-700 cursor-pointer'
            />
        </div>
    )
}

export default UserAvatar