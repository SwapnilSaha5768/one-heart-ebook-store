import React from 'react';
import { BookOpen, Heart, Globe, Users, Award, Sparkles } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] mb-6 animate-fade-in">
            <Sparkles size={16} />
            <span className="text-sm font-medium tracking-wide uppercase">Our Essence</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Connecting Hearts <br /> Through <span className="text-[var(--color-brand-red)]">Stories</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            OneHeart is more than just an ebook store. We are a community dedicated to bringing the world's most touching, inspiring, and transformative stories to your fingertips.
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-brand-red)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-brand-red)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* Mission & Vision Grid */}
      <section className="py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-[var(--color-brand-red)]/10 rounded-xl flex items-center justify-center mb-6 text-[var(--color-brand-red)]">
                <Globe size={24} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To democratize access to literature and knowledge, ensuring that every reader finds the book that speaks to their soul, regardless of where they are in the world.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-[var(--color-brand-red)]/10 rounded-xl flex items-center justify-center mb-6 text-[var(--color-brand-red)]">
                <Heart size={24} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where stories bridge gaps, foster empathy, and ignite the imagination of millions. We envision a future where reading is not just a hobby, but a shared human experience.
              </p>
            </div>
          </div>
          <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
            {/* Placeholder for an actual image - using a gradient for now to look premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-dark)] to-gray-800 flex items-center justify-center text-white p-12 text-center">
              <div>
                <BookOpen size={64} className="mx-auto mb-6 opacity-80" />
                <p className="font-serif text-3xl italic">"A room without books is like a body without a soul."</p>
                <p className="mt-4 opacity-70">— Cicero</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The principles that guide every decision we make and every book we curate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: "Excellence", desc: "We curate only the highest quality content for our readers." },
              { icon: Users, title: "Community", desc: "We believe in building a space where readers and authors connect." },
              { icon: BookOpen, title: "Accessibility", desc: "Making reading accessible to everyone, everywhere." }
            ].map((item, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-[var(--color-brand-bg)] hover:bg-[var(--color-brand-red)] hover:text-white transition-all duration-300 cursor-default">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 text-[var(--color-brand-dark)] shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-serif">{item.title}</h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 px-6 md:px-12 lg:px-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Readers", value: "50k+" },
              { label: "Books Available", value: "10k+" },
              { label: "Authors", value: "1,200+" },
              { label: "Countries", value: "85+" }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-brand-red)] mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>*/}
    </div>
  );
};

export default AboutUs;
