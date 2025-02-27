import { Routes, Route } from "react-router-dom";
import UsersPage from "../pages/UsersPage";
import SparePartOrderPage from "../pages/SparePartOrderPage";
import SparePartsPage from "../pages/SparePartsPage";
import CarOrderManagementPage from "../pages/CarOrdersPage";
import CarsManagement from "../pages/CarsPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/cars" element={<CarsManagement />} />
      <Route path="/carorders" element={<CarOrderManagementPage />} />
      <Route path="/spareorders" element={<SparePartOrderPage />} />
      <Route path="/spareparts" element={<SparePartsPage />} />
    </Routes>
  );
};

export default AppRouter;
