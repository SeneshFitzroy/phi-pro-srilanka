import { redirect } from 'next/navigation';

// The Compliance Copilot is merged into the single agentic PHI Assistant
// (floating button on every dashboard page). This route now forwards home.
export default function CopilotRedirect() {
  redirect('/dashboard');
}
