import { Star } from "lucide-react";

export default function RankStars({ rank }) {
    let starCount = 0;
    if (rank === 1) starCount = 3;
    else if (rank === 2) starCount = 2;
    else if (rank === 3) starCount = 1;

    return (
        <div className="flex gap-0.5">
            {Array.from({ length: starCount }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4 text-yellow-400" fill="currentColor" />
            ))}
        </div>
    );
}
