import { getServerSession } from 'next-auth';
import React from 'react'
import Setting from './Setting';
import AuthOptions from '@/app/api/auth/[...nextauth]/AuthOptions';

const UserId: React.FC = async () => {
    const  session = await getServerSession(AuthOptions);
    const user = session?.user;
  return (
    <div>
        <Setting user={user} />
    </div>
  )
}

export default UserId