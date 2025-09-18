'use client';

import { UserList } from "@/components/user-list";
import { withAuth } from "@/contexts/auth-context";

function UsersPage() {
  return <UserList />;
}

export default withAuth(UsersPage);
