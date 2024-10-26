'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/lib/config';

interface CardProps {
  title?: string;
  content: string | number;
  footer?: string;
}

export const revalidate = 10; //revalidate every 10 seconds

const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Title */}
      {title && <div className="text-gray-500 text-sm">{title}</div>}
      {/* Main Content */}
      <div className="text-4xl font-bold text-gray-900">{content}</div>
    </div>
  );
};

Card;

const CardsDetails = () => {
  const [stats, setStats] = useState<{
    totalProducts: number;
    availableStock: number;
    lowStock: number;
    outOfStock: number;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/dashboard/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    // Loading skeletons
    return (
      <>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          {/* Title Skeleton */}
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          {/* Content Skeleton */}
          <div className="h-8 bg-gray-300 rounded w-2/3"></div>
          {/* Footer Skeleton */}
          <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Total Products */}
      <Card
        title="Total Products"
        content={stats?.totalProducts.toLocaleString() || '0'}
      />
      {/* Available Stock */}
      <Card
        title="Available Stock"
        content={stats?.availableStock.toLocaleString() || '0'}
      />
      {/* Low Stock */}
      <Card
        title="Low Stock"
        content={stats?.lowStock.toLocaleString() || '0'}
      />
      {/* Out of Stock */}
      <Card
        title="Out of Stock"
        content={stats?.outOfStock.toLocaleString() || '0'}
      />
    </>
  );
};

export default CardsDetails;
