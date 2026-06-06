import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import useCart from "../../hooks/useCart";

export default function WishlistCard({
  item,
  onRemove,
}) {

  const { addToCart } =
    useCart();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border">

      <img
        src={
          item.imageUrl ||
          "https://placehold.co/600x400"
        }
        alt={item.productName}
        className="w-full h-60 object-cover"
      />

      <div className="p-5">

        <div className="flex justify-between items-start">

          <div>

            <h2 className="text-xl font-bold">
              {item.productName}
            </h2>

            <p className="text-indigo-600 font-semibold mt-2">
              ₹{item.price}
            </p>

          </div>

          <button
            onClick={() =>
              onRemove(
                item.productId
              )
            }
            className="text-red-500 hover:scale-110 transition"
          >

            <Heart
              fill="currentColor"
              size={22}
            />

          </button>

        </div>

        <button
          onClick={() =>
            addToCart(
              {
                productId:
                  item.productId,
                productName:
                  item.productName,
                price:
                  item.price,
                images: [
                  {
                    imageUrl:
                      item.imageUrl,
                  },
                ],
              },
              1
            )
          }
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >

          <ShoppingCart size={18} />

          Add to Cart

        </button>

      </div>

    </div>
  );
}