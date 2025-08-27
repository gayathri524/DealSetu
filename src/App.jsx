import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion'; 
import { getDatabase, ref as dbRef, onValue, set, onDisconnect,remove } from "firebase/database";
import { Plus } from 'lucide-react';
import { HomePage } from './HomePage.jsx';
import {
  BrowserRouter, Routes, Route, useNavigate, useLocation, Link, NavLink,
  useParams, Navigate, Outlet
} from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  getIdToken,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  runTransaction,
  orderBy,
  increment,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Send, Paperclip, LogOut, FileText, Shield, X, Star, ChevronLeft, Percent, CheckCircle,
  Award, Edit, BookOpen, User, Bell, Activity, Search, Lock, Clock,
  Calendar, BarChart2, Briefcase, AlertCircle, Mail, HelpCircle, Loader2, Copy,
  IndianRupee, Filter, UserPlus, UserX, UserCheck, Eye, UserCog,Home
} from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


  
// --- START: Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDqZCszRLl1fbBlC2aEoJlBUAMj4_apZuU",
  authDomain: "dealsetu-app.firebaseapp.com",
  projectId: "dealsetu-app",
  storageBucket: "dealsetu-app.firebasestorage.app",
  messagingSenderId: "245708278202",
  appId: "1:245708278202:web:153ca99db5520b85a6f583",
  measurementId: "G-ZBFQHMQ3P5"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// --- END: Firebase Configuration ---

// --- Helper Functions ---
const sendSystemMessage = async (chatId, text, batch) => {
    if (!chatId || !text) return;
    const msgRef = doc(collection(db, `chats/${chatId}/messages`));
    const msgData = { 
        text, 
        senderId: 'system', 
        type: 'system', 
        timestamp: serverTimestamp() 
    };

    if (batch) {
        batch.set(msgRef, msgData);
    } else {
        await setDoc(msgRef, msgData);
    }
};

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const formatTimestamp = (timestamp) => {
  if (!timestamp?.toDate) return '';
  try {
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.error("Failed to format timestamp:", timestamp, e);
    return 'Invalid Date';
  }
};

const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const calculateTrustPercentage = (score, ratings) => {
  if (!ratings || ratings === 0) return 100;
  const percentage = Math.round(((score - 1) / 4) * 100);
  return Math.min(100, Math.max(0, percentage));
};

const generateUniqueDealId = async () => {
    let uniqueId;
    let idExists = true;
    while(idExists) {
        uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
        const dealDocRef = doc(db, "chats", `DEAL-${uniqueId}`);
        const docSnap = await getDoc(dealDocRef);
        if (!docSnap.exists()) {
            idExists = false;
        }
    }
    return `DEAL-${uniqueId}`;
};

// --- Legal Text Content ---
const termsAndConditionsText = `Last Updated: [Date]

1. Introduction & Agreement
Welcome to DealSetu. These Terms and Conditions ("Terms") govern your use of our escrow services, website, and applications (collectively, the "Service"). By creating an account or using our Service, you agree to be bound by these Terms, our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using the Service.

2. Service Description
DealSetu provides a neutral, third-party service to hold funds for transactions between two parties (a "Buyer" and a "Seller"). Funds are released to the Seller only upon confirmation from the Buyer that the goods or services have been received as agreed upon in the deal terms. We act as a trusted intermediary to ensure the security of the transaction for both parties.

3. User Accounts & Responsibilities
Eligibility: You must be at least 18 years old and capable of forming a legally binding contract to use our Service.
Account Security: You are responsible for maintaining the confidentiality of your account information, including your password. You agree to notify us immediately of any unauthorized use of your account.
Accurate Information: You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. The name on your profile must match the name on your government-issued ID for verification.
Identity Verification (KYC): For security and to comply with regulations, we require you to complete a Know Your Customer (KYC) verification process for deals over a certain amount. Providing false information will result in immediate account termination.

4. Deal Creation & Process
Initiation: A deal is initiated by one party, defining the purpose, price, and terms.
Funding: The Buyer deposits the agreed-upon amount into the official DealSetu company account provided within the app. We will notify both parties once the funds are secured.
**VERY IMPORTANT: ** Buyers must only send funds to the official company accounts provided within the app chat. NEVER pay a seller directly. DealSetu is not responsible for any funds lost due to direct payments outside our system.
Fulfillment & Release: The Seller provides the goods/services. The Buyer confirms satisfactory receipt within the app to authorize the release of funds to the Seller.

5. Payments & Fees
Service Fee: We charge a 5% platform fee, which is deducted from the transaction amount upon successful release of funds to the Seller. Our agents receive a commission from this fee for resolving disputes or managing deals.
Payment Methods: All payments must be made to our official company accounts. The latest payment details will always be available inside the deal chat.

6. Dispute Resolution
Dispute Window: In the event of a disagreement, either party can raise a dispute. A dispute can only be initiated within 7 (seven) calendar days of the seller delivering the goods/services. After this period, the option to raise a dispute may be disabled.
Mediation: An agent will be assigned to mediate the dispute. The agent will review chat logs, evidence provided by both parties, and make a decision.
Final Decision: Our agent's decision in the dispute resolution process is final and binding on both parties.

7. Prohibited Transactions
You may not use our Service for any illegal activities or for transactions involving prohibited items or services as per Indian law.

8. Limitation of Liability
Our liability is limited strictly to the amount of funds held in escrow for a specific transaction. We are not liable for the quality of goods/services, for losses incurred from direct payments between users, or for any activity outside of our platform.

9. Termination
We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
`;
const privacyPolicyText = `Last Updated: [Date]

1. Introduction
This Privacy Policy explains how DealSetu ("we," "us," or "our") collects, uses, shares, and protects your personal information when you use our services. Your privacy is of paramount importance to us.

2. Information We Collect
Personal Identification Information: Full Name, email address, username, and encrypted copies of government-issued ID details (for KYC).
Transactional Information: Details of the deals you create, payment identifiers you provide (like UPI ID), and your transaction history with us.
Communication Data: Messages and files exchanged within the deal chat system. These are stored securely and are accessed by our agents only for dispute resolution purposes.
Technical Data: IP address, browser type, device information, and anonymized usage data to improve our service.

3. How We Use Your Information
To Provide and Manage the Service: To create your account, facilitate escrow transactions, manage user profiles, and provide customer support.
For Security and Verification: To verify your identity (KYC), prevent fraud, protect your account, and ensure a secure transaction environment for all users.
For Communication: To send you service-related notifications (e.g., deal status updates) and respond to support queries.
For Dispute Resolution: To review communication logs and transaction evidence to make a fair and binding decision.
For Service Improvement: To analyze usage patterns in an aggregated and anonymized manner to improve our application and user experience.

4. Information Sharing and Disclosure
We are not in the business of selling your data. We may share your information only in the following circumstances:
- With other users in a deal (e.g., your username and profile picture).
- With our support and resolution agents for the sole purpose of mediating a deal or dispute.
- With third-party services like Google Firebase that provide core application functionality (authentication, database, storage) under strict privacy agreements.
- When required by law, such as in response to a court order or other legal process.

5. Data Security
We implement robust, industry-standard security measures to protect your data. This includes end-to-end encryption for data in transit, encryption at rest for stored data, and strict internal access controls to limit who can view your information.

6. Your Rights and Choices
You have the right to access, rectify, or request the deletion of your personal information. Please note that we must retain certain transactional and identity data for a period to comply with legal obligations and for security purposes.

7. Data Retention
We retain your data as long as your account is active or as needed to fulfill the purposes outlined in this policy and to comply with our legal obligations (e.g., fraud prevention, financial record-keeping). After this period, your personal data will be anonymized or securely deleted.
`;

// ================================================================
// --- START: Component Definitions ---
// ================================================================

