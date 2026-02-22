import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/db/prisma";
import { getTierByPriceId } from "@/lib/stripe/plans";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      if (!userId) break;

      // Handle deep dive one-time payment
      if (checkoutSession.metadata?.type === "deep_dive") {
        const deepDiveId = checkoutSession.metadata.deepDiveId;
        if (deepDiveId) {
          await prisma.deepDive.update({
            where: { id: deepDiveId },
            data: {
              status: "GENERATING",
              stripeSessionId: checkoutSession.id,
              stripePaymentIntentId: checkoutSession.payment_intent as string,
              paidAt: new Date(),
              amountPaid: checkoutSession.amount_total ?? 2999,
            },
          });

          // Fire-and-forget: trigger deep dive generation
          const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
          fetch(`${baseUrl}/api/deep-dive/${deepDiveId}/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-webhook-secret": process.env.INTERNAL_WEBHOOK_SECRET ?? "",
            },
          }).catch(console.error);
        }
        break;
      }

      // Handle subscription checkout
      const subResponse = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string
      );
      // Stripe v20+ returns Response<Subscription> — cast to access properties
      const subscription = subResponse as unknown as Stripe.Subscription;
      const firstItem = subscription.items.data[0];
      const priceId = firstItem?.price.id;
      const tier = getTierByPriceId(priceId);

      if (tier && firstItem) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(
              firstItem.current_period_end * 1000
            ),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      // Event data is already the subscription object
      const subscription = event.data.object as unknown as Stripe.Subscription;
      const firstItem = subscription.items.data[0];
      const priceId = firstItem?.price.id;
      const tier = getTierByPriceId(priceId);

      if (tier && firstItem) {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            tier,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(
              firstItem.current_period_end * 1000
            ),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as unknown as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          tier: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      // Could notify user via email, but for now just log
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
