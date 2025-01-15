import React from 'react';
import { Bird, MapPin, Users, BarChart, ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4 sm:px-6 py-4 sm:py-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <motion.div 
            className="flex items-center gap-4 sm:gap-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.img 
                src="/svce-logo.png" 
                alt="SVCE Logo" 
                className="h-12 sm:h-16 w-auto"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              />
              <motion.div 
                className="h-10 sm:h-12 w-[2px] bg-gray-200"
                animate={{ 
                  height: ["40px", "32px", "40px"],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.img 
                src="/care-club-logo.png" 
                alt="Care Club Logo" 
                className="h-20 sm:h-24 w-auto"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              />
            </div>
          </motion.div>
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/map" className="text-gray-600 hover:text-gray-900 transition-colors">Map</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/plotter" 
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Become a Plotter
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-16">
          <motion.div 
            className="flex-1 space-y-6 sm:space-y-10 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4 sm:space-y-6">
              <motion.div 
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Bird className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-600">SVCE Care Club Initiative</span>
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                SparrowMap:
                <span className="block text-blue-600">
                  Tracking Our Feathered Friends
                </span>
              </motion.h1>
            </div>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Welcome to SVCE's innovative platform dedicated to monitoring and protecting our local sparrow populations. Join us in mapping and protecting our feathered friends - every sighting counts!
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  to="/plotter-signup"
                  className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3"
                >
                  Start Contributing
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  to="/map"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl inline-flex justify-center"
                >
                  View Map
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Animation - Make it smaller on mobile */}
          <motion.div 
            className="flex-1 relative min-h-[400px] sm:min-h-[600px] w-full max-w-[500px] mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-blue-50 rounded-[2.5rem] overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234a90e2\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
                animate={{
                  backgroundPosition: ['0px 0px', '100px 100px'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            {/* Animated Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-96 h-96">
                {/* Orbiting Circles */}
                <motion.div
                  className="absolute w-full h-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div 
                    className="absolute -top-4 left-1/2 w-8 h-8 bg-blue-500/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <motion.div
                  className="absolute w-full h-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div 
                    className="absolute top-1/2 -right-4 w-12 h-12 bg-blue-400/30 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                </motion.div>

                {/* Center Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="relative"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Bird Icon */}
                    <motion.div
                      className="relative z-20 bg-white rounded-full p-8 shadow-xl"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Bird className="w-20 h-20 text-blue-600" />
                    </motion.div>

                    {/* Ripple Effects */}
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-full"
                      animate={{ 
                        scale: [1, 1.5],
                        opacity: [0.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-full"
                      animate={{ 
                        scale: [1, 1.5],
                        opacity: [0.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 1
                      }}
                    />
                  </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-600/10 rounded-xl"
                  animate={{ 
                    y: [-10, 10],
                    rotate: [0, 10],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <MapPin className="w-full h-full p-4 text-blue-600" />
                </motion.div>

                <motion.div
                  className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-blue-600/10 rounded-xl"
                  animate={{ 
                    y: [10, -10],
                    rotate: [0, -10],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <Users className="w-full h-full p-4 text-blue-600" />
                </motion.div>
              </div>
            </div>

            {/* Floating Info Card */}
            <motion.div 
              className="absolute bottom-8 right-8 bg-white rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Interactive Platform</p>
                  <p className="text-sm text-gray-600">Track & Monitor Sparrows</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center space-y-4 mb-12 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Join SparrowMap?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Be part of a community that makes a real difference in wildlife conservation
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={<MapPin className="w-6 h-6 text-blue-600" />}
              title="Plot Sightings"
              description="Mark and track sparrow sightings with our intuitive mapping interface."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-blue-600" />}
              title="Community Driven"
              description="Join passionate bird watchers and environmental enthusiasts."
            />
            <FeatureCard
              icon={<BarChart className="w-6 h-6 text-blue-600" />}
              title="Track Progress"
              description="Monitor population trends and contribute to conservation data."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="space-y-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      className="bg-blue-100 rounded-lg p-2"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Bird className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-gray-900">About Our Initiative</h2>
                  </div>
                  <div className="prose prose-lg text-gray-600">
                    <motion.p 
                      className="mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      At SVCE Care Club, we are dedicated to wildlife conservation. Our SparrowMap initiative brings together our community to monitor and protect our local sparrow populations.
                    </motion.p>
                  </div>
                </motion.div>

                {/* Mission and Impact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-100/50 hover:shadow-lg transition-all relative overflow-hidden"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      className="absolute -right-20 -top-20 w-40 h-40 bg-blue-100/30 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div 
                          className="bg-blue-100 rounded-lg p-2"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Bird className="w-6 h-6 text-blue-600" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
                      </div>
                      <p className="text-gray-600">
                        Creating a sustainable ecosystem where sparrows thrive alongside urban development through community participation and data-driven conservation.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-100/50 hover:shadow-lg transition-all relative overflow-hidden"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-100/30 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div 
                          className="bg-blue-100 rounded-lg p-2"
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                          }}
                        >
                          <BarChart className="w-6 h-6 text-blue-600" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900">Our Impact</h3>
                      </div>
                      <p className="text-gray-600">
                        Building a valuable resource for environmental research and wildlife protection initiatives through continuous monitoring and community engagement.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 sm:py-32 bg-blue-600 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="text-center space-y-4 mb-12 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Growing Impact</h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Together, we're building a comprehensive database of sparrow habitats and behaviors
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <motion.div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Users className="w-12 h-12 text-white mx-auto mb-6" />
              <div className="text-5xl font-bold text-white mb-3">Growing</div>
              <div className="text-blue-100 text-lg">Community</div>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Bird className="w-12 h-12 text-white mx-auto mb-6" />
              <div className="text-5xl font-bold text-white mb-3">Daily</div>
              <div className="text-blue-100 text-lg">New Sightings</div>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <MapPin className="w-12 h-12 text-white mx-auto mb-6" />
              <div className="text-5xl font-bold text-white mb-3">Active</div>
              <div className="text-blue-100 text-lg">Monitoring</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-32">
        <motion.div 
          className="bg-gray-50 rounded-3xl p-8 sm:p-16 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative z-10 space-y-8">
            <motion.h2 
              className="text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join Our Conservation Journey
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Be part of SVCE Care Club's mission to protect and preserve our local sparrow population. Your contributions create a lasting impact on wildlife conservation.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/plotter-signup"
                className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3"
              >
                Start Contributing Today
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="flex flex-col items-center gap-8 text-center sm:text-left sm:flex-row sm:justify-between"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <img 
                src="/svce-logo.png" 
                alt="SVCE Logo" 
                className="h-10 sm:h-12 w-auto"
              />
              <div className="h-8 w-[2px] bg-gray-200"></div>
              <img 
                src="/care-club-logo.png" 
                alt="Care Club Logo" 
                className="h-16 sm:h-20 w-auto"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              An initiative by SVCE Care Club
            </div>
            <div className="flex items-center gap-6 sm:gap-8 text-sm">
              <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05,
        y: -10
      }}
    >
      <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
} 