const WelcomeScreen = () => {
    const navigate = useNavigate();
    const slogans = [
        "DealSetu is India's first digital dealing platform to make your transactions 100% secure.",
        "Say goodbye to scams with DealSetu. Your money is protected until the deal is complete.",
        "No more fraud, no fake buyers, no ghost sellers. Just verified and safe deals.",
        "DealSetu acts as a digital Bridge, holding payments until both parties are satisfied."
    ];
    const goToSignUp = () => navigate('/login', { state: { defaultToSignUp: true } });
    const goToSignIn = () => navigate('/login');

    return (
        <div className="relative min-h-screen bg-slate-900 text-white p-6 flex flex-col justify-end overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            <div className="z-10 text-center w-full absolute top-0 left-0 right-0" style={{ height: 'calc(100% - 10rem)' }}>
                <div className="flex flex-col h-full justify-between pt-20">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold">
                            Welcome To <span className="text-blue-400">DealSetu</span>
                        </h1>
                        <TypeAnimation
                            sequence={["India's first trusted digital dealing platform.", 3000]}
                            wrapper="p"
                            speed={50}
                            className="text-lg text-slate-300 mt-2"
                            repeat={Infinity}
                        />
                    </div>
                    <div className="w-full max-w-2xl mx-auto mt-auto">
                        <Swiper
                            modules={[Autoplay, Pagination]}
                            spaceBetween={30}
                            centeredSlides={true}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            className="mySwiper"
                            style={{'--swiper-pagination-color': '#2563eb', '--swiper-pagination-bullet-inactive-color': '#475569'}}
                        >
                            {slogans.map((slogan, index) => (
                                <SwiperSlide key={index}>
                                    <div className="p-8">
                                        <p className="text-xl sm:text-2xl font-medium text-slate-200">
                                            {slogan}
                                        </p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
            <div className="z-10 fixed bottom-0 left-0 right-0 w-full p-6" style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 5%, rgba(15, 23, 42, 0))' }}>
                <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
                    <button onClick={goToSignUp} className="w-full sm:w-1/2 text-white font-bold text-lg py-4 px-6 rounded-xl border-2 border-slate-600 bg-slate-800/20 transition-all duration-300 hover:border-slate-500 hover:bg-slate-700/50">
                        Sign Up
                    </button>
                    <button onClick={goToSignIn} className="w-full sm:w-1/2 text-white font-bold text-lg py-4 px-6 rounded-xl bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in-fast">
            <div className="bg-[#1e293b] rounded-lg shadow-xl w-full max-w-md p-6 text-white relative border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const CustomAlertModal = ({ isOpen, onClose, title, message, children }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <p className="text-slate-300 mb-6">{message}</p>
        {children || (
            <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500">
                Got it
            </button>
        )}
    </Modal>
);

const Spinner = () => (
    <div className="flex justify-center items-center h-screen w-screen bg-[#0f172a]">
        <Loader2 className="animate-spin text-blue-500 h-24 w-24" />
    </div>
);

const StarRatingDisplay = ({ score = 0, totalRatings = 0 }) => {
    const fullStars = Math.round(score);
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={`transition-colors ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                ))}
            </div>
            <span className="text-sm text-slate-400 dark:text-slate-400">({totalRatings})</span>
        </div>
    );
};

const AuthScreen = () => {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(!location.state?.defaultToSignUp);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleAuthError = (err) => {
        setLoading(false);
        console.error("Firebase Auth Error:", err);
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
            return;
        }
        const friendlyMessages = {
            'auth/invalid-credential': 'Invalid email or password. Please try again.',
            'auth/user-not-found': 'No account found with this email. Please sign up.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'This email is already registered. Please sign in.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.'
        };
        setError(friendlyMessages[err.code] || 'An unexpected error occurred. Please try again.');
    };

    const handleEmailPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email.trim() || !password.trim() || (!isLogin && !fullName.trim())) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const defaultAvatar = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fullName)}`;
                await updateAuthProfile(user, { displayName: fullName, photoURL: defaultAvatar });
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: fullName.trim(),
                    email: user.email,
                    username: null,
                    photoURL: defaultAvatar,
                    bio: '',
                    gender: null,
                    termsAgreed: false,
                    trustScore: 5,
                    totalRatings: 0,
                    dealsCompleted: 0,
                    verificationStatus: 'unverified',
                    isAgent: false,
                    isAdmin: false,
                    status: 'active',
                    createdAt: serverTimestamp(),
                    isOnline: true,
                });
            }
        } catch (err) {
            handleAuthError(err);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                const defaultAvatar = user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.displayName)}`;
                await setDoc(userRef, {
                    uid: user.uid,
                    fullName: user.displayName || 'Google User',
                    email: user.email,
                    username: null,
                    photoURL: defaultAvatar,
                    bio: '',
                    gender: null,
                    termsAgreed: false,
                    trustScore: 5,
                    totalRatings: 0,
                    dealsCompleted: 0,
                    verificationStatus: 'unverified',
                    isAgent: false,
                    isAdmin: false,
                    status: 'active',
                    createdAt: serverTimestamp(),
                    isOnline: true,
                });
            }
        } catch (err) {
            handleAuthError(err);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            <div className="w-full max-w-md z-10">
                <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    <div className="text-center mb-8">
                        <Shield size={48} className="mx-auto text-blue-400 mb-4" />
                        <h2 className="text-3xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
                        <p className="text-slate-400 dark:text-slate-400 mt-2">{isLogin ? 'Sign in to access your dashboard.' : 'Start your secure transaction journey.'}</p>
                    </div>
                    <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-slate-400 dark:text-slate-400 text-sm font-bold mb-2" htmlFor="fullName">Full Name</label>
                                <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter your full name" />
                            </div>
                        )}
                        <div>
                            <label className="block text-slate-400 dark:text-slate-400 text-sm font-bold mb-2" htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-slate-400 dark:text-slate-400 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
                        </div>
                        {error && <p className="text-red-400 text-center text-sm p-2 bg-red-900/30 rounded-lg border border-red-800">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all flex justify-center items-center gap-2">
                            {loading ? <><Loader2 className="animate-spin" size={20} />Processing...</> : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                        {isLogin && (
                            <div className="text-center mt-4">
                                <button type="button" onClick={() => alert("Password reset link will be sent to your email. Feature coming soon!")} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </form>
                    <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-400 dark:text-slate-400 rounded-md backdrop-blur-sm">OR</span></div></div>
                    <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.383,35.61,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                        Continue with Google
                    </button>
                    <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-blue-400 hover:text-blue-300 ml-1 transition-colors">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const CompleteProfileScreen = ({ user, userData, onProfileComplete }) => {
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const checkUsernameAvailability = useCallback(debounce(async (uname) => {
        setIsChecking(true);
        setError('');
        if (!uname || uname.length < 3) {
            setIsChecking(false);
            return;
        }
        try {
            const q = query(collection(db, "users"), where("username", "==", uname));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setError("This username is already taken.");
                const namePart = (userData?.fullName?.split(' ')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
                setSuggestions([
                    `${namePart}${Math.floor(100 + Math.random() * 900)}`,
                    `${namePart}_${Math.floor(10 + Math.random() * 90)}`,
                    `${namePart}${new Date().getFullYear().toString().slice(-2)}`
                ]);
            } else {
                setError('');
                setSuggestions([]);
            }
        } catch (e) {
            console.error("Error checking username:", e);
            setError("Could not verify username. Please check your connection.");
        } finally {
            setIsChecking(false);
        }
    }, 500), [userData]);

    const handleUsernameChange = (e) => {
        let value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (value.length > 15) {
            value = value.slice(0, 15);
        }
        let formatError = '';
        if (value.length > 0 && !/^[a-z]/.test(value)) {
            formatError = "Username must start with a letter.";
        } else if (value.length > 0 && value.length < 3) {
            formatError = "Username must be at least 3 characters long.";
        }
        setUsername(value);
        setError(formatError);
        if(formatError) {
            setSuggestions([]);
        } else {
            checkUsernameAvailability(value);
        }
    };
  
    const selectSuggestion = (s) => {
        setUsername(s);
        setError('');
        setSuggestions([]);
        checkUsernameAvailability(s);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error || isChecking || !username || username.length < 3 || loading) {
            setError(error || "Please choose a valid username.");
            return;
        }
        setLoading(true);
        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error("This username was just taken. Please try another.");
            }
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { username: username });
            onProfileComplete();
        } catch (err) {
            console.error("Error completing profile:", err);
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white p-4">
            <div className="w-full max-w-md bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
                <User size={48} className="mx-auto text-blue-400 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Almost There!</h2>
                <p className="text-slate-400 dark:text-slate-400 mb-8">Create a unique username to complete your profile.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <div className="relative">
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                className={`w-full text-center px-4 py-3 rounded-lg bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-700'} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                placeholder="your_unique_username"
                                aria-describedby="username-helper"
                                autoFocus
                            />
                            {isChecking && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 dark:text-slate-400"/>}
                        </div>
                        <p id="username-helper" className={`text-xs mt-2 px-1 text-left ${error ? 'text-red-400' : 'text-slate-400 dark:text-slate-400'}`}>{error || "3-15 characters, starts with a letter, (a-z, 0-9, _)."}</p>
                        {suggestions.length > 0 && (
                            <div className="mt-3 px-1 text-left">
                                <span className="text-xs text-slate-400 dark:text-slate-400">Suggestions:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {suggestions.map(s => (
                                        <button key={s} type="button" onClick={() => selectSuggestion(s)} className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-full transition-colors">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button type="submit" disabled={loading || isChecking || !!error || !username} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProfileSetupScreen = ({ user, userData, onSetupComplete }) => {
    const [fullName, setFullName] = useState(userData?.fullName || '');
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const maleAvatar = 'https://ik.imagekit.io/sc0nilcwf/7309681.jpg?updatedAt=1751692671453';
    const femaleAvatar = 'https://ik.imagekit.io/sc0nilcwf/7294811.jpg?updatedAt=1751692671792';

    const handleGenderSelect = (gender, url) => {
        setSelectedGender(gender);
        setSelectedAvatarUrl(url);
    };

    const handleContinue = async () => {
        if (!selectedGender || !fullName.trim()) {
            alert("Please select a gender and enter your full name.");
            return;
        }
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                gender: selectedGender,
                fullName: fullName.trim(),
                photoURL: selectedAvatarUrl,
            });
            await updateAuthProfile(auth.currentUser, {
                displayName: fullName.trim(),
                photoURL: selectedAvatarUrl
            });
            onSetupComplete();
        } catch (error) {
            console.error("Error saving profile setup:", error);
            alert("Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white p-4">
            <div className="w-full max-w-md bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
                <User size={48} className="mx-auto text-blue-400 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Setup Your Profile</h2>
                <p className="text-slate-400 dark:text-slate-400 mb-8">Confirm your name and choose an avatar to begin.</p>
                <div className="mb-6 text-left">
                    <label htmlFor="fullName" className="block text-slate-300 text-sm font-bold mb-2">Your Full Name</label>
                    <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <button onClick={() => handleGenderSelect('male', maleAvatar)} className={`p-4 rounded-xl border-4 bg-slate-800/50 transition-all ${selectedGender === 'male' ? 'border-blue-500' : 'border-transparent hover:border-slate-600'}`}>
                        <img src={maleAvatar} alt="Male Avatar" className="w-24 h-24 mx-auto rounded-full mb-3 object-cover" />
                        <span className="font-bold text-lg">Male</span>
                    </button>
                    <button onClick={() => handleGenderSelect('female', femaleAvatar)} className={`p-4 rounded-xl border-4 bg-slate-800/50 transition-all ${selectedGender === 'female' ? 'border-blue-500' : 'border-transparent hover:border-slate-600'}`}>
                        <img src={femaleAvatar} alt="Female Avatar" className="w-24 h-24 mx-auto rounded-full mb-3 object-cover" />
                        <span className="font-bold text-lg">Female</span>
                    </button>
                </div>
                <button onClick={handleContinue} disabled={loading || !selectedGender || !fullName.trim()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:opacity-50 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg text-lg">
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    Continue
                </button>
            </div>
        </div>
    );
};

const TermsAndConditionsScreen = ({ onAgree }) => {
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);
    return (
        <div className="fixed inset-0 bg-slate-900 z-[100] p-4 sm:p-6 lg:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl h-full flex flex-col bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-slate-700 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Legal Agreements</h2>
                    <p className="text-slate-400 dark:text-slate-400 mt-1">Please review and agree to our policies to continue.</p>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-8 no-scrollbar">
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-blue-400">Terms of Service</h3>
                        <div className="max-h-80 overflow-y-auto p-4 bg-slate-900/50 rounded-md border border-slate-700 text-sm text-slate-300">
                            <pre className="whitespace-pre-wrap font-sans">{termsAndConditionsText}</pre>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-blue-400">Privacy Policy</h3>
                        <div className="max-h-80 overflow-y-auto p-4 bg-slate-900/50 rounded-md border border-slate-700 text-sm text-slate-300">
                            <pre className="whitespace-pre-wrap font-sans">{privacyPolicyText}</pre>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                    <div className="space-y-4 mb-6">
                        <label className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                            <input type="checkbox" checked={agreedTerms} onChange={() => setAgreedTerms(!agreedTerms)} className="h-5 w-5 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 rounded shrink-0" />
                            <span className="ml-4 text-slate-200">I have read, understood, and agree to the Terms of Service.</span>
                        </label>
                        <label className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                            <input type="checkbox" checked={agreedPrivacy} onChange={() => setAgreedPrivacy(!agreedPrivacy)} className="h-5 w-5 bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 rounded shrink-0" />
                            <span className="ml-4 text-slate-200">I have read, understood, and agree to the Privacy Policy.</span>
                        </label>
                    </div>
                    <button onClick={onAgree} disabled={!agreedTerms || !agreedPrivacy} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-slate-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg">
                        Agree and Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImportantNotesModal = ({ isOpen, onClose }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Important Safety Notes">
        <div className="space-y-4 text-slate-300">
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <h4 className="font-bold text-red-400 flex items-center gap-2"><AlertCircle size={18}/> Fund Safety First</h4>
                <p className="text-sm mt-1">Your funds are only secure when you pay to the official company account provided in the app. <strong className="text-red-300">NEVER pay a seller directly under any circumstances.</strong> We are not responsible for any funds lost if you bypass our system.</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
                <h4 className="font-bold text-white flex items-center gap-2"><IndianRupee size={18} /> Official Payment Info</h4>
                <p className="text-sm mt-1">Always confirm our official payment details from within the deal chat. This information is your single source of truth.</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
                <h4 className="font-bold text-white flex items-center gap-2"><HelpCircle size={18}/> Need Help?</h4>
                <p className="text-sm mt-1">If you suspect fraudulent activity or need assistance, raise a dispute or contact our support team immediately through the app.</p>
            </div>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            I Understand and Agree
        </button>
    </Modal>
);

const CreateDealModal = ({ isOpen, onClose, onCreateDeal, userData }) => {
    const [step, setStep] = useState('enter_price');
    const [purpose, setPurpose] = useState('');
    const [price, setPrice] = useState('');
    const [userRole, setUserRole] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('GPay');
    const [paymentIdentifier, setPaymentIdentifier] = useState('');
    const [otherPaymentMethod, setOtherPaymentMethod] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ show: false, title: '', message: '', isKYC: false });
    const navigate = useNavigate();

    const resetAndClose = useCallback(() => {
        setStep('enter_price');
        setPurpose('');
        setPrice('');
        setUserRole('');
        setPaymentMethod('GPay');
        setPaymentIdentifier('');
        setOtherPaymentMethod('');
        setError('');
        setIsCreating(false);
        setAlertInfo({ show: false, title: '', message: '', isKYC: false });
        onClose();
    }, [onClose]);

    const handlePriceContinue = () => {
        setError('');
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError("Price must be a valid positive number.");
            return;
        }
        if (numericPrice >= 5000 && userData?.verificationStatus !== 'verified') {
            setAlertInfo({ 
                show: true,
                title: "Identity Verification Required",
                message: "To create deals of ₹5000 or more, you must complete identity verification (KYC). Please go to your profile to start the process.",
                isKYC: true 
            });
            return;
        }
        setError('');
        setStep('fill_details');
    };
    
    const handleSubmitDeal = async () => {
        setError('');
        const numericPrice = parseFloat(price);
        if (!purpose.trim()) { setError("Deal's Purpose cannot be empty."); return; }
        if (isNaN(numericPrice) || numericPrice <= 0) { setError("Price must be a valid positive number."); return; }
        if (!userRole) { setError("You must select your role (Buyer or Seller)."); return; }
        
        let buyerInfo = null;
        if (userRole === 'Buyer') {
            if (!paymentIdentifier.trim()) {
                 setError("Please provide your payment ID so we can send a request."); return;
            }
            if (paymentMethod === 'Other' && !otherPaymentMethod.trim()){
                 setError("Please specify the other payment method."); return;
            }
            buyerInfo = {
                method: paymentMethod === 'Other' ? otherPaymentMethod.trim() : paymentMethod,
                identifier: paymentIdentifier.trim()
            };
        }
        
        setIsCreating(true);
        const dealData = {
            purpose: purpose.trim(),
            price: numericPrice,
            creatorRole: userRole,
            buyerInfo: buyerInfo,
        };
        
        try {
            const success = await onCreateDeal(dealData);
            if (success) {
                resetAndClose();
            }
        } catch (err) {
            setError(err.message || "Failed to create the deal. Please try again.");
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };
    
    const navigateToProfileAndClose = () => {
        resetAndClose();
        navigate('/verify');
    };

    if (alertInfo.show) {
        if (alertInfo.isKYC) {
            return (
                <CustomAlertModal isOpen={true} onClose={resetAndClose} title={alertInfo.title} message={alertInfo.message}>
                    <div className="flex flex-col gap-3 mt-4">
                        <button onClick={navigateToProfileAndClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Go to Verification
                        </button>
                        <button onClick={resetAndClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </CustomAlertModal>
            );
        }
        return <CustomAlertModal isOpen={true} onClose={resetAndClose} title={alertInfo.title} message={alertInfo.message} />;
    }

    const renderPriceStep = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="price" className="block text-slate-300 text-sm font-bold mb-2">Deal Price (in ₹)</label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={20} />
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 8000" className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handlePriceContinue} disabled={!price} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:bg-slate-500 disabled:cursor-not-allowed">
                Continue
            </button>
        </div>
    );

    const renderDetailsStep = () => {
        const getIdentifierLabel = () => {
            switch (paymentMethod) {
                case 'GPay': case 'PhonePe': case 'Paytm': return `Your ${paymentMethod} UPI ID`;
                case 'Binance': return 'Your Binance Pay ID';
                case 'Other': return 'Your Payment Identifier (e.g., Account No.)';
                default: return 'Payment Identifier';
            }
        };

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Deal's Purpose</label>
                    <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., Facebook Page Sale" className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Your Role in this Deal</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setUserRole('Buyer')} className={`p-3 text-center rounded-lg border-2 transition-colors ${userRole === 'Buyer' ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}`}>Buyer</button>
                        <button onClick={() => setUserRole('Seller')} className={`p-3 text-center rounded-lg border-2 transition-colors ${userRole === 'Seller' ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}`}>Seller</button>
                    </div>
                </div>
                {userRole === 'Buyer' && (
                    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in-fast">
                        <p className="text-sm text-slate-400 dark:text-slate-400">Provide your payment details. This helps us verify when you've paid.</p>
                        <div>
                            <label className="block text-slate-300 text-sm font-bold mb-2">Your Payment Method</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                               <option>GPay</option> <option>PhonePe</option> <option>Paytm</option> <option>Binance</option> <option>Other</option>
                            </select>
                        </div>
                        {paymentMethod === 'Other' && (
                            <div>
                                 <label className="block text-slate-300 text-sm font-bold mb-2">Specify Other Method</label>
                                 <input type="text" value={otherPaymentMethod} onChange={e => setOtherPaymentMethod(e.target.value)} placeholder="e.g., Bank Transfer" className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        )}
                        <div>
                            <label className="block text-slate-300 text-sm font-bold mb-2">{getIdentifierLabel()}</label>
                            <input type="text" value={paymentIdentifier} onChange={e => setPaymentIdentifier(e.target.value)} placeholder="Enter details here" className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                )}
                {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}
                <button onClick={handleSubmitDeal} disabled={isCreating} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2">
                    {isCreating ? <><Loader2 className="animate-spin" size={20} />Creating...</> : 'Create Secure Deal'}
                </button>
            </div>
        );
    }
    
    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title={step === 'enter_price' ? 'Start a New Deal' : 'Deal Details'}>
            <button onClick={() => setStep('enter_price')} className={`absolute top-5 left-4 text-slate-400 dark:text-slate-400 hover:text-white transition-colors ${step === 'enter_price' && 'hidden'}`}>
                <ChevronLeft size={24}/>
            </button>
            {step === 'enter_price' ? renderPriceStep() : renderDetailsStep()}
        </Modal>
    );
};


const EditProfileModal = ({ isOpen, onClose, user, userData, onProfileUpdate }) => {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [newPhoto, setNewPhoto] = useState(null);
    // THIS IS THE FIX: Initialize state with null instead of an empty string.
    const [photoPreview, setPhotoPreview] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '' });

    // Effect to reset form state whenever the modal is opened with new user data.
    useEffect(() => {
        if (isOpen && userData) {
            setFullName(userData.fullName || '');
            setBio(userData.bio || '');
            // This now correctly sets the initial preview URL, or null if it doesn't exist.
            setPhotoPreview(userData.photoURL || null); 
            setNewPhoto(null); // Clear any previously selected file
        }
    }, [isOpen, userData]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAlert({ isOpen: true, title: 'Invalid File Type', message: 'Please select an image file (e.g., JPG, PNG).' });
            return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB limit
        if (file.size > maxSize) {
            setAlert({ isOpen: true, title: 'File Too Large', message: 'Profile picture must be smaller than 5MB.' });
            return;
        }

        setNewPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalPhotoURL = userData.photoURL;

            if (newPhoto) {
                const photoRef = ref(storage, `profile-pics/${user.uid}/${Date.now()}_${newPhoto.name}`);
                await uploadBytes(photoRef, newPhoto);
                finalPhotoURL = await getDownloadURL(photoRef);
            }
            
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { 
                fullName: fullName.trim(), 
                bio: bio.trim(), 
                photoURL: finalPhotoURL 
            });

            await updateAuthProfile(auth.currentUser, { 
                displayName: fullName.trim(), 
                photoURL: finalPhotoURL 
            });
            
            onProfileUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating profile: ", error);
            setAlert({ isOpen: true, title: 'Update Failed', message: 'Could not save profile changes. Please try again.' });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="flex flex-col items-center">
                        {/* THIS IS THE SECOND FIX: Add a conditional render and a default avatar */}
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-slate-700" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-4 border-4 border-slate-700">
                                <User size={48} className="text-slate-500" />
                            </div>
                        )}
                        <label htmlFor="photo-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">Change Picture</label>
                        <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        <p className="text-xs text-slate-400 dark:text-slate-400 mt-2">Max 5MB (JPG, PNG)</p>
                    </div>
                    <div>
                        <label htmlFor="modalFullName" className="block text-slate-300 text-sm font-bold mb-2">Full Name</label>
                        <input type="text" id="modalFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="modalBio" className="block text-slate-300 text-sm font-bold mb-2">Bio</label>
                        <textarea id="modalBio" rows="3" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell everyone a little about yourself..."></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-slate-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2">
                        {loading ? <><Loader2 className="animate-spin" size={20} />Saving...</> : 'Save Changes'}
                    </button>
                </form>
            </Modal>
            <CustomAlertModal isOpen={alert.isOpen} onClose={() => setAlert({ ...alert, isOpen: false })} title={alert.title} message={alert.message} />
        </>
    );
};

