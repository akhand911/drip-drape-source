import React from 'react';
import { Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const beliefs = [
  'Bold enough to stand out',
  'Comfortable enough to wear every day',
  'Premium without the premium price tag',
];

const taglines = [
  'Own Your Drip.',
  'Style Beyond Trends.',
  'Made for the Fearless.',
  'Where Street Meets Statement.',
  'Wear Confidence. Wear Drip$ Drape.',
  'Not Just Fashion. It\'s an Attitude.',
  'Stay Fresh. Stay Dripped',
];

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-drip-white">
      <Navbar />
      <main className="flex-grow">
        {/* Hero banner */}
        <div className="relative bg-drip-black overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=2070"
              alt="Drip$ Drape streetwear"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-3">
              <span className="text-amber-500">About</span>{' '}
              <span className="text-white">Drip$ Drape</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-400 font-display font-bold italic">
              Wear the Vibe. Own the Moment.
            </p>
          </div>
        </div>

        {/* Main content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 animate-fade-in">
          <p className="text-lg md:text-xl text-black font-medium leading-relaxed">
            At Drip$ Drape, fashion isn't just what you wear—it's how you show the world who you are.
            We create trend-driven streetwear inspired by the bold energy, creativity, and confidence of Gen Z.
          </p>

          <p className="text-lg md:text-xl text-black font-medium leading-relaxed">
            Every drop is designed for those who refuse to blend in. Whether you're stepping into college,
            hanging out with friends, creating content, or owning the streets, our pieces are made to match
            your vibe and elevate your style.
          </p>

          {/* Beliefs */}
          <div className="bg-drip-black rounded-xl p-8 md:p-10 shadow-xl animate-fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-500 mb-6 text-center">
              We believe great fashion should be:
            </h2>
            <ul className="space-y-4">
              {beliefs.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-lg md:text-xl text-white font-medium"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-drip-black font-bold shrink-0">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-lg md:text-xl text-black font-medium leading-relaxed">
            Drip$ Drape isn't about following trends—it's about creating your own identity. We combine
            modern silhouettes, quality fabrics, and statement designs to help you express yourself
            without saying a word.
          </p>

          {/* Closing statement */}
          <div className="text-center py-8 space-y-2">
            <p className="text-2xl md:text-3xl font-bold text-black">This is more than clothing.</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">It's confidence.</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">It's culture.</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">It's your drip.</p>
            <p className="text-2xl md:text-3xl font-bold text-black mt-4">
              Welcome to Drip$ Drape.
            </p>
          </div>

          {/* Brand taglines */}
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Brand Taglines
              <Sparkles className="h-6 w-6 text-amber-500" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taglines.map((tagline, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black rounded-lg p-5 font-bold text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {tagline}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
