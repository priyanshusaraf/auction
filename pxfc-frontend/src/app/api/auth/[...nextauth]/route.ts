// // app/api/auction/route.ts
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);

//   // ❌ Restrict actions to admins only
//   if (!session || session.user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // ✅ Allow admin to perform auction actions
//   const data = await req.json();
//   return NextResponse.json({ message: "Player added to team", data });
// }

// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
