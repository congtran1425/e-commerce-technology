import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../features/auth/RequireAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { CartPage } from '../pages/customer/CartPage';
import { AuthPage } from '../pages/customer/AuthPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { HomePage } from '../pages/customer/HomePage';
import { RecipeDetailPage } from '../pages/customer/RecipeDetailPage';
import { PaymentResultPage } from '../pages/customer/PaymentResultPage';
import { NotFoundPage } from '../pages/errors/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="cong-thuc/:slug" element={<RecipeDetailPage />} />
        <Route path="gio-hang" element={<CartPage />} />
        <Route path="dang-nhap" element={<AuthPage />} />
        <Route path="thanh-toan" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="thanh-toan/ket-qua" element={<RequireAuth><PaymentResultPage /></RequireAuth>} />
      </Route>

      <Route path="admin" element={<RequireAuth allowedRoles={['ADMIN']}><AdminLayout /></RequireAuth>}>
        <Route index element={<AdminDashboardPage />} />
      </Route>

      <Route path="404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
