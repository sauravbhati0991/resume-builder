import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  return (
    <div>
      {/* Student Navbar here if you have */}
      <Outlet />
    </div>
  );
};

export default StudentLayout;