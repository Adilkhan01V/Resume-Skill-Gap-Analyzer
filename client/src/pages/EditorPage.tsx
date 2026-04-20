import { ResumeEditorPanel } from "../components/dashboard/ResumeEditorPanel";

export function EditorPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Resume Editor</h1>
        <p className="text-sm text-muted">
          Dedicated editor view placeholder for focused resume refinement.
        </p>
      </div>
      <ResumeEditorPanel />
    </div>
  );
}
