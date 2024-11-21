import React from 'react'
import UserRegisterForm from '../../add/_components/AdminForm';
import prisma from '@/prisma/client';
const adminFormId = async ({ params }: { params: { id: string } }) => {

  let user;
try {
    user = await prisma.user.findUnique({ where: { id: params.id } });
  } catch (err) {
    console.error('error', err);
    user == null
  }
  // Convert null to undefined if necessary
  if (user == undefined) {
    return (
      <div>
       not found
      </div>
    );
  }
  return (
    <div>
    <UserRegisterForm user={user}/>
    </div>
  )
}

export default adminFormId