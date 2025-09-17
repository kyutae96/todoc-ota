import { SessionDetails } from "@/components/session-details";

export default function SessionDetailsPage({ params }: { params: { id: string } }) {
  return <SessionDetails sessionId={params.id} />;
}
