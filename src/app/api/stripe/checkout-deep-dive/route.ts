import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass";

export async function POST(request: Request) {
  // Dev bypass
  if (AUTH_BYPASS_ENABLED) {
    const { ideaData, category, location, filters } = await request.json();

    // In bypass mode, skip Stripe and go straight to GENERATING
    const deepDive = await prisma.deepDive.create({
      data: {
        userId: "dev-user",
        ideaTitle: ideaData.title,
        ideaData: ideaData,
        category,
        location,
        filters: filters ?? undefined,
        status: "GENERATING",
        paidAt: new Date(),
        amountPaid: 2999,
      },
    });

    // Trigger generation directly
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    fetch(`${baseUrl}/api/deep-dive/${deepDive.id}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.INTERNAL_WEBHOOK_SECRET ?? "dev-secret",
      },
    }).catch(console.error);

    return Response.json({
      url: `/deep-dive/${deepDive.id}?success=true`,
      deepDiveId: deepDive.id,
      bypass: true,
    });
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ideaData, category, location, filters } = await request.json();

  if (!ideaData || !category || !location) {
    return Response.json(
      { error: "Missing required fields: ideaData, category, location" },
      { status: 400 }
    );
  }

  // Find or create Stripe customer (reuse existing pattern)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

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

  // Create DeepDive record in PENDING state
  const deepDive = await prisma.deepDive.create({
    data: {
      userId: session.user.id,
      ideaTitle: ideaData.title,
      ideaData: ideaData,
      category,
      location,
      filters: filters ?? undefined,
      status: "PENDING",
    },
  });

  // Create one-time payment checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_DEEP_DIVE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/deep-dive/${deepDive.id}?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/discover?cancelled=true`,
    metadata: {
      userId: session.user.id,
      deepDiveId: deepDive.id,
      type: "deep_dive",
    },
  });

  return Response.json({ url: checkoutSession.url, deepDiveId: deepDive.id });
}
