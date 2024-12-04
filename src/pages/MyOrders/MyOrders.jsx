import React, { useContext, useEffect, useState } from "react";
import "./MyOrder.css";
import { assets } from "../../assets/assets"; // Adjust the path if needed
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import jsPDF from "jspdf";

// Import the logo (update the path if necessary)
import tomatoLogo from "../../assets/logo.png";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState({});

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      const ordersWithUniqueIds = response.data.data.map((order) => ({
        ...order,
        uniqueId: `${order.id}-${Math.floor(100000 + Math.random() * 900000)}`,
      }));
      setOrders(ordersWithUniqueIds);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/order/profile", {
        headers: { token },
      });
      console.log(response.data)
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const generateReceipt = (order) => {
    const doc = new jsPDF();
  
    // Define common styles and spacing
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;
  
    // Add watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(50);
    doc.text("TOMATO", pageWidth / 2, 150, { align: "center", opacity: 0.1 });
  
    // Add company logo
    if (tomatoLogo) {
      doc.addImage(tomatoLogo, "PNG", margin, yPosition, 40, 20);
    }
  
    // Add company details
    doc.setTextColor(0, 0, 0);
    yPosition += 25;
    doc.setFontSize(10);
    doc.text("Tomato Ltd.", margin, yPosition);
    doc.text("Phone: +880-18785-07129", margin, yPosition + 5);
    doc.text("Email: sabbir@tomato.com", margin, yPosition + 10);
    doc.text("Website: www.tomato.com", margin, yPosition + 15);
  
    // Add receipt title
    yPosition += 20;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Order Receipt", pageWidth / 2, yPosition, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);
  
    // Add user information
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Customer Information:", margin, yPosition);
    yPosition += 10;
    doc.text(`Name: ${userData.data.name || "N/A"}`, margin, yPosition);
    doc.text(`Email: ${userData.data.email || "N/A"}`, margin + 80, yPosition);
    yPosition += 10;
  
    // Add order summary
    doc.setFont("helvetica", "bold");
    doc.text("Order Details:", margin, yPosition);
    yPosition += 10;
    const orderDetails = [
      ["Order ID:", order.uniqueId],
      ["Order Date:", new Date().toLocaleDateString()],
      ["Amount Paid:", `$${order.amount}.00`],
      ["Status:", order.status],
      ["Payment Method:", "Paid"],
    ];
    doc.setFont("helvetica", "normal");
    orderDetails.forEach(([key, value]) => {
      doc.text(key, margin, yPosition);
      doc.text(value, margin + 80, yPosition);
      yPosition += 10;
    });
  
    // Add items table
    yPosition += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Items Purchased:", margin, yPosition);
    yPosition += 10;
    const tableStartY = yPosition;
    doc.setFontSize(10);
    doc.text("No.", margin, yPosition);
    doc.text("Item Name", margin + 20, yPosition);
    doc.text("Quantity", margin + 100, yPosition);
    doc.text("Price", margin + 140, yPosition);
  
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}`, margin, yPosition);
      doc.text(item.name, margin + 20, yPosition);
      doc.text(`${item.quantity}`, margin + 100, yPosition);
      doc.text(`$${item.price || "0.00"}`, margin + 140, yPosition);
      yPosition += 7;
    });
  
    // Add total items and amount
    yPosition += 10;
    doc.text(`Total Items: ${order.items.length}`, margin, yPosition);
    doc.text(`Total Amount: $${order.amount}.00`, margin + 100, yPosition);
  
    // Add footer
    yPosition += 20;
    doc.setFontSize(12);
    doc.setFont("courier", "italic");
    doc.text("Authorized By:", margin, yPosition);
    doc.text("Tomato Ltd.", margin, yPosition + 5);
  
    // Save the PDF
    doc.save(`Order_${order.uniqueId}_Receipt.pdf`);
  };
  

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchUserData();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {orders.map((order, index) => (
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
