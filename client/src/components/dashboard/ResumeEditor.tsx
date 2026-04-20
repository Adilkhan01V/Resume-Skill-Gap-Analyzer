import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface ResumeEditorProps {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function ResumeEditor({ 
  content, 
  onChange, 
  placeholder = 'Start typing...', 
  readOnly = false,
  className = "" 
}: ResumeEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: `resume-document mx-auto focus:outline-none ${className}`,
      },
    },
  });

  // Sync content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Sync readOnly state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  return (
    <div className="w-full h-full bg-white text-gray-900 p-8 md:p-16 shadow-2xl overflow-auto custom-scrollbar">
      <EditorContent editor={editor} />
    </div>
  );
}
