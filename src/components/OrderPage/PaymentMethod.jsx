const renderPaymentMethods = () => {
    if (userStatus === 'blocked') {
      // Blocked ইউজারের জন্য বিকল্প পেমেন্ট মেথড
      return (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">পেমেন্ট মেথড</h3>
          </div>
          
          <div className="p-4 bg-white space-y-4">
            {/* নগদ পেমেন্ট অপশন */}
            <div className="flex items-start">
              <input 
                type="radio" 
                id="cashPayment" 
                name="paymentMethod" 
                value="cash" 
                className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded mt-1"
                defaultChecked
              />
              <label htmlFor="cashPayment" className="ml-3 block">
                <span className="text-lg font-semibold text-gray-800">নগদে পেমেন্ট</span>
                <p className="text-sm text-gray-600 mt-1">
                  আমাদের প্রতিনিধির সাথে সরাসরি নগদ লেনদেন করুন
                </p>
              </label>
            </div>
            
            {/* বিকাশ পেমেন্ট অপশন */}
            <div className="flex items-start">
              <input 
                type="radio" 
                id="bkashPayment" 
                name="paymentMethod" 
                value="bkash" 
                className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded mt-1"
              />
              <label htmlFor="bkashPayment" className="ml-3 block">
                <span className="text-lg font-semibold text-gray-800">বিকাশ</span>
                <p className="text-sm text-gray-600 mt-1">
                  বিকাশ মার্চেন্ট নাম্বারে টাকা পাঠান
                </p>
                <div className="mt-2 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  <p className="text-sm font-medium text-yellow-800">
                    বিকাশ নম্বর: 01XXXXXXXXX
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    রেফারেন্স হিসেবে আপনার মোবাইল নম্বরটি দিন
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      );
    } else {
      // নরমাল ইউজারের জন্য Cash on Delivery
      return (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center bg-gray-50 px-4 py-3 border-b border-gray-200">
            <input 
              type="radio" 
              id="cashOnDelivery" 
              name="paymentMethod" 
              className="h-5 w-5 text-green-500 focus:ring-green-400 border-gray-300 rounded"
              checked
              readOnly
            />
            <label htmlFor="cashOnDelivery" className="ml-3 block">
              <span className="flex items-center">
                <span className="text-lg font-semibold text-gray-800">ক্যাশ অন ডেলিভারি</span>
                <span className="ml-2 px-2 py-1 text-xs text-center font-medium bg-green-100 text-green-800 rounded-full">
                  সর্বাধিক ব্যবহৃত
                </span>
              </span>
            </label>
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-start">
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  পণ্য হাতে পেয়ে নগদ অর্থ প্রদান করুন। ডেলিভারি এজেন্টের কাছে সরাসরি টাকা পরিশোধ করুন। 
                  <span className="block mt-1 font-medium text-green-600">
                    কোন অতিরিক্ত চার্জ প্রযোজ্য নয়
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                    </svg>
                    নিরাপদ
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-800 border border-purple-100">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                    </svg>
                    দ্রুত
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-100">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                    বিশ্বস্ত
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };