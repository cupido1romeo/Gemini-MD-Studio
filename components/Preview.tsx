import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewProps {
  content: string;
  visible: boolean;
}

const Preview: React.FC<PreviewProps> = ({ content, visible }) => {
  if (!visible) return null;

  return (
    <div className="h-full w-full bg-gray-850 overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Preview;