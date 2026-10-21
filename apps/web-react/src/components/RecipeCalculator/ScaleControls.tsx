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
            roundToStep
            ariaLabel="Порции"
            ariaLabelDecrement="Меньше порций"
            ariaLabelIncrement="Больше порций"
          />
        </div>
      </div>
    </Card>
  );
}

export default ScaleControls;
