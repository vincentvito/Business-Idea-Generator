export interface Bookmark {
  ideaId: string;
  ideaTitle: string;
  score: number;
  category: string;
  savedAt: string;
}

export interface Vote {
  ideaId: string;
  direction: "up" | "down";
}

export interface Comment {
  id: string;
  ideaId: string;
  author: string;
  avatarColor: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}
