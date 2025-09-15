// File: app/api/vote/route.ts

import { NextResponse } from 'next/server';

// --- In-Memory Database & Poll State ---
let votes: { name: string; rankings: Record<string, number> }[] = [];
let isPollActive = true; // The poll starts as active

const projectIdeas = [
    "Searce Bot",
    "Initial Structure Generation",
    "Self Documenting Codebase Agent",
    "AutoBug Fixer"
];

const initializeRankCounts = () => {
    const counts: Record<string, Record<number, number>> = {};
    projectIdeas.forEach(project => {
        counts[project] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    });
    return counts;
};

// --- Scoring & Analysis Logic ---
const getResults = () => {
    const scores: Record<string, number> = {};
    projectIdeas.forEach(p => scores[p] = 0);

    const rankCounts = initializeRankCounts();

    const scoreWeights: { [key: number]: number } = { 1: 4, 2: 3, 3: 2, 4: 1 };

    for (const vote of votes) {
        for (const project in vote.rankings) {
            const rank = vote.rankings[project];
            if (scores[project] !== undefined && scoreWeights[rank]) {
                scores[project] += scoreWeights[rank];
                if (rankCounts[project]) {
                    rankCounts[project][rank]++;
                }
            }
        }
    }

    const sortedProjects = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const winner = sortedProjects.length > 0 && sortedProjects[0][1] > 0 ? sortedProjects[0][0] : "No clear winner";

    return {
        isPollActive,
        scores: Object.fromEntries(sortedProjects),
        winner: isPollActive ? "Poll in progress..." : winner,
        rankCounts: isPollActive ? {} : rankCounts,
        allVotes: isPollActive ? [] : votes,
        totalVotes: votes.length, // <<<--- ADDED THIS LINE
    };
};

// --- API Handlers ---

// Handles GET requests (fetching the current state)
export async function GET() {
    return NextResponse.json(getResults());
}

// Handles POST requests (submitting a vote OR ending the poll)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === 'end_poll') {
            isPollActive = false;
            return NextResponse.json(getResults());
        }

        if (!isPollActive) {
            return NextResponse.json({ error: "The poll has ended and is no longer accepting votes." }, { status: 403 });
        }

        const { name, rankings } = body;
        if (!name || !rankings) {
            return NextResponse.json({ error: "Missing name or rankings" }, { status: 400 });
        }

        votes.push({ name, rankings });
        return NextResponse.json(getResults());

    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}