const PostDealModal = ({ isOpen, onRate, otherUserName }) => {
    const [step, setStep] = useState('appRating');
    const [rating, setRating] = useState(0);
    const hasRatedApp = useRef(false);

    const handleRateOnStore = () => {
        window.open('https://play.google.com/store/apps', '_blank', 'noopener,noreferrer');
        hasRatedApp.current = true;
        setStep('partnerRating');
    };

    const handleSkipAppRating = () => {
        setStep('partnerRating');
    };

    const handleSubmitPartnerRating = () => {
        if (rating > 0) {
            onRate(rating);
        }
    };
    
    const handleClose = () => { 
        onRate(0);
        setRating(0);
        setStep('appRating');
        hasRatedApp.current = false;
    };
    
    if (!isOpen) return null;

    const renderAppRatingStep = () => (
        <div className="text-center">
            <Award size={48} className="mx-auto text-yellow-400 mb-4" />
            <p className="text-slate-300 mb-6">Enjoying DealSetu? A quick rating helps us grow and improve for everyone!</p>
            <div className="flex flex-col gap-3">
                <button onClick={handleRateOnStore} className="w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg">
                    Rate Us on the Store
                </button>
                <button onClick={handleSkipAppRating} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
                    Maybe Later
                </button>
            </div>
        </div>
    );

    const renderPartnerRatingStep = () => (
        <div>
            <p className="text-center text-slate-300 mb-2">How was your experience with <span className="font-bold text-white">{otherUserName}</span>?</p>
            <p className="text-center text-xs text-blue-400 mb-6">Your feedback builds a safer community by contributing to their Trust Score.</p>
            <div className="flex justify-center items-center gap-2 text-4xl mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} star`}>
                        <Star className={`transition-all transform hover:scale-125 cursor-pointer ${rating >= star ? "text-yellow-400 fill-yellow-400" : "text-slate-600 hover:text-yellow-500"}`} />
                    </button>
                ))}
            </div>
            <button onClick={handleSubmitPartnerRating} disabled={rating === 0} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-slate-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg">
                Submit Rating
            </button>
        </div>
    );
    
    const currentStepContent = step === 'appRating' && !hasRatedApp.current
        ? renderAppRatingStep()
        : renderPartnerRatingStep();
        
    const title = step === 'appRating' && !hasRatedApp.current
        ? "How Are We Doing?"
        : `Rate Your Partner`;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            {currentStepContent}
        </Modal>
    );
};

// --- DELETE THE OLD Sidebar COMPONENT ---

