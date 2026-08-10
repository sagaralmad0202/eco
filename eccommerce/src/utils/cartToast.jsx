import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// Defaults are deliberately generic. They used to read "Beige" and "L", which
// meant a card with no size picker announced a variant the customer never
// chose — and that the cart then showed differently.
export function showAddedToCartToast({ product, quantity = 1, color = "Default", size = "One Size", totalPrice }) {
  const numericPrice = parseFloat(product.price) || 0;
  const displayPrice = totalPrice || (numericPrice * quantity).toFixed(2);
  const productImage = product.image || (product.thumbs && product.thumbs[0]);
  const variantText = `${color}${size && size !== "One Size" ? ` | ${size}` : ""}`;

  // Dismiss any existing cart toast first to re-trigger smooth entrance animation with updated quantity
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-[slideInRight_0.3s_ease-out_forwards]" : "animate-[slideOutRight_0.3s_ease-in_forwards]"
        } pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-left text-neutral-900 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10`}
        style={{ fontFamily: '"Poppins", "Poppins Fallback", sans-serif' }}
      >
        <p className="mt-1 block text-base leading-none font-semibold">Added to cart!</p>
        <div className="mt-6 flex">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-700">
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-contain object-center"
            />
          </div>
          <div className="ml-4 flex flex-1 flex-col">
            <div className="flex justify-between">
              <div className="text-left">
                <h3 className="text-base font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {variantText}
                </p>
              </div>
              <div className="mt-0.5">
                <div className="flex items-center justify-center rounded-lg border-2 border-green-500 px-2.5 py-1.5 text-sm font-medium leading-none text-green-500">
                  ${displayPrice}
                </div>
              </div>
            </div>
            <div className="flex flex-1 items-end justify-between text-sm">
              <p className="text-gray-500 dark:text-neutral-400">Qty {quantity}</p>
              <div className="flex">
                <Link
                  to="/cart"
                  onClick={() => toast.dismiss(t.id)}
                  className="font-medium text-primary-600 dark:text-primary-500 hover:underline"
                  style={{ color: "#0284c7" }}
                >
                  View cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 4000, position: "top-right", id: `cart-toast-${product.id || "item"}` }
  );
}
