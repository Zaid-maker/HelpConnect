'use client';

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const fadeInLeft = {
  initial: { 
    opacity: 0, 
    x: -30,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const fadeInRight = {
  initial: { 
    opacity: 0, 
    x: 30,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      ease: "easeOut"
    }
  }
};

const buttonHover = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: "easeInOut"
  }
};

const buttonTap = {
  scale: 0.95,
  transition: {
    duration: 0.1,
    ease: "easeInOut"
  }
};

// Icons for feature section
const FeatureIcon = ({ children }: { children: React.ReactNode }) => (
  <motion.div 
    className="p-3 bg-blue-100 rounded-lg inline-flex items-center justify-center dark:bg-blue-900/30"
    whileHover={{ 
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2, ease: "easeInOut" }
    }}
    whileTap={{ 
      scale: 0.95,
      rotate: -5,
      transition: { duration: 0.1 }
    }}
  >
    {children}
  </motion.div>
);

/**
 * Renders the HelpConnect homepage.
 *
 * This client component displays the landing page with enhanced animations using Framer Motion.
 * It includes a hero section, features, testimonials, and call-to-action areas with smooth transitions.
 *
 * @returns A JSX element representing the homepage layout.
 */
export default function Home() {
  return (
    <AnimatePresence>
      <div className="min-h-screen">
        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <motion.div 
                  className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
                  variants={fadeInLeft}
                  initial="initial"
                  animate="animate"
                >
                  <h1>
                    <motion.span 
                      className="block text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Introducing
                    </motion.span>
                    <motion.span 
                      className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <span className="block text-gray-900 dark:text-white">
                        Connect with your
                      </span>
                      <span className="block text-blue-600 dark:text-blue-400">
                        supportive community
                      </span>
                    </motion.span>
                  </h1>
                  <motion.p 
                    className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl dark:text-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    HelpConnect brings people together by enabling community
                    members to request and offer assistance for everything from
                    simple favors to urgent needs.
                  </motion.p>
                  <motion.div 
                    className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <motion.div
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                    >
                      <Link
                        href="/signup"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-xl"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                    >
                      <Link
                        href="#how-it-works"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 dark:text-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-all duration-300 shadow-md hover:shadow-xl"
                      >
                        Learn More
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="mt-12 relative mx-auto w-full rounded-lg shadow-lg lg:mt-0 lg:col-span-6 lg:max-w-md overflow-hidden"
                  variants={fadeInRight}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div 
                    className="relative block w-full bg-white rounded-lg overflow-hidden dark:bg-gray-700 shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Image
                      className="w-full transform transition-transform duration-700"
                      src="/hero-image.jpg"
                      alt="People helping each other"
                      width={500}
                      height={300}
                      priority
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 bg-white dark:bg-gray-800" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="lg:text-center"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase dark:text-blue-400">
                  How It Works
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                  A community where everyone can help
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto dark:text-gray-300">
                  HelpConnect makes it easy to request assistance and offer
                  support to others in your community.
                </p>
              </motion.div>

              <motion.div 
                className="mt-10"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                  <motion.div 
                    variants={fadeInUp}
                    className="relative"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <FeatureIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600 dark:text-blue-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                            />
                          </svg>
                        </FeatureIcon>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Request Help
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                      Post any type of request, from dog walking to grocery
                      shopping to emergency assistance, and connect with people
                      ready to help.
                    </dd>
                  </motion.div>

                  <motion.div 
                    variants={fadeInUp}
                    className="relative"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <FeatureIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600 dark:text-blue-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </FeatureIcon>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Offer Support
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                      Browse requests in your area and offer help where you can.
                      Build your reputation as a trusted community helper.
                    </dd>
                  </motion.div>

                  <motion.div 
                    variants={fadeInUp}
                    className="relative"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <FeatureIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600 dark:text-blue-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </FeatureIcon>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Connect Safely
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                      Our verification system, ratings, and secure messaging help
                      ensure safe connections between community members.
                    </dd>
                  </motion.div>
                </dl>
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="max-w-3xl mx-auto text-center"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  Trusted by community members
                </h2>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                  Join thousands of people who are already building stronger
                  communities through mutual support.
                </p>
              </motion.div>
              <motion.div 
                className="mt-12 space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    whileHover={{ 
                      scale: 1.03,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="px-6 py-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-900"></div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Community Member
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Neighbor
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-500 dark:text-gray-300">
                        &ldquo;HelpConnect has transformed how I interact with my
                        community. Now I know who needs help and how I can support
                        them.&rdquo;
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
              <motion.div
                variants={fadeInLeft}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                  <span className="block">
                    Ready to build a stronger community?
                  </span>
                  <span className="block text-blue-600 dark:text-blue-400">
                    Join HelpConnect today.
                  </span>
                </h2>
              </motion.div>
              <motion.div 
                className="mt-8 flex lg:mt-0 lg:flex-shrink-0"
                variants={fadeInRight}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="inline-flex rounded-md shadow"
                >
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    Get started
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="ml-3 inline-flex rounded-md shadow"
                >
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 dark:text-blue-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    Log in
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
            <nav className="-mx-5 -my-2 flex flex-wrap justify-center">
              {["About", "Features", "Privacy", "Terms", "Contact"].map(
                (item) => (
                  <motion.div 
                    key={item} 
                    className="px-5 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href="#"
                      className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </motion.div>
                )
              )}
            </nav>
            <div className="mt-8 flex justify-center space-x-6">
              <div className="flex space-x-6">
                {["facebook", "twitter", "instagram"].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.9,
                      rotate: -5,
                      transition: { duration: 0.1 }
                    }}
                  >
                    <span className="sr-only">{social}</span>
                    <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300"></div>
                  </motion.a>
                ))}
              </div>
            </div>
            <p className="mt-8 text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} HelpConnect. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
}
