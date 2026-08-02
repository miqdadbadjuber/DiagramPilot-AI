"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface TypewriterMarkdownProps {
  content: string;
  shouldAnimate: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export default function TypewriterMarkdown({
  content,
  shouldAnimate,
  onStart,
  onComplete,
}: TypewriterMarkdownProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedContent(content);
      setIsTyping(false);
      onComplete?.();
      return;
    }

    setDisplayedContent("");
    setIsTyping(true);
    onStart?.();
    let i = 0;

    const interval = setInterval(() => {
      i += 1;
      if (i >= content.length) {
        setDisplayedContent(content);
        setIsTyping(false);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayedContent(content.slice(0, i));
      }
    }, 15);

    return () => clearInterval(interval);
  }, [content, isLatest, onStart, onComplete]);

  const contentWithCursor = isTyping ? displayedContent + " ▍" : displayedContent;

  return (
    <div className="prose prose-invert prose-sm max-w-none [&_p]:leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_pre]:bg-zinc-950 [&_pre]:border [&_pre]:border-zinc-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:bg-zinc-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-zinc-100 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-zinc-100">
      <ReactMarkdown>{contentWithCursor}</ReactMarkdown>
    </div>
  );
}

export { TypewriterMarkdown };
