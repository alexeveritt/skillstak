import * as Sentry from "@sentry/react";

export function meta() {
  return [{ title: "Test Sentry" }];
}

export default function TestSentry() {
  const testClientError = () => {
    try {
      throw new Error("🧪 Test client-side error for Sentry - " + new Date().toISOString());
    } catch (error) {
      Sentry.captureException(error);
      console.log("✅ Error sent to Sentry! Check your dashboard.");
      alert("Error sent to Sentry! Check your dashboard.");
    }
  };

  const testMessage = () => {
    Sentry.captureMessage("🧪 Test message from Skillstak app - " + new Date().toISOString());
    console.log("✅ Message sent to Sentry! Check your dashboard.");
    alert("Message sent to Sentry! Check your dashboard.");
  };

  const testUnhandledError = () => {
    // This will trigger a real unhandled error that React will catch
    throw new Error("🧪 Unhandled error test - " + new Date().toISOString());
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">🔍 Test Sentry Integration</h1>
        <p className="text-gray-600">
          Click the buttons below to send test events to Sentry and verify your integration is working.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={testClientError}
          className="w-full rounded-lg bg-red-500 px-6 py-3 text-white font-semibold hover:bg-red-600 transition-colors"
        >
          🔴 Test Caught Exception
        </button>

        <button
          onClick={testMessage}
          className="w-full rounded-lg bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600 transition-colors"
        >
          💬 Test Message
        </button>

        <button
          onClick={testUnhandledError}
          className="w-full rounded-lg bg-orange-500 px-6 py-3 text-white font-semibold hover:bg-orange-600 transition-colors"
        >
          ⚠️ Test Unhandled Error (will trigger error boundary)
        </button>
      </div>

      <div className="rounded-lg bg-gray-100 p-4 text-sm">
        <h2 className="font-semibold mb-2">📋 Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Open your browser's DevTools Console (F12)</li>
          <li>Click any button above</li>
          <li>Check the console for confirmation messages</li>
          <li>
            Go to your Sentry dashboard at{" "}
            <a href="https://sentry.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              sentry.io
            </a>
          </li>
          <li>Navigate to Issues to see your test events</li>
        </ol>
      </div>

      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm">
        <h3 className="font-semibold text-yellow-800 mb-1">💡 What to expect:</h3>
        <ul className="list-disc list-inside space-y-1 text-yellow-700">
          <li>
            <strong>Caught Exception:</strong> Sends an error with full stack trace
          </li>
          <li>
            <strong>Message:</strong> Sends a simple message event
          </li>
          <li>
            <strong>Unhandled Error:</strong> Will crash the component and be caught by React's error boundary
          </li>
        </ul>
      </div>
    </div>
  );
}
