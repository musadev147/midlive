import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white text-white">
      <Header />

      <section className="bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 mb-24 text-7xl tracking-tight font-extrabold lg:text-9xl text-white">
              404
            </h1>
            <p className="mb-4 text-3xl tracking-tight font-bold md:text-4xl text-white">
              Page not found currently
            </p>
            <p className="mb-4 text-lg font-light text-gray-300">
              Sorry, we can&apos;t find such page.
            </p>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-purple-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800 focus:outline-none focus:ring-1 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            >
              Back To Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NotFound;
