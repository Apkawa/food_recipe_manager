import { useEffect, useRef, useState } from "react";

interface RawRecipeEditorProps {
  value: string;
  onChange: (rawRecipe: string) => void;
}

/**
 * Textarea for the raw recipe text, committing on blur — port of Vue's
 * v-model.lazy on #raw_recipe. External updates (e.g. ingredient edits
 * rewriting the text) are reflected unless the user is typing.
 */
function RawRecipeEditor({ value, onChange }: RawRecipeEditorProps) {
  const [text, setText] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(value);
    }
  }, [value]);

  return (
    <textarea
      id="raw_recipe"
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => {
        focused.current = false;
        onChange(e.target.value);
      }}
    />
  );
}

export default RawRecipeEditor;
