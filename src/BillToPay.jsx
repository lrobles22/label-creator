import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Select from "react-select";
import Tesseract from "tesseract.js";
import "./styles.css";

function BillToPay() {
  const [orders, setOrders] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*");
    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      const initializedOrders = await Promise.all(
        data.map(async (order) => {
          let billAmount = order.billAmount || "";
          if (order.invoiceUrl) {
            try {
              const result = await Tesseract.recognize(order.invoiceUrl, "eng");
              const text = result.data.text;
              const match = text.match(/TOTAL PRICE[:\s\$]*([\d,\.]+)/i);
              if (match) {
                billAmount = parseFloat(match[1].replace(/,/g, ""));
              }
            } catch (err) {
              console.error("OCR failed for invoice:", err);
            }
          }
          return {
            ...order,
            billAmount,
            billPaymentStatus: order.billPaymentStatus || "Pending",
          };
        })
      );
      setOrders(initializedOrders);
      updateTotal(initializedOrders);
    }
  };

  const updateTotal = (orderList) => {
    const total = orderList.reduce((sum, order) => {
      const val = parseFloat(order.billAmount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    setTotalBill(total.toFixed(2));
  };

  const handleBillChange = (index, value) => {
    const updatedOrders = [...orders];
    updatedOrders[index].billAmount = value;
    setOrders(updatedOrders);
    updateTotal(updatedOrders);
  };

  const handlePaymentChange = (index, selectedOption) => {
    const updatedOrders = [...orders];
    updatedOrders[index].billPaymentStatus = selectedOption.value;
    setOrders(updatedOrders);
  };

  const paymentOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const filteredOrders = orders.filter(order =>
    (selectedCompany === "" || order.company === selectedCompany) &&
    (selectedPayment === "" || order.billPaymentStatus === selectedPayment)
  );

  return (
    <div className="admin-container">
      <div className="main-content">
        <div className="content-wrapper" style={{ maxWidth: "90vw", width: "100%", margin: "0 auto" }}>
          <h2 className="section-title">Bill To Pay</h2>

          <div className="filter-bar" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label htmlFor="companyFilter"><strong>Filter by Company:</strong></label><br />
              <select
                id="companyFilter"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">All</option>
                <option value="Trotta Tires">Trotta Tires</option>
                <option value="GH Tire">GH Tire</option>
                <option value="IPW">IPW</option>
                <option value="Velocity">Velocity</option>
                <option value="Webster">Webster</option>
                <option value="Gun Hill">Gun Hill</option>
              </select>
            </div>

            <div>
              <label htmlFor="paymentFilter"><strong>Filter by Payment:</strong></label><br />
              <select
                id="paymentFilter"
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th>ORDER #</th>
                <th>CUSTOMER</th>
                <th>ADDRESS</th>
                <th>ORDER DETAILS</th>
                <th>ORDER</th>
                <th>ORDER DATE</th>
                <th>TIME</th>
                <th>GH STATUS</th>
                <th>COMPANY</th>
                <th>TROTTA STATUS</th>
                <th>BILL</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => {
                const date = order.date || "";
                const time = order.time || "";
                return (
                  <tr key={order.id || index}>
                    <td>{order.orderNumber || order.order_id}</td>
                    <td>{order.customer || order.customerName}</td>
                    <td>{order.address}</td>
                    <td>{order.orderDetails}</td>
                    <td>{order.orderNumber}</td>
                    <td>{date}</td>
                    <td>{time}</td>
                    <td>{order.ghStatus}</td>
                    <td>{order.company}</td>
                    <td>{order.trottaStatus}</td>
                    <td>
                      <input
                        type="number"
                        value={order.billAmount}
                        onChange={(e) => handleBillChange(index, e.target.value)}
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <Select
                        options={paymentOptions}
                        value={paymentOptions.find(opt => opt.value === order.billPaymentStatus)}
                        onChange={(selected) => handlePaymentChange(index, selected)}
                        className="payment-select"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ textAlign: "right", marginTop: "10px", fontWeight: "bold" }}>
            Total BILL: ${totalBill}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillToPay;
