import type { CustomerReview } from "@/types/analysis";

export function getCustomerReviews(): CustomerReview[] {
  return [
    {
      id: "rev_1",
      name: "Marcus Johnson",
      role: "Aspiring Food Truck Owner",
      rating: 5,
      reviewText:
        "I had a dozen food truck ideas but no clue which one would actually work. FoodLaunch showed me that gourmet grilled cheese had 3x the search demand of my other concepts with half the competition. Launched two months ago and already profitable.",
      category: "Food Truck Ideas",
      avatarColor: "#f59e0b",
    },
    {
      id: "rev_2",
      name: "Elena Vasquez",
      role: "First-Time Restaurant Founder",
      rating: 5,
      reviewText:
        "I was drowning in restaurant concepts and had no idea which cuisine would actually work in my neighborhood. FoodLaunch gave me real data — my vegan fast-casual concept scored 87/100 and the competitor analysis revealed a gap nobody else was filling. Opening next month.",
      category: "Restaurant Ideas",
      avatarColor: "#3b82f6",
    },
    {
      id: "rev_3",
      name: "David Park",
      role: "Restaurant Industry Veteran",
      rating: 5,
      reviewText:
        "After 15 years in restaurants, I wanted to test new food concepts before investing. The search volume data for plant-based Korean fusion was eye-opening — 12K monthly searches and rising fast. The demand validation alone saved me from a bad location choice.",
      category: "New Food Concepts",
      avatarColor: "#22c55e",
    },
    {
      id: "rev_4",
      name: "Sarah Mitchell",
      role: "Ghost Kitchen Entrepreneur",
      rating: 5,
      reviewText:
        "I was torn between launching a poke bowl brand or a comfort food delivery concept from my ghost kitchen. FoodLaunch showed the poke bowl market was oversaturated locally, but late-night comfort food had massive unmet demand. Now doing 200+ orders a week.",
      category: "Ghost Kitchen Ideas",
      avatarColor: "#a855f7",
    },
    {
      id: "rev_5",
      name: "James Okafor",
      role: "Weekend Baker & Side Hustler",
      rating: 4,
      reviewText:
        "Needed a food business I could run on weekends. FoodLaunch ranked my options by time-to-revenue and competition level. My artisan sourdough subscription scored high on local demand — now earning $3K/month baking on weekends after just six weeks.",
      category: "Bakery Ideas",
      avatarColor: "#06b6d4",
    },
    {
      id: "rev_6",
      name: "Lisa Chen",
      role: "Packaged Food Entrepreneur",
      rating: 5,
      reviewText:
        "Was stuck choosing between 5 different food product ideas for my DTC brand. The monetization scoring showed that artisan hot sauce had the best margins and search trends. My Shopify store hit $10K in month two thanks to the niche validation.",
      category: "Food Product Ideas",
      avatarColor: "#ec4899",
    },
    {
      id: "rev_7",
      name: "Raj Patel",
      role: "Catering Business Founder",
      rating: 5,
      reviewText:
        "We were debating between corporate lunch catering and private chef experiences. FoodLaunch settled it in 60 seconds — the private chef concept had a demand score of 91 and the competitive landscape was surprisingly thin. Booked out for the next 3 months.",
      category: "Catering Ideas",
      avatarColor: "#8b5cf6",
    },
    {
      id: "rev_8",
      name: "Amanda Torres",
      role: "Beverage Brand Creator",
      rating: 5,
      reviewText:
        "The craft beverage space felt saturated until I used FoodLaunch. It identified an underserved niche — functional mushroom coffee blends. The search trend was growing 30% quarter-over-quarter and top competitors had weak branding. Already in 40 retail stores.",
      category: "Beverage Brand Ideas",
      avatarColor: "#ef4444",
    },
  ];
}
