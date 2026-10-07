import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Reusing UnifiedTestCard from HomeLab for Related Tests
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
      <button className="bg-[#2dd4bf] text-white px-3 py-1.5 text-xs rounded hover:bg-teal-400 font-bold transition whitespace-nowrap">
        Book Test
      </button>
    </div>
  </div>
);

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

const TestDetails = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedLab, setSelectedLab] = React.useState("Dr Lal Path Labs");
  const [patients, setPatients] = React.useState(1);

  const price = 300;
  const total = price * patients;

  const labs = [
    { name: "Dr Lal Path Labs", price: 300, icon: "🏥" },
    { name: "Chevron Clinical Laboratory (Pte.) L...", price: 300, icon: "⚕️" },
    { name: "Praava Health", price: 300, icon: "🍃" },
    { name: "PROBE Bangladesh Ltd.", price: 300, icon: "🏢" },
    { name: "Popular Diagnostic Centre", price: 300, icon: "🏥" }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans relative">
      <Header />
      
      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl z-10 overflow-hidden relative flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <span className="text-xl">✕</span>
            </button>

            <div className="p-6 sm:p-8 overflow-y-auto">
              {/* Header Info */}
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 p-[2px] shrink-0">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-3xl">
                    🦟
                  </div>
                </div>
                <div>
                  <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">SINGLE</span>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">Dengue NS1 Antigen</h2>
                  <p className="text-xs text-gray-500 mt-1">Rapid Detection for Dengue: Unveiling insights with the NS1 Antigen Test</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-blue-50 px-2 py-1 rounded-md"><span className="text-blue-400">💧</span> Blood</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-blue-50 px-2 py-1 rounded-md"><span className="text-blue-400">🕒</span> Report in 1 day</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-blue-50 px-2 py-1 rounded-md"><span className="text-blue-400">📑</span> 1 Parameter</div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column: Labs */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Choose a lab</h3>
                  <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {labs.map((lab, index) => (
                      <label 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${selectedLab === lab.name ? 'border-[#2dd4bf] bg-[#f0fdfa]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="lab" 
                            className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                            checked={selectedLab === lab.name}
                            onChange={() => setSelectedLab(lab.name)}
                          />
                          <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-sm border border-gray-100">{lab.icon}</div>
                          <span className="text-sm font-bold text-gray-700">{lab.name}</span>
                        </div>
                        <span className="font-extrabold text-gray-900 text-sm">৳{lab.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right Column: Checkout Summary */}
                <div className="w-full md:w-[300px] shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-900 text-sm">Patients</span>
                    <span className="text-xs text-gray-500">{patients} person</span>
                  </div>
                  
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-6">
                    <button 
                      className="px-4 py-2 bg-gray-50 text-gray-500 hover:bg-gray-100 transition"
                      onClick={() => setPatients(Math.max(1, patients - 1))}
                    >−</button>
                    <div className="flex-1 text-center font-bold text-sm">{patients}</div>
                    <button 
                      className="px-4 py-2 bg-[#2dd4bf] text-white hover:bg-teal-400 transition"
                      onClick={() => setPatients(patients + 1)}
                    >+</button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2">{selectedLab}</span>
                      <span className="font-bold text-gray-900 shrink-0">৳{price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">× {patients} patient</span>
                      <span className="font-bold text-gray-900">৳{total}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">Total</span>
                    <span className="text-2xl font-extrabold text-[#2dd4bf]">৳{total}</span>
                  </div>

                  <button className="w-full bg-[#2dd4bf] text-white font-bold py-3 rounded-xl hover:bg-teal-400 transition shadow-sm mb-2">
                    Add to Cart
                  </button>
                  <p className="text-[10px] text-center text-gray-400">Only one lab can be selected per order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-xs sm:text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
           <Link to="/" className="hover:text-blue-500 whitespace-nowrap">Home</Link>
           <span className="text-gray-400">&gt;</span>
           <Link to="/home-lab" className="hover:text-blue-500 whitespace-nowrap">Home Lab</Link>
           <span className="text-gray-400">&gt;</span>
           <span className="hover:text-blue-500 cursor-pointer whitespace-nowrap">All Lab Tests</span>
           <span className="text-gray-400">&gt;</span>
           <span className="text-blue-500 font-semibold whitespace-nowrap">Test Details</span>
        </div>

        {/* Top Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Images */}
          <div className="flex gap-4">
             {/* Thumbnail sidebar */}
             <div className="w-20 shrink-0">
               <div className="border-2 border-blue-400 rounded-lg overflow-hidden cursor-pointer p-1">
                 <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 h-16 rounded flex items-center justify-center text-white text-2xl relative">
                    <span className="absolute">🦟</span>
                 </div>
               </div>
             </div>
             {/* Main Image */}
             <div className="flex-1 bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 rounded-xl p-8 flex items-center justify-center relative overflow-hidden aspect-square sm:aspect-auto sm:h-[400px]">
                <div className="bg-white rounded-full w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center shadow-lg relative z-10">
                   <span className="text-[100px] sm:text-[120px]">🦟</span>
                </div>
                {/* Decorative lines */}
                <svg className="absolute top-8 left-8 w-16 h-16 text-cyan-200" viewBox="0 0 100 100"><path d="M10,90 Q90,90 90,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/></svg>
                <svg className="absolute bottom-8 right-8 w-16 h-16 text-pink-300" viewBox="0 0 100 100"><path d="M10,90 Q90,90 90,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/></svg>
             </div>
          </div>

          {/* Right Column: Text & Actions */}
          <div className="flex flex-col border border-gray-100 bg-white p-6 sm:p-8 rounded-xl shadow-sm">
             <div className="flex justify-between items-start mb-2">
                 <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">SINGLE TEST</p>
                 <div className="flex gap-2">
                     <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded text-xs font-bold">🩸</span>
                     <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-xs font-bold">🧪</span>
                 </div>
             </div>
             
             <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Dengue NS1 Antigen</h1>
             <p className="text-gray-600 text-sm mb-1 font-medium">Rapid Detection for Dengue: Unveiling insights with the NS1 Antigen Test.</p>
             <p className="text-xs text-gray-400 mb-6 italic">also known as dengue NS1 antigen test</p>

             <div className="flex flex-wrap gap-3 mb-6">
                 <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                    <span className="text-blue-500">🕒</span> Report in 1 day
                 </div>
                 <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                    <span className="text-green-500">🍽️</span> Fasting: No
                 </div>
                 <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                    <span className="text-red-500">🩸</span> Sample: Blood
                 </div>
             </div>

             <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6">
                <span className="text-3xl font-extrabold text-gray-900">৳300</span>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#2dd4bf] text-white px-8 py-3 rounded-lg hover:bg-teal-400 font-bold transition shadow-sm"
                >
                   Book Test
                </button>
             </div>

             <div className="mb-6">
                <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3"><span className="text-gray-400">📄</span> Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                   NS1 antigen test (nonstructural protein 1) is a test for dengue, introduced in 2006. It allows rapid detection on the first day of fever, before antibodies appear some 5 or more days later. It has been adopted for use in some 40 nations. The method of detection is through enzyme-linked immunosorbent assay.
                </p>
             </div>

             <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">CATEGORIES:</p>
                <div className="flex gap-2">
                   <span className="border border-gray-200 text-gray-600 px-3 py-1 rounded text-xs">Healthcheckup Packages</span>
                   <span className="border border-gray-200 text-gray-600 px-3 py-1 rounded text-xs">Hematology</span>
                </div>
             </div>

             <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">AVAILABLE FOR:</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                   <span className="text-purple-500">🚻</span> Men & Women, 1-80 years
                </div>
             </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
           <h2 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
           <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button className="w-full flex justify-between items-center p-5 hover:bg-gray-50 text-left transition">
                 <span className="font-semibold text-gray-800 text-sm">1. What is the Dengue NS1 Antigen test? 2. Why is this test done? 3. What does a positive result mean? 4. When is the test most useful?</span>
                 <span className="text-gray-400">›</span>
              </button>
           </div>
        </div>

        {/* How our test process works! */}
        <div className="mb-12">
           <h2 className="text-xl font-bold text-gray-800 mb-6">How our test process works!</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Note: I'm using placeholder solid colors/gradients since I don't have the exact user images. 
                   But I will mimic the design with a dark overlay and text over it. */}
               <div className="relative rounded-xl overflow-hidden h-48 group">
                  <div className="absolute inset-0 bg-blue-900 group-hover:scale-105 transition duration-500"></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Step 1</div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <h3 className="text-white font-bold text-sm mb-1">Sample Collection</h3>
                     <p className="text-white/80 text-xs leading-tight line-clamp-3">Our experienced professionals visit your location, ensuring the safe and seamless collection of your samples.</p>
                  </div>
               </div>

               <div className="relative rounded-xl overflow-hidden h-48 group">
                  <div className="absolute inset-0 bg-teal-900 group-hover:scale-105 transition duration-500"></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Step 2</div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <h3 className="text-white font-bold text-sm mb-1">Sample Storage</h3>
                     <p className="text-white/80 text-xs leading-tight line-clamp-3">We store your samples securely, preserving their integrity and quality until they reach our advanced laboratory for analysis.</p>
                  </div>
               </div>

               <div className="relative rounded-xl overflow-hidden h-48 group">
                  <div className="absolute inset-0 bg-indigo-900 group-hover:scale-105 transition duration-500"></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Step 3</div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <h3 className="text-white font-bold text-sm mb-1">High-Tech Lab Facility</h3>
                     <p className="text-white/80 text-xs leading-tight line-clamp-3">Advanced technology and expert professionals provide precise analysis and highly accurate results.</p>
                  </div>
               </div>

               <div className="relative rounded-xl overflow-hidden h-48 group">
                  <div className="absolute inset-0 bg-purple-900 group-hover:scale-105 transition duration-500"></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Step 4</div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <h3 className="text-white font-bold text-sm mb-1">Accurate Digital Reports</h3>
                     <p className="text-white/80 text-xs leading-tight line-clamp-3">Receive dependable health insights and digital reports you can rely on for your peace of mind.</p>
                  </div>
               </div>
           </div>
        </div>

        {/* Related Tests */}
        <div className="mb-12">
           <h2 className="text-xl font-bold text-gray-800 mb-6">Related Tests</h2>
           <style>{`
             .slick-prev:before, .slick-next:before { display: none; }
             .slick-slider { margin: 0 -8px; }
             .slick-list { padding: 10px 0; }
           `}</style>
           <div className="px-2">
             <Slider {...sliderSettings}>
                <UnifiedTestCard title="Dengue Antibody (IgG & IgM)" icon="🔬" time="1 day" price="500" />
                <UnifiedTestCard title="Vidal Test" icon="🩸" time="1 day" price="300" />
                <UnifiedTestCard title="CBC with ESR" icon="🧪" time="12 hours" price="400" />
                <UnifiedTestCard title="Blood Grouping" icon="❤️" time="1 day" price="150" />
             </Slider>
           </div>
        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default TestDetails;

