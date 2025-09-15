// File: app/page.tsx
"use client";

import { useState, useEffect } from 'react';

// --- Types for our data ---
type Scores = Record<string, number>;
type Vote = { name: string; rankings: Record<string, number> };
type RankCounts = Record<string, Record<number, number>>;
type Results = {
    isPollActive: boolean;
    scores: Scores;
    winner: string;
    allVotes: Vote[];
    rankCounts: RankCounts;
    totalVotes: number; // <<<--- ADDED THIS LINE
};

const projectIdeas = [
    "Searce Bot",
    "Initial Structure Generation",
    "Self Documenting Codebase Agent",
    "AutoBug Fixer"
];

export default function Home() {
    const [name, setName] = useState('');
    const [rankings, setRankings] = useState<Record<string, number>>({});
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchResults = async () => {
        const response = await fetch('/api/vote');
        if (response.ok) {
            const data = await response.json();
            setResults(data);
        }
    };

    useEffect(() => {
        fetchResults();
        const interval = setInterval(fetchResults, 5000);
        return () => clearInterval(interval);
    }, []);


    const handleRankingChange = (project: string, rank: number) => {
        const newRankings = { ...rankings };
        for (const key in newRankings) {
            if (newRankings[key] === rank) delete newRankings[key];
        }
        newRankings[project] = rank;
        setRankings(newRankings);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!results?.isPollActive) {
            setError("The poll has ended.");
            return;
        }
        setError('');
        if (!name || Object.keys(rankings).length !== projectIdeas.length) {
            setError("Please enter your name and rank all projects.");
            return;
        }

        setIsLoading(true);
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rankings }),
        });
        const data = await response.json();
        if (response.ok) {
            setResults(data);
            setName('');
            setRankings({});
        } else {
            setError(data.error || "Failed to submit vote.");
        }
        setIsLoading(false);
    };

    const handleEndPoll = async () => {
        if (!confirm("Are you sure you want to end the poll? This cannot be undone.")) return;
        setIsLoading(true);
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'end_poll' }),
        });
        if (response.ok) {
            const data = await response.json();
            setResults(data);
        }
        setIsLoading(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-gray-50 text-gray-800">
            <div className="w-full max-w-5xl">
                <h1 className="text-4xl font-bold text-center mb-2">Project Idea Poll 🗳️</h1>
                <p className={`text-center text-lg font-semibold mb-10 ${results?.isPollActive ? 'text-green-600' : 'text-red-600'}`}>
                    {results ? (results.isPollActive ? "Poll is LIVE" : "Poll has ENDED") : "Loading poll status..."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* --- LEFT COLUMN --- */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">{results?.isPollActive ? "Cast Your Vote" : "Final Results"}</h2>
                        {results?.isPollActive ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* (Voting form is unchanged) */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Jane Doe" />
                                </div>
                                <div>
                                    <p className="block text-sm font-medium text-gray-700 mb-2">Your Preferences</p>
                                    {projectIdeas.map((project) => (
                                        <div key={project} className="flex items-center justify-between mb-2 p-2 rounded-md bg-gray-50">
                                            <span className="font-medium">{project}</span>
                                            <select value={rankings[project] || ''} onChange={(e) => handleRankingChange(project, parseInt(e.target.value))} className="border-gray-300 rounded-md shadow-sm">
                                                <option value="">Rank</option>
                                                {[1, 2, 3, 4].map(rank => <option key={rank} value={rank}>{rank}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">{isLoading ? "Submitting..." : "Submit Vote"}</button>
                            </form>
                        ) : (
                            // --- THIS IS THE UPDATED "FINAL RESULTS" VIEW ---
                            <div className="space-y-6">
                                <div>
                                    <p className="text-lg">Total Votes Cast: <span className="font-bold text-indigo-600">{results?.totalVotes}</span></p>
                                    <h3 className="text-xl mt-2">🏆 Winner: <span className="font-bold text-indigo-600">{results?.winner}</span></h3>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Detailed Vote Counts:</h4>
                                    <div className="text-sm space-y-2">
                                        {results && Object.entries(results.rankCounts).map(([project, counts]) => (
                                            <div key={project}>
                                                <p className="font-bold">{project}</p>
                                                <p className="text-gray-600 pl-2">
                                                    Rank 1: {counts[1]}, Rank 2: {counts[2]}, Rank 3: {counts[3]}, Rank 4: {counts[4]}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Scoreboard</h2>
                        <ul className="space-y-2 mb-6">
                            {results && Object.entries(results.scores).map(([project, score]) => (
                                <li key={project} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                    <span>{project}</span>
                                    <span className="font-bold text-lg">{score} points</span>
                                </li>
                            ))}
                        </ul>

                        {/* --- THIS IS THE UPDATED "VOTE LOG" VIEW --- */}
                        {!results?.isPollActive && results && (
                            <>
                                <hr className="my-4"/>
                                <h3 className="text-lg font-semibold mb-2">Full Vote Log</h3>
                                <div className="max-h-60 overflow-y-auto text-sm space-y-3">
                                    {results.allVotes.length > 0 ? results.allVotes.map((vote, index) => (
                                        <div key={index} className="text-gray-700">
                                            <p className="font-semibold">{vote.name} voted:</p>
                                            <ul className="list-disc list-inside pl-4">
                                                {projectIdeas
                                                    .sort((a, b) => vote.rankings[a] - vote.rankings[b]) // Sort by rank
                                                    .map(p => (
                                                        <li key={p}>Rank #{vote.rankings[p]}: {p}</li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )) : <p>No votes were cast.</p>}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* --- BOTTOM SECTION --- */}
                <div className="mt-10 w-full max-w-5xl">
                    {results?.isPollActive ? (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">How Voting Works (FAQ)</h2>
                            <p className="text-gray-600">Scores are calculated using a weighted system:</p>
                            <ul className="list-disc list-inside mt-2 text-gray-600">
                                <li>Rank 1 = <strong>4 points</strong></li>
                                <li>Rank 2 = <strong>3 points</strong></li>
                                <li>Rank 3 = <strong>2 points</strong></li>
                                <li>Rank 4 = <strong>1 point</strong></li>
                            </ul>
                            <button onClick={handleEndPoll} disabled={isLoading} className="mt-6 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                                {isLoading ? "..." : "End Poll and Reveal Final Results"}
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </main>
    );
}