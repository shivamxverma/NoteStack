'use client';
import React,{useState} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../lib/schemas';
import axios from 'axios';
import { useRouter } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const [error,setError] = useState(false); 
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/users/register`, data);
      setSuccess(true);
      setTimeout(()=>{
        router.push('/login');
      },1000);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {error && (
          <div className="mb-4 text-red-500 text-center">
            Signup failed. Please try again.
          </div>
        )}
        {success && (
          <div className='mb-4 text-green-300 text-center font-bold'>
            Signup successful! Redirecting to login...
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
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
          </div>
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
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              {...register('fullName')}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 ${
                errors.fullName ? 'border-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
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
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center">
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}