useEffect(() => {
  api.get("/admin/payments").then(res => setPayments(res.data));
}, []);
