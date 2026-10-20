import { useEffect, useRef, useState } from "react";

interface LazyNumberInputProps {
  id: string;
  value: number;
  min?: number;
  step?: number;
  onCommit: (value: number) => void;
}

/**
 * Number input committing on blur/Enter — port of Vue's v-model.number.lazy.
 *
 * Commits Number(text), so an emptied field commits 0 and the container guard
 * reacts exactly like the Vue app (which stored "" and compared it as < 0.1).
 */
function LazyNumberInput({ id, value, min, step, onCommit }: LazyNumberInputProps) {
  const [text, setText] = useState<string>(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(String(value));
    }
  }, [value]);

  const commit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    onCommit(Number((e.target as HTMLInputElement).value));
  };

  return (
    <input
      id={id}
      type="number"
      min={min}
      step={step}
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => {
        focused.current = false;
        commit(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(e);
        }
      }}
    />
  );
}

interface ScaleControlsProps {
  scale: number;
  newScale: number;
  onScaleChange: (scale: number) => void;
  onNewScaleChange: (newScale: number) => void;
}

/** Port of the "Рецепт на / Пересчитать на" controls in RecipeCalculator.vue. */
function ScaleControls({ scale, newScale, onScaleChange, onNewScaleChange }: ScaleControlsProps) {
  return (
    <div className="scale_wrap">
      <div>
        <label htmlFor="scale">Рецепт на</label>{" "}
        <LazyNumberInput id="scale" value={scale} min={1} onCommit={onScaleChange} /> порций
      </div>
      <div>
        <label htmlFor="new_scale">Пересчитать на</label>{" "}
        <LazyNumberInput
          id="new_scale"
          value={newScale}
          step={1}
          min={1}
          onCommit={onNewScaleChange}
        />{" "}
        порций
      </div>
    </div>
  );
}

export default ScaleControls;
