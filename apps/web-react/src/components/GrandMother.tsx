/**
 * "Neuro-grandmother" — a joke warning for invalid input.
 * Port of apps/web/src/components/GrandMother.vue.
 */
function GrandMother() {
  return (
    <div className="grandmother-wrapper">
      <img
        src="./img/grandmother.jpg"
        alt=""
        title="Нейробабушка добавлена чисто ради шутки, но в итоге она и останется"
      />
      <span className="grandmother-text">Не балуйся</span>
    </div>
  );
}

export default GrandMother;
