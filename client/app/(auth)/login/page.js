'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../lib/schemas';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        'https://notestack-o6b5.onrender.com/api/v1/users/login',
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true, 
        }
      );

      const accessToken = response.data.message.accessToken; 
      if (!accessToken) {
        throw new Error('No access token received');
      }

      console.log('Login successful:', response.data.message.accessToken);
      localStorage.setItem('accessToken', accessToken);
      router.push('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      alert(errorMessage);
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username Field (Optional, uncomment if required by backend) */}
          {/* <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register('username')}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 ${
                errors.username ? 'border-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div> */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center">
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}