import FavoritesList from "../components/FavoritesList";
import { PageHeader } from "../components/PageHeader";

/**
 * Favorites route.
 * Port of apps/web/src/views/RecipeFavoritesView.vue.
 */
function FavoritesView() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Избранное" />
      <FavoritesList />
    </div>
  );
}

export default FavoritesView;
