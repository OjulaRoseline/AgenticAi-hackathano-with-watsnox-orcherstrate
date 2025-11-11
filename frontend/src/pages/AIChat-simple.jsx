export default function AIChat({ user }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">
        AI Chat - Test Page
      </h1>
      <p className="text-gray-300">
        Hello {user?.firstName || 'User'}! This is a test to see if the page loads.
      </p>
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <p className="text-white">If you can see this, the routing is working!</p>
      </div>
    </div>
  );
}
