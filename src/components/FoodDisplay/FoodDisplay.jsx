import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {food_list.length === 0 ? (
          <p>No items available</p>
        ) : (
          food_list.map((item, index) => {
            if (category === "All" || category === item.category) {
              return (
                <div key={index} className={`food-item ${item.inStock ? "" : "out-of-stock"}`}>
                  <FoodItem
                    id={item._id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    image={item.image}
                  />
                  {!item.inStock && <p className="stock-status">Out of Stock</p>}
                </div>
              );
            }
            return null;
          })
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
