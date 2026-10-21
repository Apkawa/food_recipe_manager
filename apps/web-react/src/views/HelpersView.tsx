import { Card, List, Row } from "@repo/ui";

import { PageHeader } from "../components/PageHeader";

/**
 * Helpers page: three placeholder items.
 * Port of apps/web/src/views/HelpersView.vue.
 */
function HelpersView() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Помощник" />
      <Card>
        <List>
          <Row>
            <span className="text-sm font-medium text-text2">Пересчет концентрации уксуса</span>
          </Row>
          <Row>
            <span className="text-sm font-medium text-text2">Конвертер единиц измерения</span>
          </Row>
          <Row>
            <span className="text-sm font-medium text-text2">Таблица плотности</span>
          </Row>
        </List>
      </Card>
    </div>
  );
}

export default HelpersView;
