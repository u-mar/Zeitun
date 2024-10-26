import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import AuthOptions from "./AuthOptions";

async function auth(req: NextRequest, res: NextResponse) {
    const protocol = req.headers.get('x-forwarded-proto');
    const host = req.headers.get('host');
  
    process.env.NEXTAUTH_URL = `${protocol}://${host}/api/auth`;
  
    return await NextAuth(req as unknown as NextApiRequest, res as unknown as NextApiResponse, AuthOptions);
  }
  
  export { auth as GET, auth as POST };