import { SessionDetails } from "@/components/session-details";

export default function DeviceDetailsPage({ params }: { params: { id: string } }) {
  // This page shows session details, but is under device route.
  // This should be changed to reflect session details.
  // For now, we pass the session ID to the SessionDetails component.
  return <SessionDetails sessionId={params.id} />;
}
