// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/indices",
    "/api/file",
    "/api/save-file",
  ],
}

