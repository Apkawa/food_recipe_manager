import { Button, Details, DetailsSummary, Textarea } from "@repo/ui";
import { useEffect, useRef, useState } from "react";

interface RawRecipeEditorProps {
  value: string;
  onChange: (rawRecipe: string) => void;
}

/**
 * Disclosure with the raw recipe textarea, committing on blur — port of Vue's
 * v-model.lazy on #raw_recipe. External updates (e.g. ingredient edits
 * rewriting the text) are reflected unless the user is typing. The
 * "Разобрать рецепт" button commits the current text (parsing is automatic).
 */
function RawRecipeEditor({ value, onChange }: RawRecipeEditorProps) {
  const [text, setText] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(value);
    }
  }, [value]);

  const commit = () => {
    focused.current = false;
    onChange(text);
  };

  return (
    <Details className="rounded-card border border-border bg-card shadow-card">
      <DetailsSummary>Текстовый рецепт</DetailsSummary>
      <div className="border-t border-border p-4 pt-3">
        <Textarea
          id="raw_recipe"
          aria-label="Текст рецепта"
          rows={7}
          value={text}
          onChange={setText}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={commit}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={commit}>
            Разобрать рецепт
          </Button>
          <p className="text-xs text-muted">
            Вставь текст из любого сайта — мы сами найдём ингредиенты и порции.
          </p>
        </div>
      </div>
    </Details>
  );
}

export default RawRecipeEditor;
