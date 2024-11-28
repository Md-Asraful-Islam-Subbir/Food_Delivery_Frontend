import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const url = "https://food-delivery-backend-qtrw.onrender.com"; // Replace with your actual backend URL

  // Fetch the food list from the backend
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  // Add to cart
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    if (token) {
      try {
        await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } });
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (cartItems[itemId] > 1) {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    } else {
      const updatedCart = { ...cartItems };
      delete updatedCart[itemId];
      setCartItems(updatedCart);
    }

    if (token) {
      try {
        await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  // Toggle stock status of a food item
  const toggleStockStatus = async (itemId) => {
    try {
      const response = await axios.post(`${url}/api/food/toggle-stock`, { id: itemId });
      if (response.data.success) {
        const updatedFoodList = foodList.map((food) =>
          food._id === itemId ? { ...food, inStock: !food.inStock } : food
        );
        setFoodList(updatedFoodList);
      }
    } catch (error) {
      console.error("Error toggling stock status:", error);
    }
  };

  // Calculate the total cost of items in the cart
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const item = foodList.find((food) => food._id === itemId);
      if (item) totalAmount += item.price * cartItems[itemId];
    }
    return totalAmount;
  };

  // Load cart data from the backend
  const loadCartData = async (userToken) => {
    try {
      const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token: userToken } });
      setCartItems(response.data.cartData);
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchFoodList();

      if (localStorage.getItem("token")) {
        const userToken = localStorage.getItem("token");
        setToken(userToken);
        await loadCartData(userToken);
      }
    };
    initializeData();
  }, []);

  const contextValue = {
    foodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    toggleStockStatus,
    url,
    token,
    setToken,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
