import { SessionList } from "@/components/session-list";

export default function SessionsPage({ searchParams }: { searchParams: { deviceId?: string } }) {
  return <SessionList deviceId={searchParams.deviceId} />;
}
