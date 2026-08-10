import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productsApi from "../../services/productsApi";
import { toCardProducts } from "../../utils/productAdapter";

// Filter state plus the home page's product rails.
//
// The rails are separate keys rather than one shared `items` array on purpose:
// three sections show three different queries, and a single array would mean
// whichever request landed last overwrote the other two.

// Every rail loads and fails the same way, so they share one shape.
const emptyRail = { items: [], status: "idle", error: null };

function railReducers(builder, thunk, key) {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].status = "loading";
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].status = "succeeded";
      state[key].items = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].status = "failed";
      // Items are left alone. If a refetch fails, showing the products that
      // are already on screen beats replacing them with an error.
      state[key].error = action.payload ?? "Could not load products.";
    });
}

/**
 * The curated rail. Returns nothing until products are flagged `isFeatured` in
 * the database — the section falls back to newest so a fresh install does not
 * render an empty band where a slider should be.
 */
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async ({ limit = 8 } = {}, { rejectWithValue }) => {
    try {
      const response = await productsApi.listFeatured({ limit });

      if (response.items?.length) {
        return toCardProducts(response.items);
      }

      const fallback = await productsApi.listNewest({ limit });
      return toCardProducts(fallback.items);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  "products/fetchNewArrivals",
  async ({ limit = 12 } = {}, { rejectWithValue }) => {
    try {
      const response = await productsApi.listNewest({ limit });
      return toCardProducts(response.items);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * The large-product slider. Its card renders three thumbnails per product, but
 * the list endpoint returns only one image per row (`take: 1`), so each product
 * is fetched in full by slug.
 *
 * That is N+1 requests, which is why the limit is small and deliberate. The
 * alternative — widening the list endpoint's image include for every caller —
 * would slow down the rails that only ever show one image.
 */
export const fetchShowcaseProducts = createAsyncThunk(
  "products/fetchShowcase",
  async ({ limit = 4, category } = {}, { rejectWithValue }) => {
    try {
      const response = await productsApi.list({
        limit,
        sort: "newest",
        ...(category ? { category } : {}),
      });

      const detailed = await Promise.all(
        response.items.map(async (item) => {
          try {
            const detail = await productsApi.getBySlug(item.slug);
            return detail.data;
          } catch {
            // One product failing to expand should cost that product its extra
            // images, not take the whole rail down with it.
            return item;
          }
        })
      );

      return toCardProducts(detailed);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsApi.listCategories();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * The filterable grid, with pagination.
 *
 * Separate from the rails because it is the only rail whose query changes: the
 * others fetch once and sit there, this one refetches every time a filter moves
 * and appends when "Show me more" is pressed.
 *
 * Multiple categories are fetched in parallel and merged, because the API takes
 * one `category` slug per request. Merged pagination is approximate — "has a
 * next page" means at least one of the selected categories does — which is the
 * cost of letting the dropdown stay multi-select. Duplicates are removed by id,
 * since a product can sit under a parent and a child.
 */
export const fetchCatalogue = createAsyncThunk(
  "products/fetchCatalogue",
  async (
    { categories = [], minPrice, maxPrice, sort = "newest", page = 1, limit = 8, append = false } = {},
    { rejectWithValue }
  ) => {
    const params = {
      page,
      limit,
      sort,
      ...(minPrice !== undefined ? { minPrice } : {}),
      ...(maxPrice !== undefined ? { maxPrice } : {}),
    };

    try {
      if (categories.length <= 1) {
        const response = await productsApi.list({
          ...params,
          ...(categories[0] ? { category: categories[0] } : {}),
        });

        return {
          items: toCardProducts(response.items),
          hasNext: Boolean(response.pagination?.hasNext),
          page,
          append,
        };
      }

      const responses = await Promise.all(
        categories.map((category) => productsApi.list({ ...params, category }))
      );

      const seen = new Set();
      const merged = [];

      for (const response of responses) {
        for (const item of response.items ?? []) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          merged.push(item);
        }
      }

      return {
        items: toCardProducts(merged),
        hasNext: responses.some((r) => r.pagination?.hasNext),
        page,
        append,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  searchQuery: "",
  selectedCategory: "All",
  priceRange: [0, 500],
  sortBy: "featured",

  featured: { ...emptyRail },
  newArrivals: { ...emptyRail },
  showcase: { ...emptyRail },
  categories: { ...emptyRail },

  // The filterable grid keeps two extra fields the rails do not need: whether
  // another page exists, and which page is loaded. `loadingMore` is separate
  // from `status` so appending shows a spinner on the button instead of
  // replacing the grid the customer is looking at with skeletons.
  catalogue: { ...emptyRail, page: 1, hasNext: false, loadingMore: false },
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.selectedCategory = "All";
      state.priceRange = [0, 500];
      state.sortBy = "featured";
    },
  },
  extraReducers: (builder) => {
    railReducers(builder, fetchFeaturedProducts, "featured");
    railReducers(builder, fetchNewArrivals, "newArrivals");
    railReducers(builder, fetchShowcaseProducts, "showcase");
    railReducers(builder, fetchCategories, "categories");

    // The catalogue does not use railReducers: it has to tell a first load
    // apart from an append, and the two behave differently on screen.
    builder
      .addCase(fetchCatalogue.pending, (state, action) => {
        const appending = action.meta.arg?.append;
        state.catalogue.error = null;
        if (appending) {
          state.catalogue.loadingMore = true;
        } else {
          state.catalogue.status = "loading";
        }
      })
      .addCase(fetchCatalogue.fulfilled, (state, action) => {
        const { items, hasNext, page, append } = action.payload;

        state.catalogue.status = "succeeded";
        state.catalogue.loadingMore = false;
        state.catalogue.hasNext = hasNext;
        state.catalogue.page = page;
        state.catalogue.items = append
          ? [...state.catalogue.items, ...items]
          : items;
      })
      .addCase(fetchCatalogue.rejected, (state, action) => {
        state.catalogue.status = "failed";
        state.catalogue.loadingMore = false;
        state.catalogue.error = action.payload ?? "Could not load products.";
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setPriceRange,
  setSortBy,
  resetFilters,
} = productsSlice.actions;

export const selectSearchQuery = (state) => state.products.searchQuery;
export const selectSelectedCategory = (state) => state.products.selectedCategory;
export const selectPriceRange = (state) => state.products.priceRange;
export const selectSortBy = (state) => state.products.sortBy;

export const selectFeaturedRail = (state) => state.products.featured;
export const selectNewArrivalsRail = (state) => state.products.newArrivals;
export const selectShowcaseRail = (state) => state.products.showcase;
export const selectCategoriesRail = (state) => state.products.categories;
export const selectCatalogueRail = (state) => state.products.catalogue;

/** Flat list of every category and subcategory, for filter dropdowns. */
export const selectCategoryOptions = (state) =>
  state.products.categories.items.flatMap((category) => [
    { name: category.name, slug: category.slug, productCount: category.productCount },
    ...(category.children ?? []).map((child) => ({
      name: child.name,
      slug: child.slug,
      productCount: child.productCount,
    })),
  ]);

export default productsSlice.reducer;
