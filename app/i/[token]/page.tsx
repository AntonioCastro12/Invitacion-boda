import WeddingApp from "../../../src/App";

export default async function PersonalizedInvitation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <WeddingApp inviteToken={token} />;
}
