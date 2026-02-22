import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";

export async function POST() {
  if (
    process.env.BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  ) {
    return Response.json(
      { error: "Billing portal is not available in dev bypass mode" },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return Response.json({ error: "No billing account found" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/account`,
  });

  return Response.json({ url: portalSession.url });
}
