

export default function Dashboard() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="mt-4 text-lg">Welcome to the dashboard!</p>
            <p className="mt-2 text-lg">This is a protected route.</p>
            <p className="mt-2 text-lg">You can only see this if you are logged in.</p>
            <p className="mt-2 text-lg">You can add your dashboard content here.</p>
        </div>
    );
}