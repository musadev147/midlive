import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CategorySidebar from "../components/CategorySidebar";
import { FaLayerGroup, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

// 1. Unified Test Card (For Trending, Affordable Packages, Most Booked)
const UnifiedTestCard = ({ title, icon, time, price, oldPrice, discount }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mx-2 hover:shadow-md transition h-full flex flex-col justify-between">
    <div className="flex gap-3 mb-4">
      {/* Left Icon Box */}
      <div className="w-[60px] h-[60px] rounded-[14px] bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 p-[2px] shrink-0">
        <div className="w-full h-full bg-white rounded-[12px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 m-1 rounded-full flex items-center justify-center">
               <span className="text-2xl">{icon}</span>
            </div>
        </div>
      </div>
      {/* Right Text */}
      <div className="flex flex-col justify-center">
        <h3 className="font-bold text-gray-800 text-[13px] leading-snug line-clamp-2">{title}</h3>
        <div className="flex items-center text-[11px] text-gray-500 mt-1">
          <span className="mr-1">🕒</span> Report in {time}
        </div>
      </div>
    </div>
    {/* Bottom Price & Button */}
    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
      <div className="flex items-center gap-2">
         <span className="font-extrabold text-gray-900 text-[15px]">৳{price}</span>
         {oldPrice && <span className="text-[11px] text-gray-400 line-through">৳{oldPrice}</span>}
         {discount && <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">{discount} OFF</span>}
      </div>
      <Link to="/test-details">
        <button className="bg-[#2dd4bf] text-white px-3 py-1.5 text-xs rounded hover:bg-teal-400 font-bold transition whitespace-nowrap">
          Book Test
        </button>
      </Link>
    </div>
  </div>
);

// 2. Category Icon (Vital Organs / Health Concerns)
const GradientCategoryIcon = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center cursor-pointer group mx-2 py-2">
    <div className="w-[85px] h-[85px] rounded-[18px] bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 p-[2px] shadow-sm group-hover:shadow-md transition">
      <div className="w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 rounded-[16px] flex items-center justify-center relative">
         <div className="absolute inset-0 bg-white m-[6px] rounded-full flex items-center justify-center shadow-sm">
           <span className="text-3xl text-pink-500">{icon}</span>
         </div>
      </div>
    </div>
    <span className="text-[11px] text-center font-bold text-gray-700 mt-3 leading-tight max-w-[85px]">
      {label}
    </span>
  </div>
);

// 3. Lab Partner Card
const LabPartnerCard = ({ name, icon }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 mx-2 shadow-sm hover:shadow-md transition cursor-pointer">
    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <span className="text-sm">{icon}</span>
    </div>
    <span className="text-[13px] font-bold text-gray-700 truncate">{name}</span>
  </div>
);

// Slider Arrows & Settings
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "white", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 2, width: "32px", height: "32px", left: "-16px" }} onClick={onClick}>
      <span className="text-gray-500 font-bold text-xl leading-none" style={{ marginLeft: "-2px", marginTop: "-2px" }}>‹</span>
    </div>
  );
};

const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "white", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 2, width: "32px", height: "32px", right: "-16px" }} onClick={onClick}>
      <span className="text-gray-500 font-bold text-xl leading-none" style={{ marginRight: "-2px", marginTop: "-2px" }}>›</span>
    </div>
  );
};

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 400,
  slidesToShow: 4,
  slidesToScroll: 1,
  prevArrow: <CustomPrevArrow />,
  nextArrow: <CustomNextArrow />,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ]
};

const categorySliderSettings = {
  ...sliderSettings,
  slidesToShow: 7,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 6 } },
    { breakpoint: 1024, settings: { slidesToShow: 5 } },
    { breakpoint: 768, settings: { slidesToShow: 4 } },
    { breakpoint: 480, settings: { slidesToShow: 3 } },
  ]
};

const SectionHeader = ({ title, viewAll }) => (
  <div className="flex justify-between items-center mb-4 px-2">
    <h2 className="text-[17px] font-bold text-gray-800">{title}</h2>
    {viewAll && <button className="text-[#2dd4bf] font-bold hover:underline text-sm">View All</button>}
  </div>
);

