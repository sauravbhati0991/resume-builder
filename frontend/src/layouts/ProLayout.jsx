import { Outlet } from "react-router-dom";

const ProLayout = () => {
  return (
    <div>
      {/* Pro Navbar here */}
      <Outlet />
    </div>
  );
};

export default ProLayout;