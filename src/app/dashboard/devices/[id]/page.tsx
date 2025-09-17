import { DeviceDetails } from "@/components/device-details";

export default function DeviceDetailsPage({ params }: { params: { id: string } }) {
  return <DeviceDetails deviceId={params.id} />;
}
