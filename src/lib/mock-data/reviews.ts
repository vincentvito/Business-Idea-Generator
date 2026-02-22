import type { CustomerReview } from "@/types/analysis";

export function getCustomerReviews(): CustomerReview[] {
  return [
    {
      id: "rev_1",
      name: "Marcus Johnson",
      role: "Aspiring Food Entrepreneur",
      rating: 5,
      reviewText:
        "I had a dozen food truck business ideas but no clue which one would actually work. Market-Fit Engine showed me that gourmet grilled cheese had 3x the search demand of my other concepts with half the competition. Launched two months ago and already profitable.",
      category: "Food Truck Ideas",
      avatarColor: "#f59e0b",
    },
    {
      id: "rev_2",
      name: "Elena Vasquez",
      role: "First-Time Founder",
      rating: 5,
      reviewText:
        "I was drowning in generic startup ideas lists online. This tool gave me real data on what people are actually searching for. My AI-powered resume builder scored 87/100 and the competitor analysis revealed a gap nobody else was filling. Just closed our pre-seed round.",
      category: "Startup Ideas",
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
      role: "Digital Nomad & Solopreneur",
      rating: 5,
      reviewText:
        "I've tried every online business ideas generator out there. This is the only one backed by real Google search data instead of just vibes. Found a niche in digital planner templates that has 8K monthly searches and almost zero quality competitors.",
      category: "Online Business Ideas",
      avatarColor: "#a855f7",
    },
    {
      id: "rev_5",
      name: "James Okafor",
      role: "Full-Time Employee & Side Hustler",
      rating: 4,
      reviewText:
        "Needed a side hustle idea that I could run in evenings and weekends. The tool ranked my options by time-to-revenue and competition level. My weekend car detailing service scored high on local demand — now earning $2K/month on the side after just six weeks.",
      category: "Side Hustle Ideas",
      avatarColor: "#06b6d4",
    },
    {
      id: "rev_6",
      name: "Lisa Chen",
      role: "E-Commerce Store Owner",
      rating: 5,
      reviewText:
        "Was stuck choosing between 5 different e-commerce ideas for my next store. The monetization scoring showed that sustainable pet products had the best margins and search trends. My Shopify store hit $10K in month two thanks to the niche validation.",
      category: "E-Commerce Ideas",
      avatarColor: "#ec4899",
    },
    {
      id: "rev_7",
      name: "Raj Patel",
      role: "Technical Co-Founder",
      rating: 5,
      reviewText:
        "We were debating between three SaaS startup ideas for months. Market-Fit Engine settled it in 60 seconds — our invoice automation concept had a demand score of 91 and the competitive landscape was surprisingly thin. We shipped our MVP in eight weeks.",
      category: "SaaS Startup Ideas",
      avatarColor: "#8b5cf6",
    },
    {
      id: "rev_8",
      name: "Amanda Torres",
      role: "Creative Entrepreneur",
      rating: 5,
      reviewText:
        "The subscription box ideas space felt saturated until I used this tool. It identified an underserved niche — curated journaling and stationery boxes for teens. The search trend was growing 30% quarter-over-quarter and the top competitors had weak SEO. Already at 400 subscribers.",
      category: "Subscription Box Ideas",
      avatarColor: "#ef4444",
    },
  ];
}