// --- DELETE your old MainLayout and REPLACE it with this ---
const MainLayout = ({ children, onCreateDealClick }) => {
    return (
        <div className="w-full h-full bg-[#0f172a] text-white">
            <TopHeader />
            
            {/* The main content area now has MORE padding at the bottom to ensure */}
            {/* content doesn't get hidden behind the taller navbar (h-24) */}
            <main className="pt-16 pb-28 h-full overflow-y-auto">
                {children}
            </main>

            {/* The new BottomNavBar now takes care of its own button */}
            <BottomNavBar onCreateDealClick={onCreateDealClick} />
        </div>
    );
};
const Dashboard = ({ userData, allChats }) => {
    if (!userData || !allChats) return <Spinner />;
    const platformFee = 0.05;
    const totalEarnings = allChats
      .filter(chat => chat.status === 'closed' && chat.participantInfo && chat.participantInfo[userData.uid]?.role === 'Seller')
      .reduce((sum, chat) => sum + (chat.price || 0), 0);
    const StatCard = ({ icon, title, value, subtext }) => (
        <div className="bg-[#1e293b]/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-full">
            <div>
                <div className="text-slate-400 dark:text-slate-400 font-medium flex items-center gap-2">{icon} {title}</div>
                <h3 className="text-3xl font-bold text-white mt-3 flex items-center gap-1.5">{value}</h3>
                {subtext && <p className="text-sm text-slate-500 mt-1">{subtext}</p>}
            </div>
        </div>
    );
    const getStatusVisuals = (status) => {
        const baseClasses = 'text-xs capitalize px-2 py-0.5 rounded-full mt-1 inline-block';
        switch (status) {
            case 'closed': case 'dispute_resolved': return `${baseClasses} bg-green-500/20 text-green-400`;
            case 'disputed': return `${baseClasses} bg-red-500/20 text-red-400`;
            case 'active': case 'payment_pending_confirmation': return `${baseClasses} bg-blue-500/20 text-blue-400`;
            default: return `${baseClasses} bg-yellow-500/20 text-yellow-400`;
        }
    };
    return (
        <div className="flex-1 bg-[#0f172a] text-white p-4 md:p-8 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userData.username}!</h1>
                    <p className="text-slate-400 dark:text-slate-400">Here's your dashboard overview.</p>
                </div>
                <Link to="/profile" className="shrink-0">
                    <img src={userData.photoURL} alt="Your profile" className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"/>
                </Link>
            </header>
            {['unverified', 'rejected'].includes(userData.verificationStatus) && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle />
                        <div>
                            <h4 className="font-bold">Account Verification Required</h4>
                            <p className="text-sm">Complete identity verification to unlock all features, like creating deals over ₹5000.</p>
                        </div>
                    </div>
                    <Link to="/verify" className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg whitespace-nowrap transition-colors hover:bg-yellow-500">
                        {userData.verificationStatus === 'rejected' ? 'Re-submit Verification' : 'Verify Now'}
                    </Link>
                </div>
            )}
            {userData.verificationStatus === 'pending' && (
                <div className="bg-blue-900/50 border border-blue-700 text-blue-200 p-4 rounded-lg mb-8 flex items-center gap-3">
                    <Clock />
                    <div> <h4 className="font-bold">Verification Pending</h4> <p className="text-sm">Your documents are under review. This usually takes 24-48 hours.</p> </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<Activity size={18}/>} title="Active Deals" value={allChats.filter(c => !['closed', 'disputed', 'dispute_resolved'].includes(c.status)).length} subtext={`${allChats.length} total deals created`} />
                <StatCard icon={<IndianRupee size={22} />} title="Earnings (After Fee)" value={`₹${(totalEarnings * (1 - platformFee)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtext="From completed deals as Seller" />
                <StatCard icon={<CheckCircle size={18} />} title="Deals Completed" value={userData.dealsCompleted || 0} subtext="As Buyer or Seller" />
            </div>
            <div className="mt-8 bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h3 className="text-xl font-bold mb-4">Recent Deals</h3>
                <div className="space-y-4">
                    {allChats.slice(0, 5).length > 0 ? allChats.slice(0, 5).map(chat => {
                        const otherId = chat.participants?.find(p => p !== userData.uid);
                        const otherInfo = otherId ? chat.participantInfo?.[otherId] : null;
                        return (
                            <Link to={`/chat/${chat.id}`} key={chat.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                                       {otherInfo?.photoURL ? <img src={otherInfo.photoURL} alt={otherInfo.username || ''} className="w-full h-full rounded-full object-cover" /> : <UserPlus className="text-slate-400 dark:text-slate-400" /> }
                                    </div>
                                    <div>
                                       <p className="font-semibold text-white">{chat.purpose}</p>
                                       <p className="text-sm text-slate-400 dark:text-slate-400">With: {otherInfo?.username || "Pending Invite"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white flex items-center justify-end"><IndianRupee size={16}/>{(chat.price || 0).toLocaleString('en-IN')}</p>
                                    <span className={getStatusVisuals(chat.status)}>{chat.status.replace(/_/g, ' ')}</span>
                                </div>
                            </Link>
                        )
                    }) : (
                        <div className="text-center py-8">
                            <Briefcase size={40} className="mx-auto text-slate-600 mb-4"/>
                            <p className="text-slate-400 dark:text-slate-400">You have no recent deals.</p>
                            <p className="text-slate-500 text-sm">Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DealCard = ({ chat, userData }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const otherParticipantId = chat.participants?.find(p => p !== userData.uid && !chat.participantInfo?.[p]?.isAgent);
    const otherParticipantInfo = otherParticipantId ? chat.participantInfo?.[otherParticipantId] : null;

    useEffect(() => {
        const q = query(collection(db, 'chats', chat.id, 'messages'), where('senderId', '!=', userData.uid));
        const unsubscribe = onSnapshot(q, snapshot => {
            const unreadMessages = snapshot.docs.filter(doc => !doc.data().seenBy?.includes(userData.uid));
            setUnreadCount(unreadMessages.length);
        });
        return () => unsubscribe();
    }, [chat.id, userData.uid]);
    
    const getStatusVisuals = (status) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full capitalize';
        switch (status) {
            case 'closed': case 'dispute_resolved': return `${baseClasses} bg-green-500/20 text-green-400`;
            case 'disputed': return `${baseClasses} bg-red-500/20 text-red-400`;
            case 'active': case 'payment_pending_confirmation': return `${baseClasses} bg-blue-500/20 text-blue-400`;
            default: return `${baseClasses} bg-yellow-500/20 text-yellow-400`;
        }
    };

    return (
        <Link to={`/chat/${chat.id}`} key={chat.id} className="block bg-[#1e293b]/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-500 transition-colors relative">
             {unreadCount > 0 && 
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {unreadCount}
                </span>
             }
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{chat.purpose}</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-400">ID: <code className="font-mono">{chat.humanReadableId}</code></p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">With: <span className="font-medium text-slate-300">{otherParticipantInfo?.username || 'Pending Invite'}</span></p>
                </div>
                <p className="font-bold text-xl text-white flex items-center shrink-0"><IndianRupee size={18}/>{(chat.price || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <span className={getStatusVisuals(chat.status)}> {chat.status.replace(/_/g, ' ')} </span>
                <span className="text-xs text-slate-500">{formatDate(chat.createdAt)}</span>
            </div>
        </Link>
    );
};

const ActiveDealsScreen = ({ chats, userData }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filteredChats, setFilteredChats] = useState([]);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    useEffect(() => {
        if (!chats) { setFilteredChats([]); return; }
        const newFilteredChats = chats.filter(chat => {
            if (!chat.createdAt?.toDate) return false;
            const chatDate = chat.createdAt.toDate();
            const isAfterStart = !startDate || chatDate >= startDate;
            const isBeforeEnd = !endDate || chatDate <= endDate;
            return isAfterStart && isBeforeEnd;
        });
        setFilteredChats(newFilteredChats);
    }, [startDate, endDate, chats]);
    
    const handleDateChange = (setter, dateString, isEndDate = false) => {
        if (dateString) { const date = new Date(dateString); if(isEndDate) { date.setHours(23, 59, 59, 999); } else { date.setHours(0, 0, 0, 0); } setter(date); } else { setter(null); }
    };
    const clearFilters = () => { setStartDate(null); setEndDate(null); if (startDateRef.current) startDateRef.current.value = ''; if (endDateRef.current) endDateRef.current.value = ''; };

    return (
        <div className="flex-1 bg-[#0f172a] text-white p-4 md:p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6">All Deals</h1>
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 mb-6 flex flex-col sm:flex-row items-center gap-4">
                 <p className="font-semibold whitespace-nowrap">Filter by Date:</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <input ref={startDateRef} type="date" onChange={e => handleDateChange(setStartDate, e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" title="Start Date" />
                    <input ref={endDateRef} type="date" onChange={e => handleDateChange(setEndDate, e.target.value, true)} className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" title="End Date"/>
                 </div>
                 <button onClick={clearFilters} className="text-slate-400 dark:text-slate-400 hover:text-white transition-colors text-sm whitespace-nowrap">Clear</button>
            </div>
            <div className="space-y-4">
                {filteredChats.length > 0 ? (
                    filteredChats.map(chat => (
                        <DealCard key={chat.id} chat={chat} userData={userData} />
                    ))
                ) : (
                    <div className="text-center py-16">
                        <Briefcase size={48} className="mx-auto text-slate-600 mb-4"/>
                        <h2 className="text-xl text-slate-400 dark:text-slate-400">{chats?.length > 0 ? 'No deals match your filter.' : 'No deals yet.'}</h2>
                        <p className="text-slate-500">{chats?.length > 0 ? 'Try adjusting the date range.' : 'Create a new deal to get started!'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- REPLACE YOUR ProfileScreen WITH THIS FULL, CORRECTED VERSION ---

const ProfileScreen = ({ user, userData, onProfileUpdate, onLogout }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    if (!userData) return <Spinner/>;

    const trustPercentage = calculateTrustPercentage(userData.trustScore, userData.totalRatings);

    const getVerificationStatus = () => {
        switch(userData.verificationStatus) {
            case 'verified':
                return <span className="flex items-center gap-1.5 text-green-400"><CheckCircle size={16}/> Verified</span>;
            case 'pending':
                return <span className="flex items-center gap-1.5 text-yellow-400"><Clock size={16}/> Pending Review</span>;
            case 'rejected':
                return <span className="flex items-center gap-1.5 text-red-400"><AlertCircle size={16}/> Rejected</span>;
            default:
                 return <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400"><AlertCircle size={16}/> Unverified</span>;
        }
    };
    
    return (
      // The main container. p-4 for small screens, sm:p-6 for larger.
      <div className="text-white p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6"> {/* Consistent spacing */}
        
            {/* === Profile Header (from your original code) === */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="relative shrink-0">
                    <img src={userData.photoURL} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-lg"/>
                    {userData.verificationStatus === 'verified' && (
                      <div className="absolute bottom-1 right-1 bg-green-500 text-slate-900 rounded-full p-1.5 border-2 border-slate-900">
                          <CheckCircle size={24}/>
                      </div>
                    )}
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <h1 className="text-3xl font-bold">{userData.username}</h1>
                        <button onClick={() => setEditModalOpen(true)} className="text-slate-400 dark:text-slate-400 hover:text-white transition-colors p-1 rounded-full" aria-label="Edit profile"><Edit size={18}/></button>
                    </div>
                    <p className="text-slate-300">{userData.fullName}</p>
                    <div className="mt-2 flex justify-center md:justify-start">
                      <StarRatingDisplay score={userData.trustScore} totalRatings={userData.totalRatings} />
                    </div>
                </div>
            </div>

            {/* === Verification Banner (from your original code) === */}
            {userData.verificationStatus !== 'verified' && (
                <div className="bg-blue-900/40 border border-blue-700 text-blue-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                       <h4 className="font-bold">Complete Your Verification</h4>
                       <p className="text-sm">Verified users build more trust. Submit your documents to get the verified checkmark.</p>
                    </div>
                    <Link to="/verify" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg whitespace-nowrap">
                       {userData.verificationStatus === 'rejected' ? 'Re-Submit' : (userData.verificationStatus === 'pending' ? 'View Status' : 'Start Verification')}
                    </Link>
                </div>
            )}
            
            {/* === Stats and Info Grid (from your original code) === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4 text-slate-300">Statistics</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-slate-400 dark:text-slate-400">Trust Score</span> <p className="text-xl font-bold text-blue-400">{trustPercentage}<span className="text-base">%</span></p></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400 dark:text-slate-400">Deals Completed</span><p className="text-xl font-bold text-white">{userData.dealsCompleted || 0}</p></div>
                        <div className="flex items-center justify-between"><span className="text-slate-400 dark:text-slate-400">Total Ratings</span> <p className="text-xl font-bold text-white">{userData.totalRatings || 0}</p></div>
                    </div>
                </div>
                <div className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4 text-slate-300">Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3"><Mail className="text-slate-500 mt-1 shrink-0"/><span className="font-semibold break-all">{userData.email}</span></div>
                        <div className="flex items-center gap-3"><Shield className="text-slate-500 shrink-0"/>{getVerificationStatus()}</div>
                        <div className="flex items-center gap-3"><Calendar className="text-slate-500 shrink-0"/><span>Joined {formatDate(userData.createdAt)}</span></div>
                    </div>
                </div>
            </div>
            
            {/* === About Me Section (from your original code) === */}
            <div className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h2 className="text-xl font-bold mb-2 text-slate-300">About Me</h2>
                <p className="text-slate-300 whitespace-pre-wrap">{userData.bio || 'This user has not written a bio yet.'}</p>
            </div>
            
            {/* === THE NEW LOGOUT BUTTON === */}
            <div className="pt-4">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-300 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

        </div>

        {/* The modal is unchanged and correct */}
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={user} userData={userData} onProfileUpdate={onProfileUpdate} />
      </div>
    );
};

const VerificationScreen = ({ user, userData }) => {
    const navigate = useNavigate();
    const [idType, setIdType] = useState('');
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!idType) { setError('Please select an ID document type.'); return; }
        if (!frontImage) { setError('Please upload the front image of your ID.'); return; }
        const requiresBack = ['Aadhaar Card', 'Driving Licence', 'Voter Card'].includes(idType);
        if (requiresBack && !backImage) { setError('This ID type requires both front and back images.'); return; }
        setLoading(true);

        try {
            const idToken = await getIdToken(user);

            const uploadImage = async (imageFile, side) => {
                const docRef = ref(storage, `verification_docs/${user.uid}/${idType.replace(/\s+/g, '_')}_${side}_${Date.now()}`);
                
                // Add the token and userId as custom metadata
                const metadata = {
                  customMetadata: {
                    'userId': user.uid,
                    'token': idToken 
                  }
                };

                await uploadBytes(docRef, imageFile, metadata); // Pass metadata here
                return getDownloadURL(docRef);
            };

            const frontImageUrl = await uploadImage(frontImage, 'front');
            const backImageUrl = (requiresBack && backImage) ? await uploadImage(backImage, 'back') : null;
            const batch = writeBatch(db);
            batch.update(doc(db, 'users', user.uid), { verificationStatus: 'pending' });
            
            const verificationRef = doc(db, 'verifications', user.uid);
            batch.set(verificationRef, {
                userId: user.uid, username: userData.username, fullName: userData.fullName, idType,
                frontImageUrl, backImageUrl, status: 'pending', submittedAt: serverTimestamp(),
            });
            await batch.commit();
            navigate('/profile', { replace: true });
        } catch (err) {
            console.error("Verification submission error:", err);
            setError('Upload failed. Please check file sizes and connection, then try again.');
            setLoading(false);
        }
    };
    
    if (['verified', 'pending'].includes(userData.verificationStatus)) {
        return (
            <div className="flex-1 bg-[#0f172a] text-white p-8 flex flex-col justify-center items-center">
                <div className="text-center max-w-lg">
                    {userData.verificationStatus === 'verified' ? 
                        <CheckCircle size={64} className="mx-auto text-green-400 mb-4"/> : 
                        <Clock size={64} className="mx-auto text-yellow-400 mb-4"/>
                    }
                    <h1 className="text-3xl font-bold mb-2">
                        {userData.verificationStatus === 'verified' ? 'You are Verified!' : 'Verification in Review'}
                    </h1>
                    <p className="text-slate-400 dark:text-slate-400">
                        {userData.verificationStatus === 'verified' ? 'Your identity has been confirmed. You now have access to all platform features.' : 'Your documents are under review. We will notify you once complete (usually within 24-48 hours).'}
                    </p>
                    <Link to="/profile" className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Back to Profile
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 bg-[#0f172a] text-white p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#1e293b]/60 p-8 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-8">
                <div>
                   <h1 className="text-3xl font-bold">Identity Verification (KYC)</h1>
                   <p className="text-slate-400 dark:text-slate-400 mt-1">Submit documents to get a verified badge and increase trust.</p>
                </div>
                {userData.verificationStatus === 'rejected' &&
                    <div className="bg-red-900/30 p-4 rounded-lg border border-red-800/50">
                        <h3 className="font-bold text-red-300 flex items-center gap-2"><AlertCircle/> Submission Rejected</h3>
                        <p className="text-sm mt-2 text-red-300/80">Your previous submission was rejected. Please ensure images are clear and your profile name matches your ID.</p>
                    </div>
                }
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
                   <h3 className="font-bold text-blue-300 flex items-center gap-2"><AlertCircle/> Important Notice</h3>
                   <p className="text-sm mt-2 text-blue-300/80">The name on your ID <strong className="font-bold text-blue-200">must match</strong> your profile name: <strong className="font-bold text-blue-200">{userData.fullName}</strong>.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">ID Document Type</label>
                        <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                           <option value="" disabled>-- Select a Document --</option>
                           <option>Aadhaar Card</option><option>Driving Licence</option><option>PAN Card</option><option>Passport</option><option>Voter Card</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-slate-300 text-sm font-bold mb-2">Front Side Image</label>
                           <input type="file" accept="image/png, image/jpeg" onChange={(e) => setFrontImage(e.target.files[0])} className="w-full text-sm text-slate-400 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition" />
                           {frontImage && <p className="text-xs text-green-400 mt-2 truncate">Selected: {frontImage.name}</p>}
                        </div>
                        {['Aadhaar Card', 'Driving Licence', 'Voter Card'].includes(idType) && (
                            <div>
                                <label className="block text-slate-300 text-sm font-bold mb-2">Back Side Image</label>
                                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setBackImage(e.target.files[0])} className="w-full text-sm text-slate-400 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition" />
                                {backImage && <p className="text-xs text-green-400 mt-2 truncate">Selected: {backImage.name}</p>}
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-400 text-sm bg-red-900/30 p-2 rounded-lg">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-slate-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                            {loading ? <><Loader2 className="animate-spin" size={20} />Submitting...</> : 'Submit for Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ChatScreen = ({ user, userData }) => {
    const { chatId } = useParams();
    const location = useLocation();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isRatingModalOpen, setRatingModalOpen] = useState(false);
    const [otherUserOnlineStatus, setOtherUserOnlineStatus] = useState(false);
    const [lastSeenMessageId, setLastSeenMessageId] = useState(null);
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '' });
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const isViewerMode = location.pathname.includes('/admin/') || location.pathname.includes('/agent/');

    const [activeTypers, setActiveTypers] = useState({});
    const typingTimeoutRef = useRef(null);
    const { otherParticipantId, otherParticipantInfo, myRoleInfo, isDealFinished, canSendMessage } = useMemo(() => {
        if (!chat) {
            return { otherParticipantId: null, otherParticipantInfo: null, myRoleInfo: null, isDealFinished: true, canSendMessage: false };
        }
        const id = chat.participants?.find(p => p !== user.uid && !chat.participantInfo[p]?.isAgent);
        const info = id ? chat.participantInfo[id] : null;
        const myInfo = chat.participantInfo?.[user.uid];
        const dealFinished = ['closed', 'cancelled', 'dispute_resolved'].includes(chat.status);
        const sendPermission = !dealFinished || (isViewerMode && (userData.isAdmin || userData.isAgent));
        return { otherParticipantId: id, otherParticipantInfo: info, myRoleInfo: myInfo, isDealFinished: dealFinished, canSendMessage: sendPermission };
    }, [chat, user, userData, isViewerMode]);

    useEffect(() => {
        if (!chatId || !user) return;
        const chatUnsub = onSnapshot(doc(db, "chats", chatId), (doc) => {
            if (doc.exists()) {
                setChat({ id: doc.id, ...doc.data() });
            } else { setChat(null); }
        });
        const messagesUnsub = onSnapshot(
            query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc")),
            (snapshot) => setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        );
        return () => { chatUnsub(); messagesUnsub(); };
    }, [chatId, user]);

    useEffect(() => {
        if (otherParticipantId) {
            const unsub = onSnapshot(doc(db, "users", otherParticipantId), (docSnapshot) => {
                if(docSnapshot.exists()){
                    setOtherUserOnlineStatus(docSnapshot.data()?.isOnline || false);
                }
            });
            return () => unsub();
        }
    }, [otherParticipantId]);

    useEffect(() => {
        if (messages.length === 0 || !user || !chatId) return;
        if (otherParticipantId) {
            const lastSeenByOther = messages.slice().reverse().find(m => m.seenBy?.includes(otherParticipantId));
            setLastSeenMessageId(lastSeenByOther?.id || null);
        }
        const batch = writeBatch(db);
        let writes = 0;
        messages.forEach(msg => {
            if (msg.senderId !== user.uid && !msg.seenBy?.includes(user.uid)) {
                batch.update(doc(db, "chats", chatId, "messages", msg.id), { seenBy: arrayUnion(user.uid) });
                writes++;
            }
        });
        if (writes > 0) {
            batch.commit().catch(e => console.error("Could not mark messages as seen:", e));
        }
    }, [messages, user, chatId, otherParticipantId]);

    useEffect(() => {
        if(isDealFinished && !isViewerMode && chat && !chat.ratedBy?.includes(user.uid)){
            setRatingModalOpen(true);
        }
    }, [isDealFinished, isViewerMode, chat, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- PASTE THIS ENTIRE BLOCK OF CODE HERE ---

    // --- NEW useEffect TO HANDLE TYPING STATUS ---
   // --- PASTE THIS NEW LISTENER IN THE SAME SPOT ---
useEffect(() => {
    if (!chatId) return;

    const rtdb = getDatabase(app);
    // Listen to the parent path for the entire chat room
    const chatTypingRef = dbRef(rtdb, `typing/${chatId}`);

    const unsubscribe = onValue(chatTypingRef, (snapshot) => {
        const typers = snapshot.val() || {};
        
        // Remove our own user ID from the list of typers so we don't see our own indicator
        delete typers[user.uid];

        setActiveTypers(typers);
    });

    return () => unsubscribe();
}, [chatId, user.uid]);
    // --- NEW FUNCTION TO UPDATE TYPING STATUS ---
  // --- AFTER (The Corrected `handleTyping` Function) ---

    // This function is called every time *our* user types a character.
    const handleTyping = () => {
        if (!chatId) return;

        const rtdb = getDatabase(app);
        // This is the path to OUR OWN typing status for THIS chat.
        const typingRef = dbRef(rtdb, `typing/${chatId}/${user.uid}`);
        
        // 1. Instantly set our status to 'true'.
        // This creates the node in the Realtime Database.
        set(typingRef, true);
        
        // 2. Clear any previous "stop typing" timer.
        // This happens if the user types another character before the 2-second timer runs out.
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // 3. Set a new timer. After 2 seconds of inactivity, we will DELETE the typing node.
        // The `remove()` command is a 'write' operation that is allowed by our new security rule.
        typingTimeoutRef.current = setTimeout(() => {
            remove(typingRef);
        }, 2000); 
    };
    
    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    if (!chat || !userData) {
        return <Spinner />;
    }
    const isParticipant = chat.participants?.includes(user.uid);
    if (!isParticipant && !isViewerMode) {
        return <div className="p-8 text-center text-red-400">Access Denied: You are not part of this deal.</div>;
    }
  
    const handleActionWithSystemMessage = async (actionFn, systemMessage) => {
        const batch = writeBatch(db);
        actionFn(batch);
        await sendSystemMessage(chatId, systemMessage, batch);      
        await batch.commit();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !canSendMessage) return;

        const tempMessage = newMessage;
        setNewMessage('');
        let senderRole;
        if(isViewerMode) {
            senderRole = userData.isAdmin ? 'Admin' : (userData.isAgent ? 'Agent' : 'User');
        } else {
            senderRole = myRoleInfo?.role || 'User';
        }
        await addDoc(collection(db, `chats/${chatId}/messages`), { 
            text: tempMessage, 
            senderId: user.uid,
            senderInfo: {
                username: userData.username,
                photoURL: userData.photoURL,
                role: senderRole,
            },
            timestamp: serverTimestamp(), 
            type: 'text', 
            seenBy: [user.uid]
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setAlert({ isOpen: true, title: 'Invalid File', message: 'Only image files can be uploaded.'});
            return;
        }
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `chat-files/${chatId}/${Date.now()}_${file.name}`);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            await addDoc(collection(db, `chats/${chatId}/messages`), {
                text: `Image: ${file.name}`,
                type: 'image',
                fileURL: downloadURL,
                fileName: file.name,
                senderId: user.uid,
                senderInfo: {
                    username: userData.username,
                    photoURL: userData.photoURL,
                    role: isViewerMode ? (userData.isAdmin ? 'Admin' : 'Agent') : myRoleInfo.role,
                },
                timestamp: serverTimestamp(),
                seenBy: [user.uid]
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            setAlert({ isOpen: true, title: 'Upload Failed', message: 'Could not upload the file. Please try again.'});
        } finally {
            setIsUploading(false);
        }
    };
    
    const handlePayToEscrow = () => handleActionWithSystemMessage(
        (batch) => batch.update(doc(db, "chats", chatId), { status: 'payment_pending_confirmation' }),
        `${userData.username} (Buyer) has marked the payment as complete. An agent will verify it shortly.`
    );

    const handleServiceReceived = () => handleActionWithSystemMessage(
        (batch) => {
            const chatRef = doc(db, "chats", chatId);
            batch.update(chatRef, { status: 'closed', closedAt: serverTimestamp() });
            chat.participants.forEach(pId => {
                if (!chat.participantInfo[pId]?.isAgent) {
                     batch.update(doc(db, "users", pId), { dealsCompleted: increment(1) });
                }
            });
        },
        `The Buyer confirmed satisfactory receipt of the goods/service. This deal is now closed. Funds will be released to the Seller.`
    );
    
    const handleRaiseDispute = () => handleActionWithSystemMessage(
        (batch) => batch.update(doc(db, "chats", chatId), { status: 'disputed' }),
        `${userData.username} has raised a dispute. The case is now locked. An agent will be assigned to review the situation.`
    );
    
    const handleRatePartner = async (rating) => {
        setRatingModalOpen(false);
        if (rating === 0 || !otherParticipantId || chat.ratedBy?.includes(user.uid)) return;
        try {
            const otherUserRef = doc(db, "users", otherParticipantId);
            await runTransaction(db, async (transaction) => {
                const otherUserDoc = await transaction.get(otherUserRef);
                if (!otherUserDoc.exists()) throw new Error("Partner not found.");

                const currentScore = otherUserDoc.data().trustScore || 5;
                const totalRatings = otherUserDoc.data().totalRatings || 0;
                const newTotalRatings = totalRatings + 1;
                const newScore = ((currentScore * totalRatings) + rating) / newTotalRatings;
                
                transaction.update(otherUserRef, {
                    trustScore: newScore,
                    totalRatings: newTotalRatings,
                });
                transaction.update(doc(db, "chats", chatId), {
                    ratedBy: arrayUnion(user.uid)
                });
            });
            setAlert({ isOpen: true, title: 'Thank You!', message: 'Your rating has been submitted successfully.' });
        } catch (error) {
            console.error("Error submitting rating:", error);
            setAlert({ isOpen: true, title: 'Error', message: 'Could not submit your rating.' });
        }
    };

    return (
        <>
             <div className="flex flex-col w-full h-full bg-[#0f172a]">
                <header className="bg-[#1e293b] p-4 border-b border-slate-800 flex justify-between items-center z-10 shrink-0 gap-4">
                    <div className="flex-1 truncate">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white truncate">{chat.purpose}</h2>
                            <p className="font-bold text-lg text-white flex items-center shrink-0 ml-4">
                                <IndianRupee size={16}/>{(chat.price || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs mt-1">
                            <p className="text-slate-400 dark:text-slate-400">ID: <code className="font-mono">{chat.humanReadableId}</code></p>
                            {otherParticipantInfo && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-slate-400 dark:text-slate-400">|</span>
                                    <span className="font-semibold text-slate-300">With: {otherParticipantInfo.username}</span>
                                    {otherUserOnlineStatus ? (
                                        <span className="flex items-center gap-1.5 text-green-400">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Online
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                            Offline
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {chat.status === 'pending_invite' && !isViewerMode && (
                        <button onClick={() => {
                            const link = `${window.location.origin}/join/${chatId}`;
                            navigator.clipboard.writeText(link)
                            .then(() => setAlert({ isOpen: true, title: 'Success!', message: 'Invite link copied to clipboard!' }))
                            .catch(() => setAlert({ isOpen: true, title: 'Error', message: 'Could not copy link.' }));
                        }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shrink-0">
                            <Copy size={16}/> Copy Invite
                        </button>
                    )}
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg mb-4 text-center text-sm">
                        <p className="text-slate-300">
                            <strong>Payment Information:</strong> For security, official payment details (UPI/Binance ID) will be posted here by an agent or admin.
                            <br/> <strong className="text-yellow-400">Never pay a seller directly.</strong>
                        </p>
                        <p className="font-mono text-lg text-white mt-2">UPI: <span className="text-green-400">geyanchand@ybl</span></p>
                        <p className="font-mono text-lg text-white">Binance ID: <span className="text-green-400">17525121872</span></p>
                    </div>
                    {messages.map(msg => {
                        if (msg.type === 'system') return (
                            <div key={msg.id} className="text-center my-3"><span className="text-xs text-slate-400 dark:text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full italic">{msg.text}</span></div>
                        );
                        if (msg.type === 'image') {
                            const senderInfo = msg.senderInfo;
                            const isMe = msg.senderId === user.uid;
                            const alignmentClass = isMe ? "justify-end" : "justify-start";
                            const senderNameClass = "text-slate-400 dark:text-slate-400";
                            return (
                                <div key={msg.id} className={`flex items-end gap-3 my-4 ${alignmentClass}`}>
                                    {!isMe && <img src={senderInfo.photoURL} alt={senderInfo.username} className="w-8 h-8 rounded-full object-cover shrink-0" />}
                                    <div className={`max-w-xs`}>
                                        <p className={`text-xs font-semibold ${senderNameClass} ${isMe ? 'text-right' : 'text-left'} mb-1`}>{isMe ? 'You' : senderInfo.username}</p>
                                        <a href={msg.fileURL} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-700 rounded-lg">
                                            <img src={msg.fileURL} alt={msg.fileName || 'Uploaded image'} className="max-w-full h-auto rounded-md" />
                                        </a>
                                    </div>
                                </div>
                            );
                        }
                        const senderInfo = msg.senderInfo;
                        if (!senderInfo) return null;
                        
                        const isMe = msg.senderId === user.uid;
                        const isAgentMsg = senderInfo.role === 'Agent';
                        const isAdminMsg = senderInfo.role === 'Admin';
                        
                        const messageClass = isMe ? "bg-blue-600 text-white" : "bg-[#2f3b54] text-slate-200";
                        const alignmentClass = isMe ? "justify-end" : "justify-start";
                        const senderNameClass = isAgentMsg ? "text-yellow-400" : (isAdminMsg ? "text-red-400" : "text-slate-400 dark:text-slate-400");
                        
                        return (
                            <div key={msg.id} className={`flex items-end gap-3 my-4 ${alignmentClass}`}>
                                {!isMe && senderInfo.photoURL && <img src={senderInfo.photoURL} alt={senderInfo.username} className="w-8 h-8 rounded-full object-cover shrink-0" />}
                                <div className={`max-w-md lg:max-w-lg ${isMe && 'flex flex-col items-end'}`}>
                                    <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <p className={`text-xs font-semibold ${senderNameClass}`}>{isMe ? 'You' : senderInfo.username}</p>
                                        {isAgentMsg && <UserCog size={12} className="text-yellow-500"/>}
                                        {isAdminMsg && <Shield size={12} className="text-red-500"/>}
                                    </div>
                                    <p className={`px-4 py-2 rounded-xl mt-1 break-words ${messageClass}`}>{msg.text}</p>
                                    <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <span className="w-4 h-4 flex items-center justify-center">
                                            {isMe && lastSeenMessageId === msg.id && <Eye size={14} className="text-blue-400"/>}
                                        </span>
                                        <p className="text-xs text-slate-500">{formatTimestamp(msg.timestamp)}</p>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${isAgentMsg ? 'bg-yellow-500/20 text-yellow-300' : isAdminMsg ? 'bg-red-500/20 text-red-300' : senderInfo.role === 'Buyer' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                            {senderInfo.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}



{/* This block handles rendering the typing indicator */}
{Object.keys(activeTypers).length > 0 && (() => {
    
    // This is a much more robust function to get the name.
    const getTyperName = (typerId) => {
        // First, check if the typer is the currently logged-in agent/admin.
        // `userData` is always up-to-date for the current user.
        if (typerId === user.uid) {
            if (userData.isAgent) return "Agent";
            if (userData.isAdmin) return "Admin";
        }
        
        // If it's another user, look them up in the chat participant info.
        const participantInfo = chat.participantInfo[typerId];
        if (participantInfo) {
            if (participantInfo.role === 'Agent') return "Agent";
            if (participantInfo.role === 'Admin') return "Admin";
            // Return the username for regular users.
            return participantInfo.username;
        }

        // As a final fallback, if the user isn't found anywhere.
        return "Agent"; 
    };

    // Get an array of display names for all active typers.
    const typerNames = Object.keys(activeTypers).map(getTyperName);

    // Build the final display text.
    let displayText;
    if (typerNames.length === 1) {
        displayText = `${typerNames[0]} is typing...`;
    } else if (typerNames.length === 2) {
        displayText = `${typerNames[0]} and ${typerNames[1]} are typing...`;
    } else {
        displayText = `${typerNames[0]} and ${typerNames.length - 1} others are typing...`;
    }

    return (
        <div className="flex items-end gap-3 my-4 justify-start pl-11">
            <div className="max-w-md lg:max-w-lg">
                <div className="px-3 py-2.5 rounded-xl mt-1 bg-[#2f3b54] flex items-center gap-2">
                    {/* The Animation Dots (Unchanged and Correct) */}
                    <motion.div className="flex items-end gap-1.5">
                        <motion.span className="w-1.5 h-1.5 bg-blue-400 rounded-full" animate={{ y: ["0%", "-50%", "0%"] }} transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}/>
                        <motion.span className="w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ y: ["0%", "-50%", "0%"] }} transition={{ duration: 1, ease: "easeInOut", delay: 0.2, repeat: Infinity, repeatDelay: 0.5 }}/>
                    </motion.div>
                    
                    {/* The Corrected Text Display */}
                    <p className="text-sm text-slate-300 font-medium">
                        {displayText}
                    </p>
                </div>
            </div>
        </div>
    );
})()}


                {/* ------------------------------------ */}
                    <div ref={messagesEndRef} />
                </main>
                <footer className="bg-[#1e293b] p-4 border-t border-slate-800 space-y-3 shrink-0">
                    {!isViewerMode && !isDealFinished && myRoleInfo?.role === 'Buyer' && chat.status === 'awaiting_payment' && (
                        <div className='w-full text-center p-3 bg-slate-800/50 rounded-lg'>
                            <button onClick={handlePayToEscrow} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">I have Paid to DealSetu Account</button>
                        </div>
                    )}
                    {!isViewerMode && !isDealFinished && myRoleInfo?.role === 'Buyer' && chat.status === 'active' && (
                        <div className='w-full flex justify-center items-center gap-4'>
                          <button onClick={handleServiceReceived} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Service Received & Release Funds</button>
                          <button onClick={handleRaiseDispute} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Raise Dispute</button>
                        </div>
                    )}
                    {!isViewerMode && !isDealFinished && myRoleInfo?.role === 'Seller' && chat.status === 'active' && (
                        <div className='w-full text-center p-3 bg-slate-800/50 rounded-lg'>
                          <button onClick={handleRaiseDispute} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Raise Dispute</button>
                        </div>
                    )}
                    {canSendMessage ? (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-4">
                            <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="text-slate-400 dark:text-slate-400 hover:text-white p-2 disabled:opacity-50 disabled:cursor-wait" title="Attach an image">
                                {isUploading ? (<Loader2 size={24} className="animate-spin" />) : (<Paperclip size={24} />)}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                            <input
    type="text"
    value={newMessage}
    onChange={(e) => {
        setNewMessage(e.target.value);
        handleTyping();
    }}
    placeholder="Type a message..."
    className="flex-1 px-4 py-3 rounded-full bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
/>
                            <button type="submit" disabled={!newMessage.trim() || isUploading} className="bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-slate-600 text-white p-3 rounded-full shrink-0">
                                <Send size={20} />
                            </button>
                        </form>
                    ) : (
                        <div className="text-center p-2 bg-slate-800 rounded-full text-sm text-slate-400 dark:text-slate-400">This chat is closed. No new messages can be sent.</div>
                    )}
                </footer>
                {isViewerMode && <AgentControls chat={chat} chatId={chatId} agentOrAdminData={userData} />}
            </div>
            <PostDealModal isOpen={isRatingModalOpen} onRate={handleRatePartner} otherUserName={otherParticipantInfo?.username || 'the other party'} />
            <CustomAlertModal isOpen={alert.isOpen} onClose={() => setAlert({ isOpen: false, title: '', message: '' })} title={alert.title} message={alert.message} />
        </>
    );
};

const StaticPage = ({ pageTitle, sections }) => (
    <div className="flex-1 bg-[#0f172a] text-white p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">{pageTitle}</h1>
            <div className="space-y-8">{sections.map((section, index) => (
                <section key={index} className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">{section.title}</h2>
                    <pre className="whitespace-pre-wrap font-sans text-slate-300">{section.content}</pre>
                </section>))}
            </div>
        </div>
    </div>
);

const AdminSidebar = ({ onLogout }) => (
    <div className="w-[60px] md:w-[280px] bg-[#0c111d] h-full flex flex-col p-3 md:p-5 border-r border-slate-800 shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
            <Shield size={32} className="text-red-500 shrink-0" />
            <h1 className="text-2xl font-bold text-white tracking-wider hidden md:block">Admin Panel</h1>
        </div>
        <nav className="flex-grow flex flex-col gap-2">
            {[
                { icon: BarChart2, name: 'Dashboard', path: '/admin/dashboard' },
                { icon: User, name: 'Users', path: '/admin/users' },
                { icon: Briefcase, name: 'Deals', path: '/admin/deals' },
                { icon: UserCog, name: 'Agent Stats', path: '/admin/agent-stats' },
            ].map(item => (
                <NavLink key={item.name} to={item.path} end className={({ isActive }) => `flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 ${isActive ? 'bg-red-900/50 text-white shadow-inner border border-red-700' : 'border border-transparent'}`}>
                    <item.icon size={20} className="shrink-0"/>
                    <span className="font-semibold hidden md:block">{item.name}</span>
                </NavLink>
            ))}
        </nav>
        <div className="mt-auto space-y-4">
            <Link to="/" className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-400 dark:text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200">
                <ChevronLeft size={20} className="shrink-0"/>
                <span className="font-semibold hidden md:block">Back to App</span>
            </Link>
            <button onClick={onLogout} title="Logout" className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-400 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200">
                <LogOut size={20} className="shrink-0"/>
                <span className="font-semibold hidden md:block">Logout</span>
            </button>
        </div>
    </div>
);

const AdminLayout = ({ user, userData, onLogout }) => {
    if (!user || !userData?.isAdmin) return <Navigate to="/" replace />;
    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans">
            <AdminSidebar onLogout={onLogout} />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
               <Outlet />
            </main>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, agents: 0, activeDeals: 0, closedDeals: 0, disputedDeals: 0 });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const q = query(collection(db, 'chats'));
        const unsubscribe = onSnapshot(q, (chatsSnapshot) => {
            let active = 0, closed = 0, disputed = 0;
            chatsSnapshot.forEach(doc => {
                const status = doc.data().status;
                if (status === 'closed' || status === 'dispute_resolved') closed++;
                else if (status === 'disputed') disputed++;
                else active++;
            });
            Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(query(collection(db, 'users'), where('isAgent', '==', true)))
            ]).then(([usersSnapshot, agentsSnapshot]) => {
                 setStats({
                    users: usersSnapshot.size,
                    agents: agentsSnapshot.size,
                    activeDeals: active,
                    closedDeals: closed,
                    disputedDeals: disputed
                });
                setLoading(false);
            })
        });
        return () => unsubscribe();
    }, []);
    const AdminStatCard = ({ icon, title, value, colorClass }) => (
        <div className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className={`mb-4 inline-block p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <p className="text-slate-400 dark:text-slate-400 font-medium">{title}</p>
            <h3 className="text-4xl font-bold text-white mt-1">{loading ? <Loader2 className="animate-spin" size={30} /> : value}</h3>
        </div>
    );
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <AdminStatCard title="Total Users" value={stats.users} icon={<User size={24} />} colorClass="bg-blue-500/20 text-blue-300" />
                <AdminStatCard title="Agents" value={stats.agents} icon={<UserCog size={24} />} colorClass="bg-yellow-500/20 text-yellow-300" />
                <AdminStatCard title="Active Deals" value={stats.activeDeals} icon={<Activity size={24} />} colorClass="bg-green-500/20 text-green-300" />
                <AdminStatCard title="Disputed Deals" value={stats.disputedDeals} icon={<AlertCircle size={24} />} colorClass="bg-red-500/20 text-red-300" />
                <AdminStatCard title="Completed Deals" value={stats.closedDeals} icon={<CheckCircle size={24} />} colorClass="bg-purple-500/20 text-purple-300" />
            </div>
        </div>
    );
};

