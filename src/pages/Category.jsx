import { useContext, useMemo } from "react";
import { ProductContext } from "../context/ProductsContext";
import CategoryShowcase from "../components/CategoryShowcase";

const Category = ({ toggleSidebar }) => {
  const { categories } = useContext(ProductContext);

  const mainCategories = useMemo(() => {
    return (categories || []).filter(
      (category) =>
        category.parent_id === null ||
        category.parent_id === undefined ||
        Number(category.parent_id) === 0
    );
  }, [categories]);

  return (
    <CategoryShowcase
      categories={mainCategories}
      toggleSidebar={toggleSidebar}
      padToMultiple
    />
  );
};

export default Category;