const HomeLab = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Header
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <style>{`
        .slick-prev:before, .slick-next:before { display: none; }
        .slick-slider { margin: 0 -8px; }
        .slick-list { padding: 10px 0; }
      `}</style>
      
      <div className="flex flex-col lg:flex-row container mx-auto lg:mt-6">
        <div
          className={`
            ${
              isMobile
                ? "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-50"
                : "relative"
            }
            ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
            w-80 lg:w-72 xl:w-80 flex-shrink-0 lg:mr-6 lg:block
          `}
        >
          <div className="sticky top-16 sm:top-20 lg:top-24 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden rounded-2xl bg-white lg:bg-transparent">
            <div className="bg-white rounded-2xl shadow-lg lg:shadow-sm border border-gray-100 overflow-hidden h-full">
              {isMobile && (
                <div className="flex items-center justify-between border-b border-gray-200 p-3 lg:hidden sm:p-4">
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                      <FaLayerGroup className="text-base text-green-600 sm:text-lg" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800 sm:text-lg">Categories</h2>
                      <p className="text-xs text-gray-600 sm:text-sm">Browse by category</p>
                    </div>
                  </div>

                  <button
                    onClick={closeSidebar}
                    className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 sm:p-2"
                  >
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>
              )}

              {!isMobile && (
                <div className="p-4 lg:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-xs">
                      <FaLayerGroup className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">Categories</h2>
                      <p className="text-gray-600 text-sm">Browse by category</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-full overflow-hidden">
                <CategorySidebar
                  onCategorySelect={isMobile ? closeSidebar : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 lg:mt-0">
          <main className="container mx-auto px-2 lg:px-0 py-0 max-w-7xl overflow-hidden">
        
        {/* Banner & Action Buttons */}
        <div className="mb-10">
          <div className="w-full h-[200px] sm:h-[300px] bg-gradient-to-r from-purple-200 via-pink-100 to-blue-100 rounded-2xl mb-4 relative overflow-hidden shadow-sm flex items-center justify-center border border-purple-100">
             {/* Text placeholder mimicking the banner */}
             <div className="text-center z-10 p-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-[#5c2d91] mb-2 drop-shadow-sm">মেডিভিলা হোম ল্যাব টেস্ট</h1>
                <p className="text-lg sm:text-xl font-bold text-[#5c2d91] bg-yellow-400 px-6 py-1.5 rounded-full inline-block shadow-sm">
                  মাত্র ৳৩০০ থেকে শুরু
                </p>
             </div>
             {/* Decorative placeholder */}
             <div className="absolute right-0 bottom-0 opacity-20 text-[150px] pointer-events-none">🧬</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-3 rounded-xl shadow-sm hover:shadow-md transition text-blue-500 font-bold text-[15px]">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-lg text-blue-500">💬</div> 
                Order via Messenger
             </button>
             <button className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-3 rounded-xl shadow-sm hover:shadow-md transition text-[#2dd4bf] font-bold text-[15px]">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-lg text-[#2dd4bf]">📋</div> 
                Explore Lab Tests
             </button>
          </div>
        </div>

        {/* Trending Health Tests */}
        <section className="mb-10 relative">
          <SectionHeader title="Trending Health Tests" viewAll />
          <div className="px-2">
            <Slider {...sliderSettings}>
              <UnifiedTestCard title="Dengue Antibody (IgG & IgM)" icon="🔬" time="1 day" price="300" />
              <UnifiedTestCard title="Dengue NS1 Antigen" icon="🔬" time="1 day" price="300" />
              <UnifiedTestCard title="CBC with ESR" icon="🩸" time="12 hours" price="400" />
              <UnifiedTestCard title="Dengue IgG, IgM + CBC with ESR" icon="🧪" time="12 hours" price="890" />
              <UnifiedTestCard title="Thyroid Profile (T3, T4, TSH)" icon="🦋" time="1 day" price="1200" />
            </Slider>
          </div>
        </section>

        {/* Affordable Packages */}
        <section className="mb-10 relative">
          <SectionHeader title="Affordable Packages" viewAll />
          <div className="px-2">
            <Slider {...sliderSettings}>
              <UnifiedTestCard title="Cardiac Wellness & Cholesterol Control Package" icon="❤️" time="12 hours" price="2574" oldPrice="2860" discount="10%" />
              <UnifiedTestCard title="Liver & Digestive Health Package" icon="🥩" time="12 hours" price="2430" oldPrice="2700" discount="10%" />
              <UnifiedTestCard title="Kidney Function & Urinary Health Package" icon="🫘" time="1-2 days" price="1476" oldPrice="1640" discount="10%" />
              <UnifiedTestCard title="Diabetes & Hypertension Management Package" icon="🍩" time="12 hours" price="1875" oldPrice="2500" discount="25%" />
              <UnifiedTestCard title="Full Body Checkup Advance" icon="👨‍⚕️" time="1 day" price="4500" oldPrice="5000" discount="10%" />
            </Slider>
          </div>
        </section>

        {/* Most Booked Test Section */}
        <section className="mb-10 relative">
          <SectionHeader title="Most Booked Test" viewAll />
          <div className="px-2">
            <Slider {...sliderSettings}>
              <UnifiedTestCard title="Uric Acid" icon="🦴" time="1 day" price="400" />
              <UnifiedTestCard title="CPK" icon="❤️" time="1 day" price="1200" />
              <UnifiedTestCard title="Insulin" icon="💉" time="1 day" price="1200" />
              <UnifiedTestCard title="Serum Electrolytes (Na+/Cl-/K+)" icon="🧪" time="1 day" price="900" />
              <UnifiedTestCard title="Lipid Profile" icon="🩸" time="1 day" price="1500" />
            </Slider>
          </div>
        </section>

        {/* Checkups Base on Vital Organs */}
        <section className="mb-10 relative">
          <SectionHeader title="Checkups Base on Vital Organs" />
          <div className="px-2">
            <Slider {...categorySliderSettings}>
              <GradientCategoryIcon icon="👨‍⚕️" label="Reproductive Tests" />
              <GradientCategoryIcon icon="🦋" label="Thyroid Disorder" />
              <GradientCategoryIcon icon="🥩" label="Liver Disease" />
              <GradientCategoryIcon icon="🫘" label="Kidney Disease" />
              <GradientCategoryIcon icon="❤️" label="Heart Disease" />
              <GradientCategoryIcon icon="🩺" label="Body Checkup" />
              <GradientCategoryIcon icon="🩸" label="Hematology" />
              <GradientCategoryIcon icon="🧠" label="Brain Checkup" />
            </Slider>
          </div>
        </section>

        {/* Browse By Health Concerns */}
        <section className="mb-12 relative">
          <SectionHeader title="Browse By Health Concerns" />
          <div className="px-2">
            <Slider {...categorySliderSettings}>
              <GradientCategoryIcon icon="🩸" label="Thalassemia" />
              <GradientCategoryIcon icon="🩺" label="Diabetes" />
              <GradientCategoryIcon icon="🦋" label="Thyroid Disorder" />
              <GradientCategoryIcon icon="🥩" label="Liver Disease" />
              <GradientCategoryIcon icon="🫘" label="Kidney Disease" />
              <GradientCategoryIcon icon="❤️" label="Heart Disease" />
              <GradientCategoryIcon icon="🩸" label="Anemia Profile" />
              <GradientCategoryIcon icon="🧬" label="Cancer" />
            </Slider>
          </div>
        </section>

        {/* Our trusted lab partners */}
        <section className="mb-12 relative">
           <div className="flex justify-between items-center mb-2 px-2">
            <h2 className="text-[17px] font-bold text-gray-800">Our trusted lab partners</h2>
            <button className="text-[#2dd4bf] font-bold hover:underline text-sm">View All Labs</button>
          </div>
          <div className="px-2">
            <Slider {...{...sliderSettings, slidesToShow: 5, responsive: [{ breakpoint: 1024, settings: { slidesToShow: 4 } }, { breakpoint: 768, settings: { slidesToShow: 3 } }, { breakpoint: 480, settings: { slidesToShow: 2 } }] }}>
              <LabPartnerCard name="Tasar Uddin Hospital" icon="🏥" />
              <LabPartnerCard name="Biomed Diagnostics" icon="🔬" />
              <LabPartnerCard name="Chevron Clinical Lab" icon="⚕️" />
              <LabPartnerCard name="Generic Healthcare" icon="🩺" />
              <LabPartnerCard name="PROBE Bangladesh Ltd." icon="🏢" />
              <LabPartnerCard name="Dr Lal Path Labs" icon="🧪" />
              <LabPartnerCard name="Presova Health" icon="🏥" />
            </Slider>
          </div>
        </section>

        {/* How We Work */}
        <section className="mb-10 pt-8 pb-10 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 text-center">
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-12">How We Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative max-w-5xl mx-auto">
            {/* Connecting Dashed Arrows (Desktop only) */}
            <div className="hidden md:block absolute top-10 left-[18%] right-[82%] w-[14%] border-t-2 border-dashed border-gray-200"></div>
            <div className="hidden md:block absolute top-10 left-[43%] right-[57%] w-[14%] border-t-2 border-dashed border-gray-200"></div>
            <div className="hidden md:block absolute top-10 left-[68%] right-[32%] w-[14%] border-t-2 border-dashed border-gray-200"></div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border-[3px] border-yellow-100 relative">
                <span className="text-yellow-500 text-3xl">🧪</span>
                <div className="absolute -top-1 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold border-[3px] border-white shadow-sm">1</div>
              </div>
              <h3 className="font-bold text-gray-900 text-[15px]">Sample Collection</h3>
              <p className="text-[12px] text-gray-500 mt-2 max-w-[180px] leading-relaxed">Our experienced professionals visit your location, ensuring the safe and seamless collection.</p>
            </div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4 border-[3px] border-orange-100 relative">
                <span className="text-orange-500 text-3xl">🌡️</span>
                <div className="absolute -top-1 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold border-[3px] border-white shadow-sm">2</div>
              </div>
              <h3 className="font-bold text-gray-900 text-[15px]">Sample Storage</h3>
              <p className="text-[12px] text-gray-500 mt-2 max-w-[180px] leading-relaxed">We store your samples securely, preserving their integrity and quality.</p>
            </div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-[3px] border-red-100 relative">
                <span className="text-red-500 text-3xl">🔬</span>
                <div className="absolute -top-1 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold border-[3px] border-white shadow-sm">3</div>
              </div>
              <h3 className="font-bold text-gray-900 text-[15px]">High-Tech Lab Facility</h3>
              <p className="text-[12px] text-gray-500 mt-2 max-w-[180px] leading-relaxed">Advanced technology and expert professionals provide precise analysis.</p>
            </div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="w-20 h-20 bg-[#e0f2fe] rounded-full flex items-center justify-center mb-4 border-[3px] border-[#bae6fd] relative">
                <span className="text-[#0284c7] text-3xl">📄</span>
                <div className="absolute -top-1 -right-2 w-7 h-7 bg-[#0284c7] text-white rounded-full flex items-center justify-center text-[13px] font-bold border-[3px] border-white shadow-sm">4</div>
              </div>
              <h3 className="font-bold text-gray-900 text-[15px]">Accurate Digital Reports</h3>
              <p className="text-[12px] text-gray-500 mt-2 max-w-[180px] leading-relaxed">Receive dependable health insights and digital reports you can rely on.</p>
            </div>
          </div>
        </section>

        {/* Feature Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="bg-white border border-gray-200 rounded-xl py-5 px-4 flex flex-col items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-2xl text-green-500">🛡️</span>
              <span className="text-[13px] font-bold text-gray-700 text-center">100% Genuine<br/>Products</span>
           </div>
           <div className="bg-white border border-gray-200 rounded-xl py-5 px-4 flex flex-col items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-2xl text-blue-500">💳</span>
              <span className="text-[13px] font-bold text-gray-700 text-center">Safe & Secure<br/>Payment</span>
           </div>
           <div className="bg-white border border-gray-200 rounded-xl py-5 px-4 flex flex-col items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-2xl text-orange-500">🚚</span>
              <span className="text-[13px] font-bold text-gray-700 text-center">Countrywide<br/>Delivery</span>
           </div>
        </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomeLab;
