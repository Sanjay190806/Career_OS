import React from 'react';
import { AIMessage } from '../../types';
import { renderSafeMarkdown } from '../../utils/securityUtils';
import { Button } from '../ui/Button';

interface ChatMessageProps {
  message: AIMessage;
  onRetry?: (message: AIMessage) => void;
  onEdit?: (message: AIMessage) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry, onEdit }) => {
  const isUser = message.role === 'user';
  const isFailed = message.status === 'failed';
  const isStreaming = message.status === 'streaming';
  const isSending = message.status === 'sending';

  return (
    <div className={`mt-3 flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div
        className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
          isUser
            ? 'rounded-br-none bg-accentBlue text-white shadow-glow-blue'
            : 'rounded-bl-none border border-border-subtle bg-bgCard/60 text-textPrimary'
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-wider opacity-70">
          <span>{isUser ? 'Sanju' : 'Shayla'}</span>
          {!isUser && message.status && (
            <span
              className={`rounded-full px-2 py-0.5 ${
                isFailed ? 'bg-red-500/15 text-red-400' : isStreaming || isSending ? 'bg-accentBlue/15 text-accentBlue' : 'bg-accentEmerald/15 text-accentEmerald'
              }`}
            >
              {message.status}
            </span>
          )}
        </div>

        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            {message.content ? (
              <div className="prose-xs" dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(message.content) }} />
            ) : (
              <p className="italic text-textMuted">{isStreaming || isSending ? 'Shayla is thinking...' : 'No reply yet.'}</p>
            )}
          </>
        )}

        {isFailed && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-xl px-3 py-1 text-[10px]" onClick={() => onRetry?.(message)}>
              Retry
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-xl px-3 py-1 text-[10px]" onClick={() => onEdit?.(message)}>
              Edit message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