const AdminDeals = ({ isAgentView = false }) => {
    const [allDeals, setAllDeals] = useState([]);
    const [filteredDeals, setFilteredDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const q = query(collection(db, "chats"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAllDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        let tempDeals = allDeals;
        if (searchTerm) {
            tempDeals = tempDeals.filter(deal =>
                deal.humanReadableId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== "all") {
            tempDeals = tempDeals.filter(deal => deal.status === statusFilter);
        }
        setFilteredDeals(tempDeals);
    }, [searchTerm, statusFilter, allDeals]);

    const getStatusVisuals = (status) => {
        const base = 'px-2 py-1 rounded-full text-xs font-semibold capitalize';
        switch (status) {
            case 'closed': case 'dispute_resolved': return `${base} bg-green-500/20 text-green-300`;
            case 'disputed': return `${base} bg-red-500/20 text-red-300`;
            case 'active': case 'payment_pending_confirmation': return `${base} bg-blue-500/20 text-blue-300`;
            default: return `${base} bg-yellow-500/20 text-yellow-300`;
        }
    };
    
    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-4">Deal Management</h1>
            <p className="text-slate-400 dark:text-slate-400 mb-8">View and manage all ongoing and past deals.</p>
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 mb-6 flex flex-col md:flex-row items-center gap-4 shrink-0">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={20} />
                    <input type="text" placeholder="Search by Deal ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-auto p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Statuses</option>
                    <option value="pending_invite">Pending Invite</option>
                    <option value="awaiting_payment">Awaiting Payment</option>
                    <option value="payment_pending_confirmation">Pending Confirmation</option>
                    <option value="active">Active</option>
                    <option value="disputed">Disputed</option>
                    <option value="closed">Closed</option>
                    <option value="dispute_resolved">Dispute Resolved</option>
                </select>
            </div>
            <div className="overflow-y-auto flex-1 bg-[#1e293b]/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
                 <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-xs text-slate-400 dark:text-slate-400 uppercase sticky top-0 z-10">
                         <tr>
                            <th className="px-6 py-3">Deal</th>
                            <th className="px-6 py-3">Participants</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Created</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                         </tr>
                    </thead>
                    <tbody>
                         {loading ? (
                            <tr><td colSpan="6" className="text-center p-8"><Loader2 className="animate-spin inline-block"/></td></tr>
                        ) : filteredDeals.length > 0 ? (
                           filteredDeals.map(deal => {
                            const dealParticipants = Object.values(deal.participantInfo || {}).filter(p => !p.isAgent).map(p => p.username).join(', ');
                            return (
                                <tr key={deal.id} className="border-b border-slate-800 hover:bg-slate-700/30">
                                    <td className="px-6 py-4"><p className="font-bold text-white">{deal.purpose}</p><p className="text-xs text-slate-400 dark:text-slate-400 font-mono">{deal.humanReadableId}</p></td>
                                    <td className="px-6 py-4">{dealParticipants || 'N/A'}</td>
                                    <td className="px-6 py-4 font-mono text-white">₹{(deal.price || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4"><span className={getStatusVisuals(deal.status)}>{deal.status.replace(/_/g, ' ')}</span></td>
                                    <td className="px-6 py-4">{formatDate(deal.createdAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`${isAgentView ? '/agent' : '/admin'}/deals/view/${deal.id}`} className="inline-flex items-center justify-end gap-2 font-medium text-blue-400 hover:underline">
                                            <Eye size={16}/> View Chat
                                        </Link>
                                    </td>
                                </tr>
                            )
                           })
                        ) : (
                             <tr><td colSpan="6" className="text-center p-8">No deals found.</td></tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
    );
};

const AgentSidebar = ({ onLogout, userData }) => (
    <div className="w-[60px] md:w-[280px] bg-[#0c111d] h-full flex flex-col p-3 md:p-5 border-r border-slate-800 shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
            <UserCog size={32} className="text-yellow-500 shrink-0" />
            <h1 className="text-2xl font-bold text-white tracking-wider hidden md:block">Agent Panel</h1>
        </div>
        <nav className="flex-grow flex flex-col gap-2">
            <NavLink to="/agent/dashboard" end className={({ isActive }) => `flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-300 hover:bg-slate-700/50 ${isActive ? 'bg-yellow-900/50 text-white' : 'border-transparent'}`}><BarChart2 size={20} /><span className="font-semibold hidden md:block">Dashboard</span></NavLink>
            <NavLink to="/agent/deals" end className={({ isActive }) => `flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-300 hover:bg-slate-700/50 ${isActive ? 'bg-yellow-900/50 text-white' : 'border-transparent'}`}><Briefcase size={20} /><span className="font-semibold hidden md:block">All Deals</span></NavLink>
        </nav>
        <div className="mt-auto space-y-4">
            <div className="text-center md:text-left p-2">
                <img src={userData?.photoURL} className="w-8 h-8 rounded-full inline-block object-cover"/>
                <p className="hidden md:inline-block ml-2 text-sm font-semibold">@{userData?.username}</p>
            </div>
             <Link to="/" className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-400 dark:text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200"><ChevronLeft size={20}/><span className="font-semibold hidden md:block">Back to App</span></Link>
            <button onClick={onLogout} title="Logout" className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-lg text-slate-400 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"><LogOut size={20}/><span className="font-semibold hidden md:block">Logout</span></button>
        </div>
    </div>
);

const AgentLayout = ({ user, userData, onLogout }) => {
    if (!user || !userData?.isAgent) return <Navigate to="/" replace />;
    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans">
            <AgentSidebar onLogout={onLogout} userData={userData} />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto"><Outlet /></main>
        </div>
    );
};

const AgentDashboard = ({ userData }) => {
    const [stats, setStats] = useState({ closedDeals: 0, earnings: 0 });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!userData?.uid) return;
        const q = query(collection(db, "chats"), where("closedByAgent", "==", userData.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let totalEarnings = 0;
            snapshot.docs.forEach(doc => {
                const dealPrice = doc.data().price || 0;
                totalEarnings += dealPrice * 0.02; 
            });
            setStats({
                closedDeals: snapshot.size,
                earnings: totalEarnings,
            });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userData]);
    
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <p className="text-slate-400 dark:text-slate-400 font-medium">Disputes Resolved</p>
                <h3 className="text-4xl font-bold text-white mt-1">{loading ? <Loader2 className="animate-spin" /> : stats.closedDeals}</h3>
            </div>
            <div className="bg-[#1e293b]/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <p className="text-slate-400 dark:text-slate-400 font-medium">Total Commission Earned</p>
                <h3 className="text-4xl font-bold text-white mt-1 flex items-center gap-1">
                    <IndianRupee />
                    {loading ? <Loader2 className="animate-spin" /> : stats.earnings.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                </h3>
            </div>
        </div>
      </div>
    );
};

const AgentControls = ({ chat, chatId, agentOrAdminData }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCloseModalOpen, setCloseModalOpen] = useState(false);

    const assignedAgentId = Object.keys(chat.participantInfo || {}).find(id => chat.participantInfo[id].role === 'Agent');
    const hasPermission = agentOrAdminData.isAdmin || (agentOrAdminData.isAgent && (!assignedAgentId || agentOrAdminData.uid === assignedAgentId));
    
    const getParticipant = (role) => {
        const id = Object.keys(chat.participantInfo || {}).find(key => chat.participantInfo[key].role === role);
        if (!id) return null;
        return { id, ...chat.participantInfo[id] };
    };
    const buyer = getParticipant('Buyer');
    const seller = getParticipant('Seller');
    
    const handleControlAction = async (updateData, successMessage) => {
        setIsUpdating(true);
        try {
            const batch = writeBatch(db);
            const chatRef = doc(db, 'chats', chatId);
            batch.update(chatRef, { ...updateData, lastActionBy: agentOrAdminData.uid, closedByAgent: agentOrAdminData.uid });
            await sendSystemMessage(chatId, successMessage, batch);
            await batch.commit();
        } catch (error) {
            console.error("Agent control action failed:", error);
            alert("Action failed. See console for details.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleJoinDispute = async () => {
        setIsUpdating(true);
        try {
            const chatRef = doc(db, 'chats', chatId);
            await runTransaction(db, async (transaction) => {
                const chatDoc = await transaction.get(chatRef);
                if (!chatDoc.exists()) throw new Error("Chat not found");
                const currentParticipants = chatDoc.data().participantInfo;
                if (Object.values(currentParticipants).some(p => p.role === 'Agent')) {
                    throw new Error("Another agent has already joined this dispute.");
                }
                const agentInfo = { username: agentOrAdminData.username, role: 'Agent', photoURL: agentOrAdminData.photoURL };
                transaction.update(chatRef, { participants: arrayUnion(agentOrAdminData.uid), [`participantInfo.${agentOrAdminData.uid}`]: agentInfo });
                await sendSystemMessage(chatId, `@${agentOrAdminData.username} has joined the chat to mediate this dispute.`, transaction);
            });
        } catch(err) {
            alert(err.message || "Could not join dispute.");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleModalCloseAction = (closeStatus) => {
        const successMessage = closeStatus === 'closed' 
            ? `Admin/Agent has marked the deal as successfully completed.`
            : `Admin/Agent has cancelled this deal.`;

        const updateData = { status: closeStatus, closedAt: serverTimestamp() };
        handleControlAction(updateData, successMessage);
        
        if (closeStatus === 'closed') {
             const batch = writeBatch(db);
             if(buyer?.id) batch.update(doc(db, "users", buyer.id), { dealsCompleted: increment(1) });
             if(seller?.id) batch.update(doc(db, "users", seller.id), { dealsCompleted: increment(1) });
             batch.commit().catch(e => console.error("Failed to increment deals completed count:", e));
        }
        setCloseModalOpen(false);
    };

    const handleSuspendUser = async (participant) => {
        if (!participant || !window.confirm(`Are you sure you want to SUSPEND user @${participant.username}? Their account will be restricted.`)) return;
        setIsUpdating(true);
        try {
            await updateDoc(doc(db, 'users', participant.id), { status: 'suspended' });
            await sendSystemMessage(chatId, `Admin/Agent has suspended user @${participant.username}. Their account is now restricted.`);
        } catch (error) { console.error("Suspend user failed:", error); alert("Could not suspend user."); } 
        finally { setIsUpdating(false); }
    };

    const handleReopenChat = () => {
        if (!window.confirm("Are you sure you want to re-open this chat? The status will be set to 'Active'.")) return;
        handleControlAction({ status: 'active' }, `Admin/Agent has re-opened the chat for further discussion.`);
    };

    if (!chat || !hasPermission) return null;
    const isDealFinished = ['closed', 'cancelled', 'dispute_resolved'].includes(chat.status);

    if (!assignedAgentId && chat.status === 'disputed' && agentOrAdminData.isAgent) {
        return (
             <div className="bg-slate-900 p-4 border-t-2 border-yellow-500 text-white shrink-0">
                <h3 className="text-lg font-bold text-center mb-4 text-yellow-400">Mediation Required</h3>
                <div className="flex justify-center"><button onClick={handleJoinDispute} disabled={isUpdating} className="bg-yellow-600 hover:bg-yellow-700 font-bold p-2 rounded-lg">{isUpdating ? "Joining..." : "Join & Mediate Dispute"}</button></div>
             </div>
        )
    }

    return (
        <>
            <div className="bg-slate-900 p-4 border-t-2 border-red-500 text-white shrink-0">
                <h3 className="text-lg font-bold text-center mb-4 text-red-400">Moderator Controls</h3>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {chat.status === 'payment_pending_confirmation' && <button onClick={() => handleControlAction({status: 'active'}, 'Agent has confirmed payment.')} disabled={isUpdating} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-3 rounded-lg text-sm">Confirm Payment</button>}
                    {chat.status === 'disputed' && (
                        <>
                            <button onClick={() => handleControlAction({ status: 'dispute_resolved', winner: 'Buyer' }, `Dispute resolved in favor of the Buyer, @${buyer?.username}.`)} disabled={isUpdating} className="bg-blue-700 hover:bg-blue-600 font-bold py-2 px-3 rounded-lg text-sm">Rule for Buyer</button>
                            <button onClick={() => handleControlAction({ status: 'dispute_resolved', winner: 'Seller' }, `Dispute resolved in favor of the Seller, @${seller?.username}.`)} disabled={isUpdating} className="bg-purple-700 hover:bg-purple-600 font-bold py-2 px-3 rounded-lg text-sm">Rule for Seller</button>
                        </>
                    )}
                    {((chat.status === 'active' && agentOrAdminData.isAgent) || agentOrAdminData.isAdmin) && !isDealFinished && <button onClick={() => setCloseModalOpen(true)} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-3 rounded-lg text-sm">Close Deal...</button>}
                    {isDealFinished && <button onClick={handleReopenChat} disabled={isUpdating} className="bg-yellow-600 hover:bg-yellow-700 font-bold py-2 px-3 rounded-lg text-sm">Re-Open Chat</button>}
                </div>
                {!isDealFinished && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap items-center justify-center gap-3">
                        {buyer && <button onClick={() => handleSuspendUser(buyer)} disabled={isUpdating} className="bg-red-900 hover:bg-red-800 text-xs font-bold py-1 px-3 rounded-full">Suspend Buyer</button>}
                        {seller && <button onClick={() => handleSuspendUser(seller)} disabled={isUpdating} className="bg-red-900 hover:bg-red-800 text-xs font-bold py-1 px-3 rounded-full">Suspend Seller</button>}
                    </div>
                )}
            </div>
            <Modal isOpen={isCloseModalOpen} onClose={() => setCloseModalOpen(false)} title="Close or Cancel Deal">
                <p className="text-slate-300 mb-6">Choose the outcome for this deal. This action is irreversible.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={() => handleModalCloseAction('closed')} className="w-full bg-green-600 hover:bg-green-700 font-bold py-3 px-4 rounded-lg">Mark as Done (Successful)</button>
                    <button onClick={() => handleModalCloseAction('cancelled')} className="w-full bg-slate-600 hover:bg-slate-700 font-bold py-3 px-4 rounded-lg">Mark as Unsuccessful (Cancel)</button>
                </div>
            </Modal>
        </>
    );
};

const UserDetailsModal = ({ isOpen, onClose, user, onUpdate }) => {
    if (!user) return null;
    const [loading, setLoading] = useState(false);
    const handleToggleStatus = async () => {
        setLoading(true);
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        try {
            await updateDoc(doc(db, 'users', user.uid), { status: newStatus });
            onUpdate({ ...user, status: newStatus });
            onClose();
        } catch (error) {
            console.error(`Error updating user status for ${user.uid}:`, error);
        } finally {
            setLoading(false);
        }
    };
    const handleToggleAgent = async () => {
        setLoading(true);
        const newIsAgent = !user.isAgent;
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, 'users', user.uid), { isAgent: newIsAgent });
            const agentRef = doc(db, 'agents', user.uid);
            if (newIsAgent) {
                batch.set(agentRef, { uid: user.uid, username: user.username, fullName: user.fullName, photoURL: user.photoURL });
            } else {
                batch.delete(agentRef);
            }
            await batch.commit();
            onUpdate({ ...user, isAgent: newIsAgent });
            onClose();
        } catch (error) {
            console.error(`Error toggling agent status for ${user.uid}:`, error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`User: @${user.username}`}>
            <div className="space-y-4 text-slate-300">
                <div className="flex items-center gap-4">
                    <img src={user.photoURL} alt={user.username} className="w-16 h-16 rounded-full object-cover"/>
                    <div>
                        <h4 className="text-xl font-bold text-white">{user.fullName}</h4>
                        <p className="text-sm">{user.email}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg grid grid-cols-2 gap-4">
                    <p className={`capitalize font-semibold flex items-center gap-1.5 ${user.isOnline ? 'text-green-400' : 'text-slate-500'}`}><span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-slate-500'}`}></span>{user.isOnline ? 'Online' : 'Offline'}</p>
                    <p className={`capitalize font-semibold ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{user.status}</p>
                    <p className={`capitalize font-semibold ${user.isAgent ? 'text-blue-400' : 'text-slate-200'}`}>{user.isAgent ? 'Agent' : 'User'}</p>
                    <p className="capitalize">{user.verificationStatus || 'unverified'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    <button onClick={handleToggleStatus} disabled={loading} className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg font-bold transition-colors ${user.status === 'active' ? 'bg-red-800' : 'bg-green-700'}`}>{loading ? <Loader2 className="animate-spin" /> : (user.status === 'active' ? <><UserX size={16}/> Suspend</> : <><UserCheck size={16}/> Activate</>)}</button>
                    <button onClick={handleToggleAgent} disabled={loading} className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg font-bold transition-colors ${user.isAgent ? 'bg-yellow-800' : 'bg-blue-700'}`}>{loading ? <Loader2 className="animate-spin" /> : (user.isAgent ? 'Demote Agent' : <><UserPlus size={16}/> Promote</>)}</button>
                </div>
            </div>
        </Modal>
    );
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let tempUsers = users;
        if (searchTerm) { tempUsers = tempUsers.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())); }
        if (statusFilter !== "all") { tempUsers = tempUsers.filter(u => u.status === statusFilter); }
        if (roleFilter !== "all") { tempUsers = tempUsers.filter(u => roleFilter === 'agent' ? u.isAgent : !u.isAgent); }
        setFilteredUsers(tempUsers);
    }, [searchTerm, statusFilter, roleFilter, users]);

    const handleViewUser = (user) => { setSelectedUser(user); setModalOpen(true); };
    const handleUpdateUserInList = (updatedUser) => setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-4">User & Agent Management</h1>
            <p className="text-slate-400 dark:text-slate-400 mb-8">View, manage, suspend, and promote users.</p>
            <div className="bg-[#1e293b]/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 mb-6 flex flex-col md:flex-row items-center gap-4 shrink-0">
                <div className="relative w-full md:w-1/2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={20} /><input type="text" placeholder="Search by username, name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="flex items-center gap-2 w-full md:w-auto"><Filter size={18} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600"><option value="all">All Statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600"><option value="all">All Roles</option><option value="user">Users</option><option value="agent">Agents</option></select></div>
            </div>
            <div className="overflow-y-auto flex-1 bg-[#1e293b]/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-xs text-slate-400 dark:text-slate-400 uppercase sticky top-0 z-10"><tr><th className="px-6 py-3">User</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Joined</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="5" className="text-center p-8"><Loader2 className="animate-spin inline-block"/></td></tr>) : filteredUsers.map(user => (
                            <tr key={user.uid} className="border-b border-slate-800 hover:bg-slate-700/30">
                                <td className="px-6 py-4 flex items-center gap-3"><img src={user.photoURL} alt={user.username} className="w-10 h-10 rounded-full object-cover"/><div><p className="font-bold text-white">@{user.username || 'N/A'}</p><p className="text-slate-400 dark:text-slate-400">{user.email}</p></div></td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isAgent ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-600 text-slate-300'}`}>{user.isAgent ? 'Agent' : 'User'}</span></td>
                                <td className="px-6 py-4"><span className={`flex items-center gap-1.5 font-bold ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}><div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>{user.status}</span></td>
                                <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                                <td className="px-6 py-4 text-right"><button onClick={() => handleViewUser(user)} className="font-medium text-blue-400 hover:underline">Manage</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UserDetailsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} user={selectedUser} onUpdate={handleUpdateUserInList}/>}
        </div>
    );
};

const AdminAgentStats = () => {
    const [agentsWithStats, setAgentsWithStats] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const agentQuery = query(collection(db, 'users'), where('isAgent', '==', true));
        const unsubscribe = onSnapshot(agentQuery, async (agentSnapshot) => {
            const agentsData = agentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (agentsData.length === 0) {
                setAgentsWithStats([]);
                setLoading(false);
                return;
            }
            const dealsSnapshot = await getDocs(collection(db, "chats"));
            const stats = {};
            dealsSnapshot.forEach(doc => {
                const deal = doc.data();
                if (deal.closedByAgent) {
                    if (!stats[deal.closedByAgent]) stats[deal.closedByAgent] = { deals: 0, earnings: 0 };
                    stats[deal.closedByAgent].deals++;
                    stats[deal.closedByAgent].earnings += (deal.price || 0) * 0.02;
                }
            });
            const combinedData = agentsData.map(agent => ({ ...agent, ...stats[agent.id] || { deals: 0, earnings: 0 } }));
            setAgentsWithStats(combinedData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-4">Agent Performance</h1>
            <div className="overflow-x-auto bg-[#1e293b]/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-xs text-slate-400 dark:text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-3">Agent</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Disputes Resolved</th>
                            <th className="px-6 py-3">Total Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                          <tr><td colSpan="4" className="text-center p-8"><Loader2 className="animate-spin inline-block"/></td></tr>
                        ) : agentsWithStats.length > 0 ? agentsWithStats.map(agent => (
                            <tr key={agent.id} className="border-b border-slate-800">
                                <td className="px-6 py-4 flex items-center gap-3"><img src={agent.photoURL} className="w-8 h-8 rounded-full"/><div><span>{agent.username}</span><span className="text-xs block text-slate-400 dark:text-slate-400">{agent.fullName}</span></div></td>
                                <td className="px-6 py-4"><span className={`flex items-center gap-1.5 ${agent.isOnline ? 'text-green-400' : 'text-slate-500'}`}><span className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-green-400' : 'bg-slate-500'}`}></span>{agent.isOnline ? 'Online' : 'Offline'}</span></td>
                                <td className="px-6 py-4 font-bold">{agent.deals}</td>
                                <td className="px-6 py-4 font-bold text-green-400">₹{agent.earnings.toLocaleString('en-IN')}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center p-8">No agents found. Promote users from the Users tab.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- PASTE THIS NEW COMPONENT BEFORE AppContent ---

// --- DELETE your old BottomNavBar and REPLACE it with this ---
const BottomNavBar = ({ onCreateDealClick }) => (
    // The main bar container has a higher z-index to be on top of everything
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-40"> 
        <div className="relative max-w-lg mx-auto h-full">
            
            {/* The centered "Create Deal" button is now part of the same component */}
           <button
                onClick={onCreateDealClick}
                className="absolute left-1/2 top-4 -translate-x-1/2 h-12 w-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 transition-transform hover:scale-110 z-10" // <-- THIS CLASS IS THE FIX
                aria-label="Create New Deal"
            >
                <Plus size={38} />
            </button>
            
            {/* The actual navigation bar is below the button */}
            <nav className="absolute bottom-0 h-16 w-full flex items-center justify-around bg-slate-900 border-t border-slate-700/50 rounded-t-xl">
                <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center w-1/5 h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                    <Home size={22} />
                    <span className="text-xs font-medium">Home</span>
                </NavLink>
                <NavLink to="/deals" className={({ isActive }) => `flex flex-col items-center justify-center w-1/5 h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                    <Briefcase size={22} />
                    <span className="text-xs font-monthdium">Deals</span>
                </NavLink>

                {/* This empty space is directly under the button for the "Create Deal" text label */}
                <div className="w-1/5 h-full flex items-center justify-end flex-col" style={{ paddingBottom: "0.8rem" }} >
                    <span className="text-xs font-medium text-slate-400">Create Deal</span>
                </div>
                
                <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center w-1/5 h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                    <User size={22} />
                    <span className="text-xs font-medium">Profile</span>
                </NavLink>
                <NavLink to="/help" className={({ isActive }) => `flex flex-col items-center justify-center w-1/5 h-full transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                    <HelpCircle size={22} />
                    <span className="text-xs font-medium">Help</span>
                </NavLink>
            </nav>
        </div>
    </div>
);

// --- PASTE THIS NEW COMPONENT BEFORE AppContent ---

// --- REPLACE WITH THIS ORIGINAL VERSION ---
const TopHeader = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-4 z-20 shadow-md">
        <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
            <h1 className="text-2xl font-bold text-white tracking-wider">
                Deal<span className="text-blue-400">Setu</span>
            </h1>
        </Link>
        <div className="flex items-center gap-4">
            <Search size={22} className="text-slate-400" />
            <Bell size={22} className="text-slate-400" />
        </div>
    </header>
);

// --- PASTE THIS NEW COMPONENT BEFORE AppContent ---
const ContactSupportScreen = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            alert("Please fill out both the subject and message.");
            return;
        }
        setIsSending(true);
        // This creates a mailto link which opens the user's default email client
        const mailtoLink = `mailto:help.dealsetu@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
        
        setTimeout(() => {
          setIsSending(false);
          alert("Your email client should have opened. Please send the email from there.");
        }, 1000);
    };

    return (
        <div className="p-4 sm:p-6 text-white">
            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Contact Support</h1>
                <p className="text-slate-400 dark:text-slate-400 mb-6">We're here to help. Send us your query, and our team will get back to you shortly.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-slate-300 text-sm font-bold mb-2">Subject</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Payment Verification Issue" className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-slate-300 text-sm font-bold mb-2">Message</label>
                        <textarea id="message" rows="6" value={message} onChange={e => setMessage(e.target.value)} placeholder="Please describe your issue in detail..." className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <button type="submit" disabled={isSending} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                        {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- PASTE THIS NEW COMPONENT BEFORE AppContent ---
const HelpScreen = () => {
    return (
        <div className="p-4 sm:p-6 text-white">
            <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
            <div className="space-y-3">
                <Link to="/contact-support" className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <Mail size={22} className="text-blue-400" />
                        <span className="font-semibold">Contact Support</span>
                    </div>
                    <ChevronLeft size={20} className="transform rotate-180" />
                </Link>
                <Link to="/legal" className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <FileText size={22} className="text-blue-400" />
                        <span className="font-semibold">Legal & Policies</span>
                    </div>
                    <ChevronLeft size={20} className="transform rotate-180" />
                </Link>
            </div>
        </div>
    );
};

// ================================================================
// --- AppContent: The Core Logic and Router ---
// ================================================================

function AppContent() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isDataReady, setIsDataReady] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [allUserChats, setAllUserChats] = useState([]);
    const [isCreateDealModalOpen, setCreateDealModalOpen] = useState(false);
    const [isCreatingDeal, setIsCreatingDeal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // --- AFTER ---
    const fetchUserData = useCallback(async (currentUser) => {
        if (!currentUser) {
            setUserData(null);
            return null;
        }

        // Retry logic: Try to fetch the document up to 3 times.
        for (let i = 0; i < 3; i++) {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = { uid: currentUser.uid, ...userDoc.data() };
                    setUserData(data); // Set the state
                    return data;       // And return the data to stop the loop
                }

                // If document doesn't exist, wait for 1 second before trying again.
                // This gives the signup function time to create the document.
                console.warn(`User document not found on attempt ${i + 1}. Retrying in 1 second...`);
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (e) {
                console.error("Failed to fetch user data", e);
                setUserData(null);
                return null; // Stop trying if a real error occurs
            }
        }
        
        // If the document is still not found after 3 attempts, log out the user.
        console.error("User document could not be found after multiple attempts. Logging out for safety.");
        handleLogout(); // handleLogout function already defined in your code
        return null;

    }, []); // Removed handleLogout from dependencies as it's stable
    const handleJoinChat = useCallback(async (chatId, currentUser, freshUserData) => {
        if (!freshUserData?.username) {
            alert("Your profile setup is incomplete. Cannot join deal.");
            navigate('/complete-profile', { replace: true });
            return;
        }
        try {
            const chatRef = doc(db, "chats", chatId);
            await runTransaction(db, async (transaction) => {
                const chatDoc = await transaction.get(chatRef);
                if (!chatDoc.exists()) throw new Error("This deal link is invalid or has expired.");
                const chatData = chatDoc.data();
                if (chatData.participants.includes(currentUser.uid)) return;
                const nonAgentParticipants = chatData.participants.filter(pId => chatData.participantInfo[pId] && !chatData.participantInfo[pId].isAgent);
                if (nonAgentParticipants.length >= 2) throw new Error("This deal is already full and cannot be joined.");
                const creatorRole = chatData.participantInfo[chatData.participants[0]]?.role;
                const joinerRole = creatorRole === 'Buyer' ? 'Seller' : 'Buyer';
                transaction.update(chatRef, { participants: arrayUnion(currentUser.uid), status: 'awaiting_payment', [`participantInfo.${currentUser.uid}`]: { username: freshUserData.username, role: joinerRole, photoURL: freshUserData.photoURL } });
                await sendSystemMessage(chatId, `@${freshUserData.username} has joined as the ${joinerRole}. The Buyer can now make the payment.`, transaction);
            });
            navigate(`/chat/${chatId}`, { replace: true });
        } catch (err) {
            alert(err.message);
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleLogout = async () => {
        if (user) {
            try { await updateDoc(doc(db, 'users', user.uid), { isOnline: false }); } catch (e) {}
        }
        await signOut(auth);
        navigate('/login', { replace: true });
    };
    
    const handleProfileUpdate = () => {
        if (auth.currentUser) fetchUserData(auth.currentUser);
    };
    
    const handleAgreeToTerms = async () => {
        if (!user) return;
        await updateDoc(doc(db, 'users', user.uid), { termsAgreed: true });
        await handleProfileUpdate();
        setShowNotesModal(true);
    };
    
    const handleCloseNotes = () => {
        setShowNotesModal(false);
        navigate(userData?.isAdmin ? '/admin' : (userData?.isAgent ? '/agent' : '/'), { replace: true });
    };
    
    const handleCreateDeal = async (dealData) => {
        if (!user || !userData) throw new Error("Authentication error.");
        setIsCreatingDeal(true);
        try {
            const newChatId = doc(collection(db, "chats")).id;
            const humanReadableId = await generateUniqueDealId();
            const batch = writeBatch(db);
            const chatRef = doc(db, 'chats', newChatId);
            batch.set(chatRef, { ...dealData, humanReadableId, createdAt: serverTimestamp(), participants: [user.uid], participantInfo: { [user.uid]: { username: userData.username, role: dealData.creatorRole, photoURL: userData.photoURL } }, status: 'pending_invite', ratedBy: [], });
            await sendSystemMessage(newChatId, `${userData.username} (${dealData.creatorRole}) created the deal. Use 'Copy Invite' to bring in the other party.`, batch);
            await batch.commit();
            navigate(`/chat/${newChatId}`);
            return true;
        } catch (error) {
            console.error("Error creating deal:", error);
            throw error;
        } finally {
            setIsCreatingDeal(false);
        }
    };

  // --- FIND AND REPLACE THE ENTIRE PRESENCE useEffect IN AppContent ---

    useEffect(() => {
        // This effect only runs if a user is logged in.
        if (!user) return;

        const rtdb = getDatabase(app);

        // --- PART A: REAL-TIME CONNECTION HANDLING (FOR TAB CLOSE/NETWORK LOSS) ---

        // We use the `.info/connected` path to monitor the client's connection state.
        const amOnlineRtdbRef = dbRef(rtdb, '.info/connected');
        
        // This is the user's permanent status location in RTDB.
        const userStatusRtdbRef = dbRef(rtdb, 'status/' + user.uid);
        
        // This is the reference to the user's document in Firestore.
        const userStatusFirestoreRef = doc(db, 'users', user.uid);
        
        const unsubscribe = onValue(amOnlineRtdbRef, (snapshot) => {
            if (snapshot.val() === false) {
                // If connection is lost, Firestore is our source of truth for 'last_seen'.
                updateDoc(userStatusFirestoreRef, { 
                    isOnline: false, 
                    last_seen: serverTimestamp() 
                });
                return;
            }

            // `onDisconnect` is a "last will" for abrupt closes.
            // If the tab is closed, we remove their status node from RTDB.
            onDisconnect(userStatusRtdbRef).remove();

            // Since the connection is live, we mark the user as online.
            // RTDB node simply shows `isOnline: true` for real-time listeners.
            set(userStatusRtdbRef, { isOnline: true });

            // Firestore gets a more detailed update for persistent state.
            updateDoc(userStatusFirestoreRef, { 
                isOnline: true, 
                last_seen: serverTimestamp() 
            });
        });

        
        // --- PART B: USER ACTIVITY TRACKER (FOR IN-APP "IDLE" STATUS) ---
        
        let activityTimer;

        // Function to call to reset the user's "idle" timer
        const resetActivityTimer = () => {
            // Clear any previous timer
            clearTimeout(activityTimer);
            
            // Mark the user as online in Firestore, since they just did something.
            // We can skip updating RTDB here as it should already be 'online'.
            updateDoc(userStatusFirestoreRef, { isOnline: true });

            // Set a new timer. If no activity happens for 5 seconds, mark them as offline.
            activityTimer = setTimeout(() => {
                // User is now considered "idle" or "offline" within the app.
                updateDoc(userStatusFirestoreRef, { 
                    isOnline: false,
                    last_seen: serverTimestamp()
                });
                // We also remove the RTDB status node for consistency.
                remove(userStatusRtdbRef);
            }, 5000); // 5000 milliseconds = 5 seconds
        };

        // Listen for user activity events on the window
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.addEventListener(event, resetActivityTimer);
        });
        
        // Initial call to start the timer when the component mounts.
        resetActivityTimer();

        // --- CLEANUP FUNCTION ---
        return () => {
            unsubscribe(); // Detach the `.info/connected` listener.
            
            // Remove all activity listeners to prevent memory leaks.
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetActivityTimer);
            });
            clearTimeout(activityTimer);

            if (auth.currentUser) {
                // On a clean logout, immediately mark as offline.
                updateDoc(userStatusFirestoreRef, { 
                    isOnline: false, 
                    last_seen: serverTimestamp() 
                });
                remove(userStatusRtdbRef);
            }
        };

    }, [user]);  // This entire advanced hook re-runs only when the user logs in or out.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setIsDataReady(false);
            setAuthLoading(true);
            if (currentUser) {
                setUser(currentUser);
                const freshUserData = await fetchUserData(currentUser);
                if (freshUserData) {
                    const joinMatch = location.pathname.match(/\/join\/(.+)/);
                    if (joinMatch) {
                        await handleJoinChat(joinMatch[1], currentUser, freshUserData);
                    }
                    setIsDataReady(true);
                }
            } else {
                setUser(null);
                setUserData(null);
                setAllUserChats([]);
                setIsDataReady(true);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [fetchUserData, handleJoinChat, location.pathname]);

    useEffect(() => {
        if (user && userData && !userData.isAdmin && !userData.isAgent) {
            const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => { setAllUserChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); });
            return () => unsubscribe();
        } else {
            setAllUserChats([]);
        }
    }, [user, userData]);

    

    if (authLoading || !isDataReady) {
        return <Spinner />;
    }

    
if (!user) {
    return (
        <Routes>
            {/* The new HomePage is now the main landing page */}
            <Route path="/" element={<HomePage />} /> 
            
            {/* The login/signup page remains the same */}
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/join/:chatId" element={<AuthScreen />} />
            
            {/* The legal page needs to be accessible even when logged out */}
            <Route path="/legal" element={<StaticPage pageTitle="Legal Information" sections={[{ title: 'Terms of Service', content: termsAndConditionsText }, { title: 'Privacy Policy', content: privacyPolicyText }]} />} />

            {/* Any other random URL will redirect to the new HomePage */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
    
    if (userData.status === 'suspended') {
        return (
            <div className="bg-red-900 text-white h-screen flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={48} className="mb-4" />
                <h1 className="text-3xl font-bold">Account Suspended</h1>
                <p className="mt-2">Please contact support for assistance.</p>
                <button onClick={handleLogout} className="mt-4 bg-white text-black font-bold py-2 px-4 rounded">Logout</button>
            </div>
        );
    }

    if (!userData.gender) {
        return (
            <Routes>
                <Route path="/setup-profile" element={<ProfileSetupScreen user={user} userData={userData} onSetupComplete={handleProfileUpdate} />} />
                <Route path="*" element={<Navigate to="/setup-profile" replace />} />
            </Routes>
        );
    }

    if (!userData.username) {
        return (
            <Routes>
                <Route path="/complete-profile" element={<CompleteProfileScreen user={user} userData={userData} onProfileComplete={handleProfileUpdate} />} />
                <Route path="*" element={<Navigate to="/complete-profile" replace />} />
            </Routes>
        );
    }
    
    if (!userData.termsAgreed) {
        return (
            <Routes>
                <Route path="/terms-and-conditions" element={<TermsAndConditionsScreen onAgree={handleAgreeToTerms} />} />
                <Route path="*" element={<Navigate to="/terms-and-conditions" replace />} />
            </Routes>
        );
    }

    // --- REPLACE YOUR ENTIRE AppContent RETURN BLOCK WITH THIS ---

    return (
        <div className="bg-[#0f172a] min-h-screen">
            <Routes>
                {/* --- Admin & Agent Routes (Unchanged and Correct) --- */}
                {/* They have their own layouts and don't need to be touched. */}
                <Route path="/admin/*" element={
                    userData.isAdmin ? ( <AdminLayout user={user} userData={userData} onLogout={handleLogout}><Outlet /></AdminLayout> ) : <Navigate to="/" replace />
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="deals" element={<AdminDeals />} />
                    <Route path="agent-stats" element={<AdminAgentStats />} />
                    {/* The chat screen for admins will also be fullscreen */}
                    <Route path="deals/view/:chatId" element={<ChatScreen user={user} userData={userData} />} />
                </Route>
                
                <Route path="/agent/*" element={
                    userData.isAgent ? ( <AgentLayout user={user} userData={userData} onLogout={handleLogout}><Outlet /></AgentLayout> ) : <Navigate to="/" replace />
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AgentDashboard userData={userData}/>} />
                    <Route path="deals" element={<AdminDeals isAgentView={true} />} />
                    {/* The chat screen for agents will also be fullscreen */}
                    <Route path="deals/view/:chatId" element={<ChatScreen user={user} userData={userData} />} />
                </Route>

                {/* --- THIS IS THE NEW, CORRECTED STRUCTURE FOR USERS --- */}

                {/* Route 1: For the Chat Screen ONLY */}
                {/* This route is now at the top level, OUTSIDE the MainLayout wrapper. */}
                {/* This ensures it takes up the full screen. */}
                <Route path="/chat/:chatId" element={<ChatScreen user={user} userData={userData} />} />

                {/* Route 2: For ALL OTHER user pages */}
                {/* This route is now wrapped by MainLayout, so all pages inside it will */}
                {/* have the TopHeader and BottomNavBar. */}
               <Route path="/*" element={
    !userData.isAdmin && !userData.isAgent 
        ? ( <MainLayout onCreateDealClick={() => setCreateDealModalOpen(true)}><Outlet /></MainLayout> ) 
        : <Navigate to={userData.isAdmin ? "/admin" : "/agent"} replace />
}>
                    {/* Index (Home) Page */}
                    <Route index element={<Dashboard userData={userData} allChats={allUserChats} />} />
                    
                    {/* All other pages that should have the main layout */}
                    <Route path="deals" element={<ActiveDealsScreen chats={allUserChats} userData={userData} />} />
                    <Route path="profile" element={<ProfileScreen user={user} userData={userData} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout} />} />
                    <Route path="verify" element={<VerificationScreen user={user} userData={userData} />} />
                    <Route path="legal" element={<StaticPage pageTitle="Legal Information" sections={[{ title: 'Terms of Service', content: termsAndConditionsText }, { title: 'Privacy Policy', content: privacyPolicyText }]} />} />
                    <Route path="help" element={<HelpScreen />} />
                    <Route path="contact-support" element={<ContactSupportScreen />} />

                    {/* A catch-all to redirect any other unknown path within this section back to the home page */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
            
            {/* The global modals remain unchanged at the end */}
            {userData && !userData.isAdmin && !userData.isAgent && userData.termsAgreed && (
              <>
                <ImportantNotesModal isOpen={showNotesModal} onClose={handleCloseNotes} />
                <CreateDealModal isOpen={isCreateDealModalOpen} onClose={() => setCreateDealModalOpen(false)} onCreateDeal={handleCreateDeal} userData={userData} />
              </>
            )}
        </div>
    );
}

const Root = () => (
    <BrowserRouter>
        <AppContent />
    </BrowserRouter>
);

export default Root;