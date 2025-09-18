'use client';

import { MyPage } from "@/components/my-page";
import { withAuth } from "@/contexts/auth-context";

function MyProfilePage() {
  return <MyPage />;
}

export default withAuth(MyProfilePage);
