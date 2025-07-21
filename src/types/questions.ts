export interface Question {
    creator: string;
    title: string;
    createAt: number;
    text: string;
    status: string;
    hasAcceptedAnswer: boolean;
    upvotes: number;
    downvotes: number;
    answers: number;
    views: number;
    comments: number;
    question_id: number;
}

