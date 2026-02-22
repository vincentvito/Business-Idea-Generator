import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCustomerReviews } from "@/lib/mock-data";
import type { CustomerReview } from "@/types/analysis";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: review.avatarColor }}
        >
          {review.name[0]}
        </div>
        <div>
          <p className="font-semibold text-sm">{review.name}</p>
          <p className="text-xs text-muted-foreground">{review.role}</p>
        </div>
      </div>
      <StarRating rating={review.rating} />
      <p className="text-sm text-muted-foreground mt-2">
        &ldquo;{review.reviewText}&rdquo;
      </p>
      <div className="mt-3">
        <Badge variant="outline" className="text-xs">
          {review.category}
        </Badge>
      </div>
    </div>
  );
}

export function CustomerReviews() {
  const reviews = getCustomerReviews();

  return (
    <div>
      <h2 className="text-center text-lg font-semibold mb-2">
        What Entrepreneurs Are Saying
      </h2>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Join thousands who validated their business ideas with real market data
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
