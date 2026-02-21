import { hash, seededRange, randomDate } from "./helpers";
import type { Comment } from "@/types/engagement";

const AUTHORS = [
  { name: "Alex M.", color: "#3b82f6" },
  { name: "Sarah K.", color: "#ef4444" },
  { name: "James R.", color: "#22c55e" },
  { name: "Priya P.", color: "#a855f7" },
  { name: "Marco L.", color: "#f59e0b" },
  { name: "Emily C.", color: "#ec4899" },
  { name: "David W.", color: "#06b6d4" },
  { name: "Yuki T.", color: "#84cc16" },
  { name: "Carlos G.", color: "#f97316" },
  { name: "Nina B.", color: "#8b5cf6" },
];

const COMMENT_TEMPLATES = [
  "This is a really interesting niche. I've been thinking about something similar in my area.",
  "The competition score seems low — has anyone actually tried entering this market?",
  "I validated a similar idea last month and the demand is real. Go for it!",
  "Great concept but the customer acquisition cost would be my biggest concern.",
  "Love this! The monetization potential through subscriptions could be huge.",
  "I'm skeptical about the timing score. This market has been around for years.",
  "Would love to see this with a freemium model. Lower barrier to entry.",
  "The target audience is spot on. Millennials are definitely willing to pay for this.",
  "Has anyone thought about partnering with existing businesses instead of going solo?",
  "This could work really well as a B2B play rather than direct to consumer.",
  "The search volume data backs this up nicely. Solid opportunity.",
  "I'd recommend starting with a manual MVP before building any tech.",
  "Interesting pivot on a traditional industry. The AI angle adds real value.",
  "Market timing is everything — and right now this space is heating up fast.",
  "Good idea but execution will be key. The moat here is thin.",
];

const REPLY_TEMPLATES = [
  "Agreed! I think the key differentiator would be the AI component.",
  "Good point. I'd start with a smaller geographic focus to test it.",
  "Thanks for sharing your experience. That gives me confidence!",
  "The B2B angle is interesting — hadn't considered that.",
  "I think the CAC concern is valid but solvable with content marketing.",
  "Yeah, the subscription model makes the unit economics work much better.",
];

export function getCommentsForIdea(ideaId: string): Comment[] {
  const seed = hash(ideaId);
  const commentCount = seededRange(seed, 3, 8);
  const comments: Comment[] = [];

  for (let i = 0; i < commentCount; i++) {
    const cSeed = seed + i * 17;
    const author = AUTHORS[cSeed % AUTHORS.length];
    const hasReplies = seededRange(cSeed + 1, 0, 3) > 1;

    const replies: Comment[] = [];
    if (hasReplies) {
      const replyCount = seededRange(cSeed + 2, 1, 2);
      for (let r = 0; r < replyCount; r++) {
        const rSeed = cSeed + r * 31 + 100;
        const replyAuthor = AUTHORS[(rSeed + 3) % AUTHORS.length];
        replies.push({
          id: `${ideaId}_c${i}_r${r}`,
          ideaId,
          author: replyAuthor.name,
          avatarColor: replyAuthor.color,
          content: REPLY_TEMPLATES[rSeed % REPLY_TEMPLATES.length],
          createdAt: randomDate(rSeed, 30),
          likes: seededRange(rSeed + 4, 0, 15),
          replies: [],
        });
      }
    }

    comments.push({
      id: `${ideaId}_c${i}`,
      ideaId,
      author: author.name,
      avatarColor: author.color,
      content: COMMENT_TEMPLATES[cSeed % COMMENT_TEMPLATES.length],
      createdAt: randomDate(cSeed + 5, 60),
      likes: seededRange(cSeed + 6, 0, 42),
      replies,
    });
  }

  return comments;
}
