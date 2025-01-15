import React from 'react';
import { motion } from 'framer-motion';
import { Bird, Heart, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <motion.nav 
        className="bg-white shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.nav>

      {/* About Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="max-w-3xl mx-auto space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                className="p-3 bg-blue-100 rounded-xl"
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
                <Bird className="w-8 h-8 text-blue-600" />
              </motion.div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">About SVCE Care Club</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dedicated to wildlife conservation and environmental protection
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              The SVCE Care Club is a student-led initiative at Sri Venkateswara College of Engineering, committed to making a positive impact on our environment. Our focus extends beyond academic pursuits to practical conservation efforts that benefit our local ecosystem.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Through the SparrowMap project, we're taking concrete steps to protect and monitor our local sparrow population. This initiative combines technology with community engagement to create a comprehensive approach to wildlife conservation.
            </motion.p>
          </div>

          {/* Values Section */}
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600">
                To foster environmental awareness and lead conservation initiatives that create lasting positive impact on our local wildlife and ecosystem.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Community Focus</h3>
              </div>
              <p className="text-gray-600">
                We believe in the power of community engagement and collective action. Together, we can make a significant difference in protecting our environment.
              </p>
            </motion.div>
          </div>

          {/* Join Us Section */}
          <motion.div
            className="bg-blue-50 p-8 rounded-2xl text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-900">Join Our Mission</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're a student, faculty member, or community member, there are many ways to get involved with SVCE Care Club and contribute to our conservation efforts.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                Get in Touch
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 