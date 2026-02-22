import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { getPriceId } from "@/lib/stripe/plans";

export async function POST(request: Request) {
  if (
    process.env.BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  ) {
    return Response.json(
      { error: "Stripe checkout is not available in dev bypass mode" },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier, interval } = await request.json();
  const priceId = getPriceId(tier, interval);
  if (!priceId) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  // Find or create Stripe customer
  let customerId = user?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/account?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    metadata: { userId: session.user.id },
  });

  return Response.json({ url: checkoutSession.url });
}
