
// sharedStorage.js
export const saveOrdersToLocalStorage = (orders) => {
  localStorage.setItem('orders', JSON.stringify(orders));
  window.dispatchEvent(new Event('storage'));
};

export const getOrdersFromLocalStorage = () => {
  const saved = localStorage.getItem('orders');
  return saved ? JSON.parse(saved) : [];
};
