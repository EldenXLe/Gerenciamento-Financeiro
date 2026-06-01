import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FinanceProvider } from './context/FinanceContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <FinanceProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1c1c28',
              color: '#f0f0f8',
              border: '1px solid #ffffff10',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10d97a', secondary: '#1c1c28' } },
            error: { iconTheme: { primary: '#f05a5a', secondary: '#1c1c28' } },
          }}
        />
      </FinanceProvider>
    </BrowserRouter>
  );
}
