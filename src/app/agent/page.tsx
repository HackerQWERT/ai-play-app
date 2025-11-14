import AgentForm from "../components/AgentForm";

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI 旅行代理
        </h1>
        <AgentForm />
      </div>
    </div>
  );
}
