import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    collection,
    query, 
    where,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';
import { Check, Shield, User, MessageSquare, Briefcase, IndianRupee, History, Copy, X, Star, Users, Link as LinkIcon, Paperclip } from 'lucide-react';

// --- Firebase Configuration ---
// Replace with your actual Firebase project keys.
const firebaseConfig = {
 apiKey: "AIzaSyD6GiujFIzxyI69A4YfkVI5Ig6A9Zufibo",
  authDomain: "escrow-app-14a36.firebaseapp.com",
  projectId: "escrow-app-14a36",
  storageBucket: "escrow-app-14a36.firebasestorage.app",
  messagingSenderId: "713662969444",
  appId: "1:713662969444:web:cd1b94118ff56d6201d171"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [page, setPage] = useState('home'); // 'home', 'chat', 'profile', 'history', 'auth', 'terms'
    const [activeChatId, setActiveChatId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser({ uid: currentUser.uid, ...userDocSnap.data() });
                } else {
                    setUser({ uid: currentUser.uid, email: currentUser.email, isNew: true });
                }
            } else {
                setUser(null);
            }
            setIsAuthReady(true);
        });
        
        // Handle invitation link on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const joinChatId = urlParams.get('joinChat');
        if (joinChatId) {
            sessionStorage.setItem('joinChatId', joinChatId);
            // Clear the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        return () => unsubscribe();
    }, []);
    
    // This effect runs when the user is authenticated
    useEffect(() => {
        if(user && !user.isNew) {
            const joinChatId = sessionStorage.getItem('joinChatId');
            if(joinChatId) {
                handleJoinChat(joinChatId);
            }
        }
    }, [user]);


    const handleJoinChat = async (chatId) => {
        if (!user || user.isNew) return; // Only join if logged in and not a new user
        
        const chatDocRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatDocRef);
        
        if (chatDoc.exists()) {
            // Add user to participants if not already there
             if (!chatDoc.data().participants.includes(user.uid)) {
                await updateDoc(chatDocRef, {
                    participants: arrayUnion(user.uid),
                    status: 'waiting_for_payment'
                });
                await sendMessageToChat(chatId, `${user.email} has joined the deal. The buyer can now proceed with the payment.`, 'System');
             }

            sessionStorage.removeItem('joinChatId');
            navigateTo('chat', chatId);
        }
    };


    const navigateTo = (targetPage, chatId = null) => {
        setPage(targetPage);
        if (chatId) {
            setActiveChatId(chatId);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setPage('auth');
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
    }
    
    if (user && user.isNew) {
         return <TermsAndConditions onAgree={() => {
            const userDocRef = doc(db, "users", user.uid);
            setDoc(userDocRef, { 
                email: user.email,
                createdAt: serverTimestamp(),
                trustScore: 100,
                verificationStatus: 'unverified'
            }, { merge: true }).then(() => {
                 // Update user state locally to remove 'isNew' flag
                 setUser(prev => ({...prev, isNew: false, trustScore: 100, verificationStatus: 'unverified'}));
                 // Now the useEffect for joining chat will trigger
            });
        }} />;
    }

    if (!user) {
        return <AuthScreen />;
    }
    
    const renderPage = () => {
        switch (page) {
            case 'chat':
                return <ChatRoom chatId={activeChatId} currentUser={user} navigateTo={navigateTo} />;
            case 'profile':
                return <ProfileScreen user={user} setUser={setUser} />;
            case 'history':
                return <TransactionHistory user={user} />;
            case 'terms':
                 return <TermsAndConditions onAgree={() => setPage('home')} />;
            case 'home':
            default:
                return <HomeScreen currentUser={user} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="h-screen w-full font-sans bg-gray-900 text-white flex flex-col md:flex-row">
            <Sidebar navigateTo={navigateTo} handleLogout={handleLogout} />
            <main className="flex-1 flex flex-col h-full overflow-y-auto">
                 {renderPage()}
            </main>
        </div>
    );
}

// --- Sidebar Navigation ---
const Sidebar = ({ navigateTo, handleLogout }) => {
    const navItems = [
        { icon: Briefcase, label: 'Deals', page: 'home' },
        { icon: User, label: 'Profile', page: 'profile' },
        { icon: History, label: 'History', page: 'history' },
    ];

    return (
        <nav className="bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 p-4 flex md:flex-col justify-around md:justify-between items-center">
            <div>
                 <a href="#" onClick={() => navigateTo('home')} className="flex items-center gap-2 mb-10">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <span className="text-xl font-bold hidden md:inline">Escrow</span>
                 </a>
                <ul className="flex md:flex-col gap-4">
                    {navItems.map(item => (
                        <li key={item.page}>
                            <a href="#" onClick={() => navigateTo(item.page)} className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-blue-500 hover:text-white transition-colors duration-200">
                                <item.icon className="h-6 w-6" />
                                <span className="hidden md:inline">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={handleLogout} className="p-3 rounded-lg text-gray-400 hover:bg-red-500 hover:text-white transition-colors duration-200">
                <Users className="h-6 w-6" />
                <span className="hidden md:inline">Logout</span>
            </button>
        </nav>
    );
};


// --- Authentication Screen ---
const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (password.length < 6) {
                    throw new Error("Password should be at least 6 characters.");
                }
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in App.js will handle the rest.
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center h-full bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl shadow-lg border border-gray-700">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-blue-500" />
                    <h1 className="text-3xl font-bold text-white mt-4">Welcome to Secure Escrow</h1>
                    <p className="text-gray-400">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
                </div>

                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center"><p>{error}</p></div>}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-300 disabled:bg-blue-800 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>
                
                <div className="text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 text-sm">
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Terms and Conditions ---
const TermsAndConditions = ({ onAgree }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-white">Terms and Conditions</h2>
                <div className="text-gray-300 space-y-4 max-h-80 overflow-y-auto pr-4 text-sm">
                    <p>Welcome to Secure Escrow! By using our service, you agree to these terms.</p>
                    <p><strong>1. Our Service:</strong> We provide a neutral platform for buyers and sellers to transact securely. We hold the buyer's payment in an escrow account until the service/product is delivered and approved.</p>
                    <p><strong>2. Platform Fee:</strong> We charge a 3% commission on each successfully completed transaction. This fee is deducted from the payment released to the seller.</p>
                    <p><strong>3. User Responsibilities:</strong> You are responsible for your conduct and any content you share. You must be at least 13 years old to use this service. Misrepresentation or fraudulent activity will result in account suspension and a decrease in your trust score.</p>
                    <p><strong>4. Disputes:</strong> If a dispute arises, our agents will mediate based on the chat history and evidence provided. The agent's decision is final.</p>
                    <p><strong>5. Verification:</strong> For transactions over ₹1,000, both parties may be required to complete a KYC verification process by uploading a valid government-issued ID.</p>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onAgree} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        Agree and Continue
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Home Screen ---
const HomeScreen = ({ currentUser, navigateTo }) => {
    const [deals, setDeals] = useState([]);
    const [isCreatingDeal, setIsCreatingDeal] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        
        const q = query(
            collection(db, "chats"),
            where('participants', 'array-contains', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const dealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDeals(dealsData);
        }, (error) => {
            console.error("Error fetching deals: ", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleCreateDeal = async (dealDetails) => {
        if(!currentUser) return;
        try {
            const newDealRef = await addDoc(collection(db, "chats"), {
                ...dealDetails,
                creatorId: currentUser.uid,
                participants: [currentUser.uid],
                agentId: 'system_agent',
                status: 'waiting_for_seller',
                createdAt: serverTimestamp(),
                messages: [{
                    sender: 'System',
                    text: `Deal created by ${currentUser.email || 'a user'}. Waiting for the seller to join.`,
                    timestamp: new Date()
                }]
            });
            setIsCreatingDeal(false);
            navigateTo('chat', newDealRef.id);
        } catch (error) {
            console.error("Error creating deal:", error);
        }
    };

    return (
        <div className="p-4 md:p-8 h-full bg-gray-800">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Deals</h1>
                <button onClick={() => setIsCreatingDeal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <MessageSquare size={20} /> New Deal
                </button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map(deal => (
                    <div key={deal.id} onClick={() => navigateTo('chat', deal.id)} className="bg-gray-900 p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 border border-gray-700">
                        <h3 className="text-xl font-semibold mb-2 truncate">{deal.purpose}</h3>
                        <p className="text-gray-400 mb-4">Price: <IndianRupee size={16} className="inline-block" /> {deal.price}</p>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                            deal.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                            deal.status === 'closed' ? 'bg-gray-500/20 text-gray-300' : 
                            deal.status === 'disputed' ? 'bg-red-500/20 text-red-300' : 
                            'bg-yellow-500/20 text-yellow-300'}`}>
                            {deal.status.replace(/_/g, ' ').toUpperCase()}
                        </div>
                    </div>
                ))}
                 {deals.length === 0 && <p className="text-gray-400 col-span-full text-center py-10">You have no active deals. Click "New Deal" to start!</p>}
            </div>

            {isCreatingDeal && <CreateDealModal onClose={() => setIsCreatingDeal(false)} onCreate={handleCreateDeal} />}
        </div>
    );
};

// --- Create Deal Modal ---
const CreateDealModal = ({ onClose, onCreate }) => {
    const [purpose, setPurpose] = useState('');
    const [price, setPrice] = useState('');
    const [language, setLanguage] = useState('english');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!purpose || !price) return;
        onCreate({ purpose, price: Number(price), language });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Create a New Deal</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Purpose of Deal</label>
                        <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., Website Development" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Price (INR)</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 5000" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Chat Language</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="english">English</option>
                            <option value="hindi">Hindi</option>
                        </select>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-300">
                            Create & Invite Seller
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Global helper function to send messages
const sendMessageToChat = async (chatId, text, senderId, senderEmail = '') => {
    if (!text) return;
    
    const message = {
        sender: senderId,
        senderEmail: senderEmail,
        text,
        timestamp: new Date(),
        attachment: null
    };

    const chatDocRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatDocRef);
    if(chatDoc.exists()) {
        const existingMessages = chatDoc.data().messages || [];
        await updateDoc(chatDocRef, {
            messages: [...existingMessages, message]
        });
    }
};


// --- Chat Room ---
const ChatRoom = ({ chatId, currentUser, navigateTo }) => {
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!chatId) {
            navigateTo('home');
            return;
        }
        
        const chatDocRef = doc(db, "chats", chatId);
        const unsubscribeChat = onSnapshot(chatDocRef, (doc) => {
            if (doc.exists()) {
                const chatData = { id: doc.id, ...doc.data() };
                setChat(chatData);
                const sortedMessages = (chatData.messages || []).sort((a, b) => {
                    const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
                    const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
                    return timeA - timeB;
                });
                setMessages(sortedMessages);
            } else {
                navigateTo('home');
            }
        });

        return () => unsubscribeChat();
    }, [chatId, navigateTo]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (text, sender = 'User') => {
        if (!text) return;
        await sendMessageToChat(chatId, text, sender === 'System' ? 'System' : currentUser.uid, currentUser.email);
        if(sender === 'User') setNewMessage('');
    };
    
    const handleUserAction = async (action) => {
        const chatDocRef = doc(db, "chats", chatId);
        let systemMessage = '';
        let newStatus = chat.status;

        switch (action) {
            case 'make_payment':
                newStatus = 'payment_in_escrow';
                systemMessage = `💰 Payment of ₹${chat.price} is now secured in escrow. Seller can now proceed.`;
                break;
            case 'service_received':
                newStatus = 'releasing_payment';
                systemMessage = `✅ Buyer has confirmed receipt. Releasing ₹${chat.price * 0.97} to the seller.`;
                // In a real app, this would trigger a backend function for payout
                setTimeout(() => {
                    updateDoc(doc(db, "chats", chatId), { status: 'closed' });
                    handleSendMessage(`🎉 Payment of ₹${chat.price * 0.97} released to seller. This deal is now closed.`, 'System');
                }, 3000);
                break;
            case 'dispute':
                newStatus = 'disputed';
                systemMessage = `🚨 DISPUTE OPENED! An agent will join the chat shortly to mediate. Please upload any relevant proof.`;
                break;
            default:
                return;
        }

        await updateDoc(chatDocRef, { status: newStatus });
        handleSendMessage(systemMessage, 'System');
    };

    const getInvitationLink = () => {
        const url = window.location.origin;
        return `${url}?joinChat=${chatId}`;
    };

    if (!chat) {
        return <div className="flex items-center justify-center h-full bg-gray-800"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

    const isBuyer = chat.creatorId === currentUser.uid;

    return (
        <div className="flex flex-col h-full bg-gray-800">
            <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
                <div>
                    <h2 className="text-xl font-bold">{chat.purpose}</h2>
                    <p className="text-sm text-gray-400">Price: ₹{chat.price} | Status: <span className="font-semibold">{chat.status.replace(/_/g,' ').toUpperCase()}</span></p>
                </div>
                {chat.status === 'waiting_for_seller' && isBuyer && (
                    <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/40">
                        <LinkIcon size={16} /> Invite
                    </button>
                )}
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                         <div key={index} className={`flex items-end gap-3 ${msg.sender === currentUser.uid ? 'justify-end' : msg.sender === 'System' ? 'justify-center' : 'justify-start'}`}>
                            {msg.sender !== 'System' && msg.sender !== currentUser.uid && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">{msg.senderEmail?.[0].toUpperCase()}</div>}
                           
                            {msg.sender === 'System' ? (
                                <div className="text-center w-full my-2">
                                     <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">{msg.text}</span>
                                </div>
                            ) : (
                                 <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === currentUser.uid ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className="text-xs text-gray-300 mt-1 text-right">{msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                </div>
                            )}
                         </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-900/50">
                 {isBuyer && chat.status === 'waiting_for_payment' && <button onClick={() => handleUserAction('make_payment')} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">Pay ₹{chat.price} to Escrow</button>}
                 {isBuyer && chat.status === 'payment_in_escrow' && (
                     <div className="flex gap-4">
                        <button onClick={() => handleUserAction('service_received')} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">Service Received</button>
                        <button onClick={() => handleUserAction('dispute')} className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold">Raise Dispute</button>
                     </div>
                 )}
            </div>

            <footer className="p-4 bg-gray-900 border-t border-gray-700">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage, 'User'); }} className="flex items-center gap-4">
                    <button type="button" className="p-2 text-gray-400 hover:text-white"><Paperclip size={20}/></button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 bg-gray-700 border-none rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">Send</button>
                </form>
            </footer>
            {showInvite && <InvitationModal link={getInvitationLink()} onClose={() => setShowInvite(false)} />}
        </div>
    );
};

// --- Invitation Modal ---
const InvitationModal = ({ link, onClose }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X className="text-gray-400 hover:text-white" /></button>
                <h2 className="text-2xl font-bold text-white mb-4">Invite Seller</h2>
                <p className="text-gray-400 mb-6">Share this link with the seller. They will be prompted to sign up or log in, and then will automatically join this deal.</p>
                <div className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg">
                    <input type="text" value={link} readOnly className="flex-1 bg-transparent text-gray-300 outline-none" />
                    <button onClick={copyToClipboard} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    )
};


// --- Profile Screen ---
const ProfileScreen = ({ user, setUser }) => {
    const [verificationStatus, setVerificationStatus] = useState(user.verificationStatus);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleUpload = async () => {
        if (!file || !user) return;
        setUploading(true);
        // In a real app, this would upload to Firebase Storage
        console.log("Uploading file:", file.name);
        setTimeout(async () => {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { verificationStatus: 'pending' });
            setUser(prev => ({...prev, verificationStatus: 'pending'}));
            setVerificationStatus('pending');
            setUploading(false);
        }, 2000);
    };
    
    const statusInfo = {
        unverified: { text: "Unverified", color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: Shield },
        pending: { text: "Pending Review", color: "text-blue-400", bgColor: "bg-blue-500/20", icon: History },
        verified: { text: "Verified", color: "text-green-400", bgColor: "bg-green-500/20", icon: Check },
    };
    
    const currentStatus = statusInfo[verificationStatus];

    return (
        <div className="p-4 md:p-8 h-full bg-gray-800 text-white">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
            
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 max-w-2xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-4xl font-bold">{user.email?.[0].toUpperCase()}</div>
                        <div className={`absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-900 ${currentStatus.bgColor}`}>
                             <currentStatus.icon className={`h-5 w-5 ${currentStatus.color}`} />
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-semibold">{user.email}</h2>
                        <p className="text-gray-400">Joined on {user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                        <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                             <span className="text-lg font-bold text-yellow-400">{user.trustScore}%</span>
                             <span className="text-gray-400">Trust Score</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-700">
                    <h3 className="text-xl font-semibold mb-4">KYC Verification</h3>
                    <p className="text-gray-400 mb-4">For deals over ₹1,000, verification is required. Upload a clear image of your Aadhar or PAN card.</p>
                    
                    {verificationStatus === 'unverified' && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                            <input type="file" onChange={handleFileChange} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30"/>
                            <button onClick={handleUpload} disabled={!file || uploading} className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {uploading ? 'Uploading...' : 'Upload for Verification'}
                            </button>
                        </div>
                    )}

                    {verificationStatus === 'pending' && (
                        <div className="p-4 bg-blue-500/20 text-blue-300 rounded-lg text-center">Your document is under review. This usually takes 24-48 hours.</div>
                    )}

                    {verificationStatus === 'verified' && (
                        <div className="p-4 bg-green-500/20 text-green-300 rounded-lg text-center font-semibold flex items-center justify-center gap-2">
                            <Check /> You are a verified user.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Transaction History Screen ---
const TransactionHistory = ({ user }) => {
    const [deals, setDeals] = useState([]);
    
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "chats"),
            where('participants', 'array-contains', user.uid),
            where('status', 'in', ['closed', 'refunded', 'releasing_payment'])
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const dealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDeals(dealsData);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="p-4 md:p-8 h-full bg-gray-800">
            <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
            <div className="bg-gray-900 rounded-xl border border-gray-700">
                <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Purpose</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map(deal => (
                                <tr key={deal.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-4 text-gray-400">{deal.createdAt?.toDate ? new Date(deal.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                                    <td className="p-4 font-semibold">{deal.purpose}</td>
                                    <td className="p-4 text-gray-300">₹{deal.price}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                            deal.status === 'closed' || deal.status === 'releasing_payment' ? 'bg-green-500/20 text-green-300' :
                                            'bg-red-500/20 text-red-300'
                                        }`}>{deal.status === 'closed' || deal.status === 'releasing_payment' ? 'Released' : 'Refunded'}</span>
                                    </td>
                                </tr>
                            ))}
                            {deals.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-gray-500">No completed transactions yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
