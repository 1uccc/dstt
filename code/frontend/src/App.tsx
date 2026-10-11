import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { auth } from './config/firebase';

export default function App() {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    });
    return () => unsubscribe();
  }, []);

  return <RouterProvider router={router} />;
}
