import React, { useContext, useEffect, useState } from "react";
import "./MyOrder.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import jsPDF from "jspdf";
import tomatoLogo from "../../assets/logo.png"; // Import company logo

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  // Function to generate unique random digits for Order ID
  const generateUniqueId = (baseId) => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    return baseId ? `${baseId}-${randomDigits}` : `${randomDigits}`; // Use baseId if defined, otherwise only random digits
  };

  // Fetch orders and assign unique IDs
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      const ordersWithUniqueIds = response.data.data.map((order) => ({
        ...order,
        uniqueId: generateUniqueId(order.id), // Add unique ID to each order
      }));
      setData(ordersWithUniqueIds);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Generate PDF receipt for a specific order
  const generateReceipt = (order) => {
    const doc = new jsPDF();

    // Add watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(40);
    doc.text("Tomato.", 105, 150, { align: "center", opacity: 0.1 });

    // Add company logo
    doc.addImage(tomatoLogo, "PNG", 10, 10, 40, 20); // Adjust position and size as needed

    // Add title
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Order Receipt", 105, 40, { align: "center" });

    // Add issue date
    const issueDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Issue Date: ${issueDate}`, 10, 60);

    // Order details
    doc.setFontSize(14);
    doc.text(`Order ID: ${order.uniqueId}`, 10, 75);
    doc.text(`Amount: $${order.amount}.00`, 10, 85);
    doc.text(`Status: ${order.status}`, 10, 95);
    doc.text(`Payment: Paid`, 10, 105);

    // Items list
    doc.text("Items:", 10, 115);
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity}`, 20, 125 + index * 10);
    });

    doc.text(`Total Items: ${order.items.length}`, 10, 125 + order.items.length * 10 + 10);

    // Add signature placeholder
    doc.text("Authorized Signature:", 10, 160);
    doc.line(10, 165, 70, 165); // Signature line

    // Save the PDF
    doc.save(`Order_${order.uniqueId}_Receipt.pdf`);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="Parcel Icon" />
            <p>
              {order.items.map((item, index) =>
                index === order.items.length - 1
                  ? `${item.name} x ${item.quantity}`
                  : `${item.name} x ${item.quantity}, `
              )}
            </p>
            <p>${order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p>
              <span>&#x25cf;</span>
              <b>{order.status}</b>
            </p>
            <p>
              <b>Payment:</b> Paid
            </p>
            <p>
              <b>Order ID:</b> {order.uniqueId}
            </p>
            <div className="buttons-container">
              <button onClick={fetchOrders}>Track Order</button>
              <button onClick={() => generateReceipt(order)}>Receipts</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
