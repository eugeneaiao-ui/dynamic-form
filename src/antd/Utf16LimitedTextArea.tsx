import React, { useRef } from 'react';
import { Input } from 'antd';
import type { TextAreaProps, TextAreaRef } from 'antd/es/input/TextArea';
import { sliceBySubmitLength } from '../core';
export type Utf16LimitedTextAreaProps = Omit<TextAreaProps, 'maxLength' | 'showCount'> & {
  maxLength: number;
  showCount?: boolean;
};
export const Utf16LimitedTextArea = React.forwardRef<TextAreaRef, Utf16LimitedTextAreaProps>(
  ({ value, maxLength, showCount = false, onChange, onCompositionStart, onCompositionEnd, ...props }, ref) => {
    const composing = useRef(false);
    const text = value == null ? '' : String(value);
    const change = (event: React.ChangeEvent<HTMLTextAreaElement>, truncate: boolean) => {
      if (truncate) event.target.value = sliceBySubmitLength(event.target.value, maxLength);
      onChange?.(event);
    };
    return (
      <div className="df-textarea">
        <Input.TextArea
          {...props}
          ref={ref}
          value={text}
          onChange={(event) => change(event, !composing.current)}
          onCompositionStart={(event) => {
            composing.current = true;
            onCompositionStart?.(event);
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            change(event as unknown as React.ChangeEvent<HTMLTextAreaElement>, true);
            onCompositionEnd?.(event);
          }}
        />
        {showCount && (
          <div className="df-count" aria-live="polite">
            {text.length} / {maxLength}
          </div>
        )}
      </div>
    );
  },
);
Utf16LimitedTextArea.displayName = 'Utf16LimitedTextArea';
