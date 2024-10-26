import SidebarRoutes from "./SidebarRoutes";
import { getServerSession } from 'next-auth'
import { AuthOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { User } from "@prisma/client";




const MainSidebar = async () => {

  const session = await getServerSession(AuthOptions);
  const userRole = (session?.user as User).role
  return (
    <SidebarRoutes role={userRole} />
  );
};

export default MainSidebar;
