import React, { useContext, useEffect, useState } from "react";
import "./MyOrder.css";
import { assets } from "../../assets/assets"; // Adjust the path if needed
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import jsPDF from "jspdf";

// Import your company logo here
import tomatoLogo from "../../assets/tomato-logo.png"; // Replace with the actual path to the logo

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

    // Draw a black underline below the title
    doc.setLineWidth(1);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 45, 200, 45); // Underline from left to right

    // Add order details in a table format
    const orderDetails = [
      ["Issue Date:", new Date().toLocaleDateString()],
      ["Order ID:", order.uniqueId],
      ["Amount:", `$${order.amount}.00`],
      ["Status:", order.status],
      ["Payment:", "Paid"],
    ];

    let yPosition = 55; // Start position for table
    orderDetails.forEach((row) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(row[0], 10, yPosition);
      doc.text(row[1], 80, yPosition);
      yPosition += 10;
    });

    // Add items list in table format
    doc.text("Items:", 10, yPosition);
    yPosition += 10;
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} x ${item.quantity}`, 20, yPosition);
      yPosition += 10;
    });
    doc.text(`Total Items: ${order.items.length}`, 10, yPosition);

    // Draw another black underline after the table
    yPosition += 15;
    doc.line(10, yPosition, 200, yPosition); // Underline after the table

    // Contact information
    doc.setFontSize(10);
    doc.text("+880-18785-07129", 10, yPosition + 10);
    doc.text("sabbir@tomato.com", 10, yPosition + 20);

    // Add default authorization signature
    yPosition += 50; // Move further down
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.text("Authorized By:", 10, yPosition);
    doc.line(40, yPosition + 2, 100, yPosition + 2); // Signature line
    doc.text("Tomato Ltd.", 10, yPosition + 10); // Company name as a placeholder for the signature

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
