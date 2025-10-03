// File: app/api/vote/route.ts

import { NextResponse } from 'next/server';

/**
 * @swagger
 * components:
 * schemas:
 * VotePayload:
 * type: object
 * required:
 * - name
 * - rankings
 * properties:
 * name:
 * type: string
 * example: "Jane Doe"
 * rankings:
 * type: object
 * description: An object where keys are project names and values are their rank (1-4).
 * properties:
 * "Searce Bot":
 * type: integer
 * example: 1
 * "Initial Structure Generation":
 * type: integer
 * example: 2
 * "Self Documenting Codebase Agent":
 * type: integer
 * example: 3
 * "AutoBug Fixer":
 * type: integer
 * example: 4
 * EndPollPayload:
 * type: object
 * required:
 * - action
 * properties:
 * action:
 * type: string
 * description: The specific action to perform.
 * example: "end_poll"
 */

// --- (Your code logic remains exactly the same) ---
const votes: { name: string; rankings: Record<string, number> }[] = [];
let isPollActive = true; 
const projectIdeas = ["Searce Bot", "Initial Structure Generation", "Self Documenting Codebase Agent", "AutoBug Fixer"];
const getResults = () => { /* ... function is unchanged ... */
    const scores: Record<string, number> = {};
    projectIdeas.forEach(p => scores[p] = 0);
    const rankCounts: Record<string, Record<number, number>> = {};
    projectIdeas.forEach(p => { rankCounts[p] = { 1: 0, 2: 0, 3: 0, 4: 0 }; });
    const scoreWeights: { [key: number]: number } = { 1: 4, 2: 3, 3: 2, 4: 1 };
    for (const vote of votes) {
        for (const project in vote.rankings) {
            const rank = vote.rankings[project];
            if (scores[project] !== undefined && scoreWeights[rank]) {
                scores[project] += scoreWeights[rank];
                if (rankCounts[project]) rankCounts[project][rank]++;
            }
        }
    }
    const sortedProjects = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const winner = sortedProjects.length > 0 && sortedProjects[0][1] > 0 ? sortedProjects[0][0] : "No clear winner";
    return { isPollActive, scores: Object.fromEntries(sortedProjects), winner: isPollActive ? "Poll in progress..." : winner, rankCounts: isPollActive ? {} : rankCounts, allVotes: isPollActive ? [] : votes, totalVotes: votes.length };
};

/**
 * @swagger
 * /api/vote:
 * get:
 * summary: Get current poll results
 * description: Retrieves the current state of the poll, including scores, winner (if ended), and status.
 * tags: [Poll]
 * responses:
 * '200':
 * description: Successful response with poll data.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * isPollActive:
 * type: boolean
 * scores:
 * type: object
 * winner:
 * type: string
 * totalVotes:
 * type: integer
 */
export async function GET() {
    return NextResponse.json(getResults());
}

/**
 * @swagger
 * /api/vote:
 * post:
 * summary: Submit a vote or end the poll
 * description: This endpoint has dual functionality. Submit a vote with a name and rankings, or end the poll by sending an action object.
 * tags: [Poll]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * oneOf:
 * - $ref: '#/components/schemas/VotePayload'
 * - $ref: '#/components/schemas/EndPollPayload'
 * responses:
 * '200':
 * description: Vote submitted or poll ended successfully. Returns the updated poll state.
 * '400':
 * description: Invalid request body (e.g., missing name/rankings).
 * '403':
 * description: Forbidden. The poll has already ended.
 */
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
        console.error("Error processing POST request:", error);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}