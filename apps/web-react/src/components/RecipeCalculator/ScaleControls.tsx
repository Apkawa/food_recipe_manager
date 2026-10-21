import { Button, Card, CardHeader, ProgressBar, Stepper } from "@repo/ui";

interface ScaleControlsProps {
  scale: number;
  newScale: number;
  onScaleChange: (scale: number) => void;
  onNewScaleChange: (newScale: number) => void;
}

/**
 * Portion-rescale card: a stepper for the target portions, a progress bar
 * of the scale ratio (newScale / scale) and a reset back to the original
 * portions. Port of the "Рецепт на / Пересчитать на" controls in
 * RecipeCalculator.vue — the original-portion input was replaced by the
 * mockup's read-only "из N в оригинале" caption.
 */
function ScaleControls({
  scale,
  newScale,
  onScaleChange: _onScaleChange,
  onNewScaleChange,
}: ScaleControlsProps) {
  const progress = scale > 0 ? Math.round((newScale / scale) * 100) : 0;

  return (
    <Card>
      <CardHeader>Готовим на</CardHeader>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 pt-2">
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tabular-nums tracking-tight">{newScale}</span>
          <span className="text-sm text-muted">порций · из {scale} в оригинале</span>
        </p>
        <div className="ml-auto">
          <Stepper
            value={newScale}
            onChange={onNewScaleChange}
            min={1}
            step={1}
            ariaLabel="Порции"
            ariaLabelDecrement="Меньше порций"
            ariaLabelIncrement="Больше порций"
          />
        </div>
      </div>
      <p className="border-t border-border px-4 pt-3 text-sm text-muted">
        Нажми ✎ у любого продукта и впиши, сколько его у тебя, — всё остальное пересчитается
        пропорционально.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border p-4 pt-4">
        <div className="min-w-40 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold">Готовность</p>
            <p className="text-sm font-bold tabular-nums text-accent">{progress}%</p>
          </div>
          <ProgressBar value={progress} label="Готовность" className="mt-1.5" />
        </div>
        <Button type="button" variant="secondary" onClick={() => onNewScaleChange(scale)}>
          Сбросить
        </Button>
      </div>
    </Card>
  );
}

export default ScaleControls;
