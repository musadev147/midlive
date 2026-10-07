import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import { config } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';

const apiUrl = config.apiUrl;

const LegalPage = () => {
  const { slug } = useParams();
  const [legalContent, setLegalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLegalPage = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${apiUrl}/legalpages/${slug}`);
        setLegalContent(response.data);
      } catch (err) {
        console.error('Error fetching legal page:', err);
        setLegalContent(null);
        setError('Failed to load legal page. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLegalPage();
  }, [apiUrl, slug]);

  const updatedDate = legalContent?.updatedAt
    ? new Date(legalContent.updatedAt).toLocaleDateString()
    : '';

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-900">
      <Header />

      <section className="w-full container mx-auto flex flex-col px-4 py-2.5 md:py-6">
        <nav aria-label="Breadcrumb" className="mb-2.5 md:mb-6">
          <ol className="mx-auto flex max-w-full list-none items-center overflow-x-auto whitespace-nowrap p-0 no-scrollbar">
            <li className="mb-1 mt-1 flex items-center" role="listitem">
              <Link to="/">
                <span className="capitalize text-sm text-gray-700 transition-colors duration-200 hover:text-green-600 md:text-base">
                  Home
                </span>
              </Link>
            </li>

            <li className="mb-1 mt-1 flex items-center" role="listitem">
              <span className="mx-2 flex items-center text-gray-400" aria-hidden="true">
                <FaChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <Link to="/">
                <span className="capitalize text-sm text-gray-700 transition-colors duration-200 hover:text-green-600 md:text-base">
                  Page
                </span>
              </Link>
            </li>

            <li className="mb-1 mt-1 flex items-center" role="listitem">
              <span className="mx-2 flex items-center text-gray-400" aria-hidden="true">
                <FaChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <span
                className="capitalize text-sm text-gray-500 transition-colors duration-200 md:text-base"
                aria-current="page"
              >
                {loading ? 'Legal Page' : legalContent?.title || 'Legal Page'}
              </span>
            </li>
          </ol>
        </nav>

        <div className="w-full">
          <article className="w-full">
            <h1 id="page-title" className="mb-5 text-base font-bold text-black md:text-lg">
              {loading ? 'Loading page...' : legalContent?.title || 'Legal Page'}
            </h1>

            <article className="relative mb-5 rounded-md border border-gray-200 bg-white py-5 shadow-sm transition-all duration-300">
              <section className="px-4 text-gray-800">
                <div className="pl-2.5 leading-7 text-gray-800">
                  {loading ? (
                    <div className="flex min-h-[35vh] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-600" />
                        <p className="mt-4 text-sm font-medium text-gray-600">
                          Loading page...
                        </p>
                      </div>
                    </div>
                  ) : legalContent ? (
                    <>
                      {updatedDate && (
                        <p className="mb-5 text-sm text-gray-500">
                          Last updated: {updatedDate}
                        </p>
                      )}

                      <div
                        className="legal-content prose max-w-none prose-p:my-3 prose-headings:scroll-mt-24 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:my-1"
                        dangerouslySetInnerHTML={{ __html: legalContent.content }}
                      />
                    </>
                  ) : (
                    <div className="flex min-h-[35vh] items-center justify-center text-center">
                      <div className="max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Legal page not found
                        </h2>
                        <p className="mt-3 text-sm text-gray-600">
                          {error || 'The page you are looking for does not exist or has been removed.'}
                        </p>
                        <Link
                          to="/"
                          className="mt-6 inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          Back to Home
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </article>

            {legalContent && (
              <div className="mb-5 rounded-md border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600 shadow-sm">
                If you have any questions about our {legalContent.title.toLowerCase()}, please contact us.
              </div>
            )}
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalPage;
