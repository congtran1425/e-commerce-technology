import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../features/auth/RequireAuth';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { CartPage } from '../pages/customer/CartPage';
import { AuthPage } from '../pages/customer/AuthPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { HomePage } from '../pages/customer/HomePage';
import { RecipeDetailPage } from '../pages/customer/RecipeDetailPage';
import { RecipesPage } from '../pages/customer/RecipesPage';
import { StoryPage } from '../pages/customer/StoryPage';
import { PaymentResultPage } from '../pages/customer/PaymentResultPage';
import { NotFoundPage } from '../pages/errors/NotFoundPage';

const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage').then((module) => ({ default: module.AdminProductsPage })));
const AdminFulfillmentPage = lazy(() => import('../pages/admin/AdminFulfillmentPage').then((module) => ({ default: module.AdminFulfillmentPage })));
const AdminInventoryPage = lazy(() => import('../pages/admin/AdminInventoryPage').then((module) => ({ default: module.AdminInventoryPage })));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage })));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage').then((module) => ({ default: module.AdminPaymentsPage })));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage').then((module) => ({ default: module.AdminReportsPage })));

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="cong-thuc" element={<RecipesPage />} />
        <Route path="cong-thuc/:slug" element={<RecipeDetailPage />} />
        <Route path="cau-chuyen" element={<StoryPage />} />
        <Route path="gio-hang" element={<CartPage />} />
        <Route path="dang-nhap" element={<AuthPage />} />
        <Route path="thanh-toan" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="thanh-toan/ket-qua" element={<RequireAuth><PaymentResultPage /></RequireAuth>} />
      </Route>

      <Route path="admin" element={<RequireAuth allowedRoles={['ADMIN']}><Suspense fallback={<div className="route-loading" role="status">Đang mở bàn quản trị…</div>}><AdminLayout /></Suspense></RequireAuth>}>
        <Route index element={<Suspense fallback={<div className="route-loading" role="status">Đang tải tổng quan…</div>}><AdminDashboardPage /></Suspense>} />
        <Route path="don-hang" element={<Suspense fallback={<div className="route-loading" role="status">Đang tải đơn hàng…</div>}><AdminOrdersPage /></Suspense>} />
        <Route path="van-chuyen" element={<Suspense fallback={<div className="route-loading" role="status">Đang tải vận chuyển…</div>}><AdminFulfillmentPage /></Suspense>} />
        <Route path="giao-dich" element={<Suspense fallback={<div className="route-loading" role="status">Đang tải giao dịch…</div>}><AdminPaymentsPage /></Suspense>} />
        <Route path="san-pham" element={<Suspense fallback={<div className="route-loading" role="status">Đang tải sản phẩm…</div>}><AdminProductsPage /></Suspense>} />
        <Route path="kho" element={<Suspense fallback={<div className="route-loading" role="status">Đang tải kho…</div>}><AdminInventoryPage /></Suspense>} />
        <Route path="bao-cao" element={<Suspense fallback={<div className="route-loading" role="status">Đang tải báo cáo…</div>}><AdminReportsPage /></Suspense>} />
      </Route>

      <Route path="404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
