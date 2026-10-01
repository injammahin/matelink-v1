import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import SiteLayout from '@/components/SiteLayout';
import AdminLayout from '@/components/AdminLayout';
import { HomePage, ServicePage, IncludedPage, AboutPage, GuaranteePage, FAQPage, PolicyPage, NotFoundPage } from '@/pages/PublicPages';
import BookingPage from '@/pages/BookingPage';
import { QuotePage, ContactPage, RecleanPage } from '@/pages/EnquiryPages';
import { BookingDetailsPage, PaymentPage } from '@/pages/CustomerPages';
import { DashboardPage, BookingsAdminPage, QuotesAdminPage, RecleansAdminPage, PaymentsAdminPage } from '@/pages/AdminOperations';
import { PricingAdminPage, ServicesAdminPage, SettingsAdminPage } from '@/pages/AdminSettings';
import { pageMetadata, services } from '@/data/content';

function RouteEffects() {
  const { pathname }=useLocation();
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant'});
    const service=services.find(s=>`/${s.slug}`===pathname);
    const [title,description]=service?[`${service.name} in Sydney`,service.summary]:pageMetadata[pathname]||[pathname.startsWith('/admin')?'Admin workspace':'Your Matelink booking','View your cleaning details and next steps with Matelink.'];
    document.title=`${title} | Matelink Cleaning`;
    document.querySelector('meta[name="description"]').setAttribute('content',description);
  },[pathname]);
  return null;
}
export default function App() {
  return <><RouteEffects/><Routes><Route element={<SiteLayout/>}><Route index element={<HomePage/>}/><Route path="deep-cleaning" element={<ServicePage serviceId="deep"/>}/><Route path="move-in-cleaning" element={<ServicePage serviceId="move-in"/>}/><Route path="end-of-lease-cleaning" element={<ServicePage serviceId="end-of-lease"/>}/><Route path="whats-included" element={<IncludedPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="bond-back-guarantee" element={<GuaranteePage/>}/><Route path="faq" element={<FAQPage/>}/><Route path="contact" element={<ContactPage/>}/><Route path="get-a-quote" element={<QuotePage/>}/><Route path="book" element={<BookingPage/>}/><Route path="booking/:token" element={<BookingDetailsPage/>}/><Route path="booking/:token/payment" element={<PaymentPage/>}/><Route path="booking/:token/re-clean" element={<RecleanPage/>}/><Route path="terms" element={<PolicyPage type="terms"/>}/><Route path="privacy" element={<PolicyPage type="privacy"/>}/><Route path="*" element={<NotFoundPage/>}/></Route><Route path="admin" element={<AdminLayout/>}><Route index element={<DashboardPage/>}/><Route path="bookings" element={<BookingsAdminPage/>}/><Route path="quotes" element={<QuotesAdminPage/>}/><Route path="recleans" element={<RecleansAdminPage/>}/><Route path="payments" element={<PaymentsAdminPage/>}/><Route path="services" element={<ServicesAdminPage/>}/><Route path="pricing" element={<PricingAdminPage/>}/><Route path="settings" element={<SettingsAdminPage/>}/><Route path="*" element={<NotFoundPage/>}/></Route></Routes><Toaster position="bottom-right" theme="light" richColors closeButton toastOptions={{style:{fontFamily:'Manrope, sans-serif'}}}/></>;
}
