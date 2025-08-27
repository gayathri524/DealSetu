import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { ShieldCheck,Rocket,Phone, Mail, ChevronDown, HeartHandshake, Globe, ShoppingBag, Palette, Code, PlusCircle, IndianRupee, Instagram, Facebook,Youtube, Truck, Smile, Users, CheckCircle, Lock, Zap, Target, Eye, Award, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Reusable Feature Card Component
const FaqItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <motion.div 
            className="border-b border-slate-200 py-6"
            initial={false}
            animate={{ backgroundColor: isOpen ? "rgba(241, 245, 249, 1)" : "rgba(255, 255, 255, 0)" }}
        >
            <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-semibold text-slate-800">{question}</h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-6 h-6 text-slate-500" />
                </motion.div>
            </button>
            <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ 
                    height: isOpen ? 'auto' : 0, 
                    opacity: isOpen ? 1 : 0,
                    marginTop: isOpen ? '16px' : '0px'
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="text-slate-600">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};

const FeatureCard = ({ icon, title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 text-center"
    >
        <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-red-100 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{children}</p>
    </motion.div>
);

// Reusable Bullet Point Component
const BulletPoint = ({ children }) => (
    <li className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
        <span className="text-slate-700">{children}</span>
    </li>
);

export const HomePage = () => {
    return (
        <div className="w-full bg-gradient-to-br from-red-50 via-white to-blue-50 text-slate-800">
            {/* --- Header --- */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Link to="/" className="text-3xl font-bold">
                        Deal<span className="text-blue-600">Setu</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 font-medium text-slate-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
                    </nav>
                    <Link to="/login" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105">
                        Get Started
                    </Link>
                </div>
            </header>

            <main>
                {/* --- Hero Section --- */}
                <section className="pt-32 pb-20 text-center">
                    <div className="container mx-auto px-4">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-4 text-slate-900"
                        >
                            Secure Your Deals, <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-600">
                                Unlock Your Peace of Mind.
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="max-w-2xl mx-auto text-lg text-slate-600 mb-8"
                        >
                            DealSetu is India's first trusted digital dealing platform, acting as a secure bridge for your transactions. Say goodbye to fraud and hello to 100% secure deals.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <Link to="/login" className="inline-flex items-center gap-2 bg-slate-800 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-slate-900 transition-all transform hover:scale-105">
                                Create a Secure Deal Now <ChevronsRight />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* --- What is DealSetu Section --- */}
                <section id="features" className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-4">What is DealSetu?</h2>
                        <p className="text-slate-600 text-center max-w-3xl mx-auto mb-12">
                            We are a neutral third-party that holds the buyer's payment in a secure escrow account. The funds are only released to the seller after the buyer confirms that they have received the goods or services as promised. We are the digital bridge ('Setu') of trust for your deals.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon={<Lock className="w-8 h-8 text-blue-600" />} title="Secure Escrow">
                                Your money is safe with us. We hold it securely until you are satisfied with the deal.
                            </FeatureCard>
                            <FeatureCard icon={<Users className="w-8 h-8 text-red-500" />} title="Verified Users" delay={0.2}>
                                Deal with confidence. Our KYC verification process ensures you're dealing with real, trustworthy individuals.
                            </FeatureCard>
                            <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-green-500" />} title="Dispute Resolution" delay={0.4}>
                                In case of any disagreement, our expert agents step in to mediate and ensure a fair outcome for both parties.
                            </FeatureCard>
                        </div>
                    </div>
                </section>

                {/* --- Why Choose DealSetu Section --- */}
                


<section className="py-20 bg-slate-50">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            {/* THIS IS THE NEW LINE TO ADD */}
            <p className="font-semibold text-blue-600 mb-2">Why Choose Us?</p>

            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                The <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-600">DealSetu Advantage</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg text-slate-600"
            >
                We're more than just a platform; we're your partner in secure transactions. Here’s what makes us different.
            </motion.p>
        </div>

        {/* 3-Card Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8">

            {/* Card 1: Ironclad Security */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative p-8 bg-white rounded-2xl shadow-xl overflow-hidden group"
            >
                {/* Gradient Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                    <div className="inline-block p-4 bg-white rounded-xl shadow-md mb-6">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Ironclad Security</h3>
                    <ul className="space-y-3 text-left text-slate-600">
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Funds held in secure escrow.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Payment released only on your approval.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>End-to-end encrypted communication.</span>
                        </li>
                    </ul>
                </div>
            </motion.div>

            {/* Card 2: Absolute Transparency */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative p-8 bg-white rounded-2xl shadow-xl overflow-hidden group"
            >
                {/* Gradient Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    <div className="inline-block p-4 bg-white rounded-xl shadow-md mb-6">
                        <Eye className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Absolute Transparency</h3>
                    <ul className="space-y-3 text-left text-slate-600">
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Real-time deal status tracking.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Clear timeline of all actions.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>No hidden fees or surprises.</span>
                        </li>
                    </ul>
                </div>
            </motion.div>

            {/* Card 3: Human-Powered Support */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative p-8 bg-white rounded-2xl shadow-xl overflow-hidden group"
            >
                {/* Gradient Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    <div className="inline-block p-4 bg-white rounded-xl shadow-md mb-6">
                        <Users className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Human-Powered Support</h3>
                    <ul className="space-y-3 text-left text-slate-600">
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Expert agents for dispute mediation.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Fair and impartial resolutions.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Quick and responsive customer service.</span>
                        </li>
                    </ul>
                </div>
            </motion.div>

        </div>
    </div>
</section>


{/* "How It Works" Section */}

<section className="py-20 bg-white">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            {/* THIS IS THE NEW LINE TO ADD */}
            <p className="font-semibold text-blue-600 mb-2">How it Works?</p>

            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                Your Deal in 4 Simple Steps
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg text-slate-600"
            >
                We've made the entire process seamless and transparent. Follow these easy steps for a 100% secure transaction.
            </motion.p>
        </div>

        {/* Step-by-Step Process Layout */}
        <div className="relative">
            {/* The connecting line (visible on desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-slate-200"></div>

            <div className="grid md:grid-cols-4 gap-12 relative">
                
                {/* Step 1: Create Deal */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center"
                >
                    <div className="relative mb-4">
                        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            <PlusCircle size={48} />
                        </div>
                        <div className="absolute -top-4 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">1</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Create the Deal</h3>
                    <p className="text-slate-600">
                        One party starts a deal, sets the price, and defines the terms. An invite link is generated to share with the other party.
                    </p>
                </motion.div>

                {/* Step 2: Secure the Payment */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center"
                >
                    <div className="relative mb-4">
                        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            <IndianRupee size={48} />
                        </div>
                        <div className="absolute -top-4 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">2</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Secure the Payment</h3>
                    <p className="text-slate-600">
                        The Buyer deposits the funds into DealSetu's secure company account. We notify both parties once the payment is confirmed.
                    </p>
                </motion.div>

                {/* Step 3: Deliver Goods/Service */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center"
                >
                    <div className="relative mb-4">
                        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            <Truck size={48} />
                        </div>
                        <div className="absolute -top-4 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">3</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Deliver Goods/Service</h3>
                    <p className="text-slate-600">
                        The Seller now has the green light to deliver the product or service as agreed upon in the deal terms.
                    </p>
                </motion.div>

                {/* Step 4: Release the Funds */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-center"
                >
                    <div className="relative mb-4">
                        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            <Smile size={48} />
                        </div>
                        <div className="absolute -top-4 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">4</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Release the Funds</h3>
                    <p className="text-slate-600">
                        Once the Buyer confirms they are satisfied, they click "Release Funds" in the app, and we transfer the payment to the Seller.
                    </p>
                </motion.div>

            </div>
        </div>
    </div>
</section>

{/* --- Who Is This For?--- */}


<section className="py-20 bg-white">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            <p className="font-semibold text-blue-600 mb-2">A PERFECT FIT FOR EVERYONE</p>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                Who Can Use DealSetu?
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg text-slate-600"
            >
                If you're buying or selling online, you need DealSetu. Our platform is designed for a wide range of users and transactions.
            </motion.p>
        </div>

        {/* 4-Card Grid Layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1: Freelancers & Clients */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center transform hover:-translate-y-2 transition-transform duration-300">
                <HeartHandshake className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Freelancers & Clients</h3>
                <p className="text-slate-600 text-sm">Ensure you get paid for your hard work, and clients get the service they paid for. Perfect for project-based work.</p>
            </div>

            {/* Card 2: Social Media Traders */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center transform hover:-translate-y-2 transition-transform duration-300">
                <Globe className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Social Media Traders</h3>
                <p className="text-slate-600 text-sm">Buying or selling Instagram pages, YouTube channels, or other digital assets? Do it without risk.</p>
            </div>

            {/* Card 3: E-commerce Shoppers */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center transform hover:-translate-y-2 transition-transform duration-300">
                <ShoppingBag className="w-10 h-10 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Marketplace Users</h3>
                <p className="text-slate-600 text-sm">Transacting on platforms like OLX or Facebook Marketplace? Use DealSetu to avoid scams with unknown parties.</p>
            </div>

            {/* Card 4: Service Providers */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center transform hover:-translate-y-2 transition-transform duration-300">
                <Palette className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Digital Service Providers</h3>
                <p className="text-slate-600 text-sm">Whether you're a designer, developer, or consultant, secure your payments for digital services and deliverables.</p>
            </div>

        </div>
    </div>
</section>


{/* ---Animated Counter--- */}


<section className="py-20 bg-slate-50">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                Our Journey, In Numbers
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg text-slate-600"
            >
                We are proud of the trust our community has placed in us. Our growth is a testament to our commitment to secure and fair transactions for everyone.
            </motion.p>
        </div>

        {/* Grid for the three stats */}
        <div className="grid md:grid-cols-3 gap-8 text-center">

            {/* Stat 1: Deals Completed */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
            >
                <ShieldCheck className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-5xl font-extrabold text-slate-800 tracking-tighter">
                    <CountUp 
                        start={0} 
                        end={6000} 
                        duration={2.5} 
                        enableScrollSpy={true}
                        scrollSpyOnce={true}
                    />
                    +
                </h3>
                <p className="text-lg text-slate-500 mt-2">Deals Completed</p>
            </motion.div>

            {/* Stat 2: Happy Users */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
            >
                <Users className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-5xl font-extrabold text-slate-800 tracking-tighter">
                    <CountUp 
                        start={0} 
                        end={2500} 
                        duration={2.5} 
                        enableScrollSpy={true}
                        scrollSpyOnce={true}
                    />
                    +
                </h3>
                <p className="text-lg text-slate-500 mt-2">Happy Users</p>
            </motion.div>

            {/* Stat 3: Funds Secured */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
            >
                <IndianRupee className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-5xl font-extrabold text-slate-800 tracking-tighter">
                    <CountUp 
                        start={0} 
                        end={50} 
                        duration={2.5} 
                        enableScrollSpy={true}
                        scrollSpyOnce={true}
                        prefix="₹"
                        suffix="L+"
                    />
                </h3>
                <p className="text-lg text-slate-500 mt-2">Funds Secured</p>
            </motion.div>

        </div>
    </div>
</section>

                {/* --- Our Vision & Goal Section --- */}
               
<section className="py-20 bg-white">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            <p className="font-semibold text-blue-600 mb-2">OUR MISSION</p>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                Building a Safer Digital India
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-3xl mx-auto text-lg text-slate-600"
            >
                Our story began with a simple mission: to make the internet a safer place to do business. We are dedicated to building a future where every online deal is a secure deal.
            </motion.p>
        </div>

        {/* 2-Card Centered Layout */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

            {/* Card 1: Our Vision */}
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                        <Rocket className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Our Vision</h3>
                </div>
                <p className="text-slate-600 text-lg">
                    To create a future where every Indian can transact online with <span className="font-bold text-slate-800">absolute confidence</span>, free from the fear of fraud.
                </p>
            </motion.div>

            {/* Card 2: Our Goal */}
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                        <Target className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Our Goal</h3>
                </div>
                <p className="text-slate-600 text-lg">
                    To be the undisputed, <span className="font-bold text-slate-800">most-trusted escrow platform</span> for India's rapidly growing digital economy.
                </p>
            </motion.div>

        </div>
    </div>
</section>

{/* --- Contact Us --- */}


<section className="py-20 bg-slate-50">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            <p className="font-semibold text-blue-600 mb-2">WE'RE HERE TO HELP</p>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                Get in Touch
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg text-slate-600"
            >
                Have a question, a suggestion, or need support with a deal? Our team is ready to assist you.
            </motion.p>
        </div>

        {/* Contact Info & Social Media Grid */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

            {/* Left Column: Direct Contact */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
            >
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Direct Contact</h3>
                <div className="space-y-6">
                    {/* Email Contact */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700">Email Us</h4>
                            <p className="text-slate-500 text-sm mb-1">For support, queries, and feedback.</p>
                            <a 
                                href="mailto:help.dealsetu@gmail.com" 
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                help.dealsetu@gmail.com
                            </a>
                        </div>
                    </div>
                    {/* Phone Contact */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg">
                            <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700">Call Us</h4>
                            <p className="text-slate-500 text-sm mb-1">For urgent matters (Mon-Fri, 10am-6pm).</p>
                            <a 
                                href="tel:+918102175511" 
                                className="text-green-600 font-semibold hover:underline"
                            >
                                +91 81021 75511
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Column: Follow Us */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
            >
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Follow Us</h3>
                <p className="text-slate-500 mb-6">Stay updated with our latest news, security tips, and success stories on our social media channels.</p>
                <div className="space-y-4">
                    {/* Instagram Link */}
                    <a href="https://instagram.com/dealsetu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                        <Instagram className="w-7 h-7 text-pink-500" />
                        <span className="font-semibold text-slate-700 group-hover:text-pink-500">/dealsetu</span>
                    </a>
                    {/* Facebook Link */}
                    <a href="https://facebook.com/dealsetu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                        <Facebook className="w-7 h-7 text-blue-600" />
                        <span className="font-semibold text-slate-700 group-hover:text-blue-600">/dealsetu</span>
                    </a>
                    {/* YouTube Link */}
                    <a href="https://youtube.com/dealsetu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                        <Youtube className="w-7 h-7 text-red-500" />
                        <span className="font-semibold text-slate-700 group-hover:text-red-500">/dealsetu</span>
                    </a>
                </div>
            </motion.div>

        </div>
    </div>
</section>


{/* --- FAQs --- */}

<section className="py-20 bg-white">
    <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            <p className="font-semibold text-blue-600 mb-2">HAVE QUESTIONS?</p>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
                Frequently Asked Questions
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg text-slate-600"
            >
                Find answers to common questions about our escrow service. If you can't find your answer here, feel free to contact us.
            </motion.p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto">
            <FaqItem question="What is an escrow service?">
                <p>An escrow service is a neutral third party that holds onto payment for a transaction between a buyer and a seller. The payment is only released to the seller once the buyer is satisfied with the goods or service, protecting both parties from fraud.</p>
            </FaqItem>
            <FaqItem question="What is the fee for using DealSetu?">
                <p>We charge a flat 5% platform fee on the total deal amount. This fee is deducted from the funds before they are released to the seller. This small fee allows us to provide a secure platform, verification services, and expert dispute mediation.</p>
            </FaqItem>
            <FaqItem question="How do I pay into the escrow account?">
                <p>Once a deal is active, the buyer will receive our official company account details (like UPI ID or Bank Account) directly within the deal chat. IMPORTANT: Never pay a seller directly. Only payments made to the official DealSetu account are protected.</p>
            </FaqItem>
            <FaqItem question="What happens if there is a dispute?">
                <p>If either party is unhappy with the transaction, they can raise a dispute within the app. A trained DealSetu agent will be assigned to the chat. They will review all communication and evidence provided by both parties and make a fair, binding decision on how the funds should be distributed.</p>
            </FaqItem>
            <FaqItem question="How long does it take for the seller to get paid?">
                <p>Once the buyer clicks "Release Funds" in the app, the payment is typically processed and sent to the seller's registered account within 24-48 business hours.</p>
            </FaqItem>
            <FaqItem question="Is my personal information safe?">
                <p>Absolutely. We use industry-standard encryption for all data. Your personal documents for KYC are stored securely and are only accessible to our verification team for the sole purpose of confirming your identity. We never share your data with third parties.</p>
            </FaqItem>
        </div>
    </div>
</section>

            </main>



            {/* --- Footer --- */}
    

<footer id="contact" className="bg-slate-900 text-white">
    <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">

            {/* Column 1: About DealSetu */}
            <div className="md:col-span-2">
                <h3 className="text-2xl font-bold mb-3">
                    Deal<span className="text-blue-400">Setu</span>
                </h3>
                <p className="text-slate-400 max-w-md">
                    DealSetu is India's premier digital escrow service, designed to eliminate fraud from online transactions. We act as a secure third-party, holding funds until both buyer and seller are satisfied, ensuring 100% safety and peace of mind.
                </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
                <h4 className="font-semibold text-lg mb-4 tracking-wide">Quick Links</h4>
                <ul className="space-y-3 text-slate-400">
                    <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                    <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                    <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                    <li><Link to="/login" className="hover:text-white transition-colors">Login / Sign Up</Link></li>
                </ul>
            </div>

            {/* Column 3: Legal & Social */}
            <div>
                <h4 className="font-semibold text-lg mb-4 tracking-wide">Connect</h4>
                <ul className="space-y-3 text-slate-400 mb-6">
                    <li><Link to="/legal" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/legal" className="hover:text-white transition-colors">Terms of Service</Link></li>
                    <li><a href="mailto:help.dealsetu@gmail.com" className="hover:text-white transition-colors">Contact Support</a></li>
                </ul>
                
                {/* Social Media Icons */}
                <div className="flex items-center gap-4">
                    <a href="https://instagram.com/dealsetu" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
                        <Instagram size={24} />
                    </a>
                    <a href="https://facebook.com/dealsetu" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                        <Facebook size={24} />
                    </a>
                    <a href="https://youtube.com/dealsetu" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="YouTube">
                        <Youtube size={24} />
                    </a>
                </div>
            </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-500">
            <p>© {new Date().getFullYear()} DealSetu Technologies. All Rights Reserved.</p>
        </div>
    </div>
</footer>
        </div>
    );
};