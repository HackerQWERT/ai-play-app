"use server";
import AgentForm from "../components/AgentForm";

export default async function AgentPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; response?: string; error?: string }>;
}) {
  const resolvedParams = await searchParams;
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI 旅行代理
        </h1>
        <AgentForm searchParams={resolvedParams} />
      </div>
    </div>
  );
}
