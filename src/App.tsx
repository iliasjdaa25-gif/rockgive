import React, { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  Gift,
  Coins,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  limit,
  increment, 
  arrayUnion, 
  Timestamp,
  FirebaseUser,
  handleFirestoreError,
  OperationType
} from './firebase';
import { UserProfile, RockstarAccount } from './types';

// --- Error Boundary ---

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
          <div className="glass-card p-8 max-w-md space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold">حدث خطأ ما</h2>
            <p className="text-white/40 text-sm">نعتذر عن هذا الخلل. يرجى المحاولة مرة أخرى لاحقاً.</p>
            {this.state.errorInfo && (
              <pre className="bg-black/40 p-4 rounded-xl text-[10px] text-left overflow-auto max-h-32 text-red-400/60">
                {this.state.errorInfo}
              </pre>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black font-bold rounded-xl"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const LoginModal = ({ isOpen, onClose, onLogin, onRegister }: { isOpen: boolean, onClose: () => void, onLogin: (e: string, p: string) => void, onRegister: (e: string, p: string, n: string) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative glass-card p-8 w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold">{isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
          <p className="text-white/40 text-sm">أدخل بياناتك للمتابعة</p>
        </div>

        <div className="space-y-4">
          {isRegister && (
            <input 
              type="text" 
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#F27D26]/50 outline-none"
            />
          )}
          <input 
            type="email" 
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#F27D26]/50 outline-none"
          />
          <input 
            type="password" 
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#F27D26]/50 outline-none"
          />
          
          <button 
            onClick={() => isRegister ? onRegister(email, password, name) : onLogin(email, password)}
            className="w-full py-4 bg-gradient-to-r from-[#F27D26] to-[#FF4E00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            {isRegister ? 'إنشاء حساب' : 'دخول'}
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-white/60 hover:text-[#F27D26] transition-colors"
          >
            {isRegister ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ user, isAdmin, onLogin, onLogout, onNavigate }: { user: FirebaseUser | null, isAdmin: boolean, onLogin: () => void, onLogout: () => void, onNavigate: (view: any) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/10">
    <div 
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => onNavigate('home')}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative w-12 h-12 bg-gradient-to-br from-[#F27D26] to-[#FF4E00] rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 border border-white/10 transform group-hover:scale-110 transition-transform duration-300">
          <Gamepad2 className="text-white w-7 h-7" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-display font-black tracking-tighter leading-none">ROCKSTAR <span className="text-[#F27D26]">LUCK</span></span>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">Premium Gaming</span>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      {isAdmin && (
        <button 
          onClick={() => onNavigate('admin')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#F27D26]"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>
      )}
      {user ? (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white/90">{user.displayName}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Premium Member</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button 
          onClick={onLogin}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>دخول</span>
        </button>
      )}
    </div>
  </nav>
);

const GameSection = ({ profile, onPlay }: { profile: UserProfile | null, onPlay: () => void }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<null | 'win' | 'lose'>(null);

  const handleSpin = async () => {
    if (!profile || profile.attempts <= 0 || isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Simulate spin duration
    setTimeout(() => {
      onPlay();
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="relative perspective-1000">
        <motion.div 
          animate={isSpinning ? { rotateY: 360 * 5 } : { rotateY: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="w-64 h-64 glass-card flex items-center justify-center preserve-3d relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F27D26]/20 to-transparent rounded-full blur-3xl" />
          <div className="z-10 flex flex-col items-center gap-2">
            <Trophy className={`w-20 h-20 ${isSpinning ? 'text-white/20' : 'text-[#F27D26]'}`} />
            <span className="text-sm font-mono text-white/40 uppercase tracking-widest">Luck Wheel</span>
          </div>
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#F27D26] rotate-45 rounded-sm shadow-xl shadow-orange-500/40 z-20" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <RefreshCw className={`w-4 h-4 text-[#F27D26] ${isSpinning ? 'animate-spin' : ''}`} />
          <span className="text-sm font-mono">المحاولات المتبقية: {profile?.attempts || 0}</span>
        </div>
        
        <button 
          onClick={handleSpin}
          disabled={isSpinning || !profile || profile.attempts <= 0}
          className={`
            px-12 py-4 rounded-2xl font-display font-bold text-xl uppercase tracking-widest transition-all
            ${isSpinning || !profile || profile.attempts <= 0 
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#F27D26] to-[#FF4E00] text-white shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95'}
          `}
        >
          {isSpinning ? 'جاري اللعب...' : 'إلعب الآن'}
        </button>
        
        {profile && profile.attempts <= 0 && (
          <p className="text-red-400 text-sm animate-pulse">لقد نفدت محاولاتك! قم بالشحن للمتابعة.</p>
        )}
      </div>
    </div>
  );
};

const RechargeSection = ({ onRecharge }: { onRecharge: (code: string) => void }) => {
  const [code, setCode] = useState('');

  return (
    <div className="glass-card p-8 max-w-md w-full mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Smartphone className="w-6 h-6 text-[#F27D26]" />
        <h3 className="text-xl font-display font-bold">شحن المحاولات</h3>
      </div>
      
      <p className="text-white/60 text-sm leading-relaxed">
        قم بشراء تعبئة <span className="text-orange-400 font-bold">Orange</span> بقيمة <span className="text-white font-bold">20 درهم</span>. 
        أدخل الكود المكون من 16 رقماً للحصول على <span className="text-green-400 font-bold">4 محاولات إضافية</span>.
      </p>

      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="أدخل كود التعبئة هنا..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-[0.2em] focus:outline-none focus:border-[#F27D26]/50"
        />
        <button 
          onClick={() => {
            if (code.length < 10) {
              toast.error('الكود غير صحيح');
              return;
            }
            onRecharge(code);
            setCode('');
          }}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95"
        >
          تأكيد الشحن
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest justify-center">
        <ShieldCheck className="w-3 h-3" />
        <span>نظام فحص تلقائي وآمن</span>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'game' | 'recharge' | 'admin'>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAdmin = user?.email === 'jdaailias@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user: 3 free attempts
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'User',
            attempts: 3,
            wonAccounts: []
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
          toast.success('مرحباً بك! لقد حصلت على 3 محاولات مجانية.');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen to stock
    const q = query(collection(db, 'accounts'), where('isClaimed', '==', false));
    const unsubscribeStock = onSnapshot(q, (snapshot) => {
      setStock(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accounts');
    });

    return () => {
      unsubscribe();
      unsubscribeStock();
    };
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsLoginModalOpen(false);
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      toast.error('خطأ في تسجيل الدخول: ' + (error.message || 'بيانات غير صحيحة'));
    }
  };

  const handleRegister = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const u = res.user;
      
      // Create profile
      const newProfile: UserProfile = {
        uid: u.uid,
        email: u.email || '',
        displayName: name || 'User',
        attempts: 3,
        wonAccounts: []
      };
      await setDoc(doc(db, 'users', u.uid), newProfile);
      setProfile(newProfile);
      setIsLoginModalOpen(false);
      toast.success('تم إنشاء الحساب بنجاح! حصلت على 3 محاولات مجانية.');
    } catch (error: any) {
      toast.error('خطأ في إنشاء الحساب: ' + (error.message || 'بيانات غير صحيحة'));
    }
  };

  const handleLogout = () => signOut(auth);

  const handlePlay = async () => {
    if (!profile || profile.attempts <= 0) return;

    const winProbability = 0.05; // 5% chance
    const isWin = Math.random() < winProbability;

    try {
      const userRef = doc(db, 'users', profile.uid);
      
      if (isWin && stock > 0) {
        // Get a random account
        const q = query(collection(db, 'accounts'), where('isClaimed', '==', false), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const accountDoc = snapshot.docs[0];
          const accountData = accountDoc.data() as RockstarAccount;
          
          // Update account as claimed
          await updateDoc(doc(db, 'accounts', accountDoc.id), {
            isClaimed: true,
            claimedBy: profile.uid,
            wonAt: new Date().toISOString()
          });

          // Update user profile
          const wonAcc = { ...accountData, id: accountDoc.id, wonAt: new Date().toISOString() };
          await updateDoc(userRef, {
            attempts: increment(-1),
            wonAccounts: arrayUnion(wonAcc)
          });

          setProfile(prev => prev ? { 
            ...prev, 
            attempts: prev.attempts - 1, 
            wonAccounts: [...(prev.wonAccounts || []), wonAcc] 
          } : null);

          toast.success('مبروك! لقد ربحت حساب روكستار!', {
            duration: 10000,
            description: `الايميل: ${accountData.email} | الباسورد: ${accountData.password}`
          });
        } else {
          // No stock left, just decrement attempt
          await updateDoc(userRef, { attempts: increment(-1) });
          setProfile(prev => prev ? { ...prev, attempts: prev.attempts - 1 } : null);
          toast.error('للأسف لم يحالفك الحظ هذه المرة.');
        }
      } else {
        // Lose
        await updateDoc(userRef, { attempts: increment(-1) });
        setProfile(prev => prev ? { ...prev, attempts: prev.attempts - 1 } : null);
        toast.error('للأسف لم يحالفك الحظ هذه المرة.');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء اللعب');
    }
  };

  const handleRecharge = async (code: string) => {
    if (!profile) return;
    
    try {
      // In a real app, you'd send this to a backend for verification
      // For this demo, we'll just record it and give attempts
      const rechargeRef = doc(collection(db, 'recharges'));
      await setDoc(rechargeRef, {
        code,
        userId: profile.uid,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // Give 4 attempts immediately for demo purposes
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        attempts: increment(4)
      });

      setProfile(prev => prev ? { ...prev, attempts: prev.attempts + 4 } : null);
      toast.success('تم إرسال الكود! لقد حصلت على 4 محاولات إضافية.');
      setView('game');
    } catch (error) {
      toast.error('فشل إرسال الكود');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#F27D26] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-white dir-rtl" dir="rtl">
        <Navbar user={user} isAdmin={isAdmin} onLogin={() => setIsLoginModalOpen(true)} onLogout={handleLogout} onNavigate={setView} />
        <Toaster position="top-center" theme="dark" richColors />

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
        />

        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.section 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center gap-12 py-12"
              >
                <div className="space-y-4">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="inline-block px-4 py-1 bg-[#F27D26]/10 border border-[#F27D26]/20 rounded-full text-[#F27D26] text-xs font-bold tracking-widest uppercase mb-4"
                  >
                    Limited Rockstar Accounts Giveaway
                  </motion.div>
                  <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none">
                    جرب حظك واربح <br />
                    <span className="gradient-text">حساب روكستار</span>
                  </h1>
                  <p className="text-white/40 max-w-2xl mx-auto text-lg">
                    انضم إلى آلاف اللاعبين وجرب حظك اليوم. كل مشترك جديد يحصل على 3 محاولات مجانية للفوز بحساب روكستار مفعل وجاهز للعب.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <div className="glass-card px-8 py-6 flex flex-col items-center gap-2 min-w-[160px]">
                    <span className="text-4xl font-display font-bold text-[#F27D26]">{stock}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">حساب متوفر</span>
                  </div>
                  <div className="glass-card px-8 py-6 flex flex-col items-center gap-2 min-w-[160px]">
                    <span className="text-4xl font-display font-bold text-green-400">3</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">محاولات مجانية</span>
                  </div>
                </div>

                <button 
                  onClick={() => user ? setView('game') : setIsLoginModalOpen(true)}
                  className="group flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-display font-bold text-xl hover:bg-[#F27D26] hover:text-white transition-all active:scale-95"
                >
                  <span>ابدأ اللعب الآن</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.section>
            )}

            {view === 'game' && (
              <motion.section 
                key="game"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-12"
              >
                <div className="w-full flex justify-between items-center mb-8">
                  <button onClick={() => setView('home')} className="text-white/40 hover:text-white flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <span>العودة</span>
                  </button>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setView('recharge')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#F27D26]/10 text-[#F27D26] rounded-xl border border-[#F27D26]/20 hover:bg-[#F27D26]/20 transition-all"
                    >
                      <Coins className="w-4 h-4" />
                      <span>شحن رصيد</span>
                    </button>
                  </div>
                </div>

                <GameSection profile={profile} onPlay={handlePlay} />
                
                {profile?.wonAccounts && profile.wonAccounts.length > 0 && (
                  <div className="w-full max-w-2xl mt-12">
                    <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#F27D26]" />
                      <span>حساباتك التي ربحتها</span>
                    </h3>
                    <div className="grid gap-4">
                      {profile.wonAccounts.map((acc, i) => (
                        <div key={i} className="glass-card p-6 flex justify-between items-center">
                          <div>
                            <p className="text-sm text-white/40 mb-1">حساب روكستار #{i+1}</p>
                            <p className="font-mono text-[#F27D26]">{acc.email}</p>
                            <p className="font-mono text-white/60 text-xs">كلمة السر: {acc.password}</p>
                          </div>
                          <CheckCircle2 className="text-green-400 w-6 h-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {view === 'recharge' && (
              <motion.section 
                key="recharge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center gap-12"
              >
                <button onClick={() => setView('game')} className="self-start text-white/40 hover:text-white flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>العودة للعبة</span>
                </button>
                <RechargeSection onRecharge={handleRecharge} />
              </motion.section>
            )}

            {view === 'admin' && isAdmin && (
              <motion.section 
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto"
              >
                <div className="w-full flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-display font-bold">لوحة التحكم</h2>
                  <button onClick={() => setView('home')} className="text-white/40 hover:text-white">إغلاق</button>
                </div>

                <div className="glass-card p-8 w-full space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">إضافة حسابات روكستار</h3>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono">المخزون الحالي: {stock}</span>
                  </div>
                  <div className="grid gap-4">
                    <input id="acc-email" type="email" placeholder="Email" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
                    <input id="acc-pass" type="text" placeholder="Password" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
                    <button 
                      onClick={async () => {
                        const email = (document.getElementById('acc-email') as HTMLInputElement).value;
                        const pass = (document.getElementById('acc-pass') as HTMLInputElement).value;
                        if (!email || !pass) return;
                        
                        const accRef = doc(collection(db, 'accounts'));
                        await setDoc(accRef, { email, password: pass, isClaimed: false });
                        toast.success('تمت إضافة الحساب بنجاح');
                        (document.getElementById('acc-email') as HTMLInputElement).value = '';
                        (document.getElementById('acc-pass') as HTMLInputElement).value = '';
                      }}
                      className="w-full py-4 bg-[#F27D26] text-white font-bold rounded-xl"
                    >
                      إضافة الحساب
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        <footer className="py-12 border-t border-white/5 text-center text-white/20 text-xs uppercase tracking-[0.3em]">
          &copy; 2026 Rockstar Luck 3D &bull; All Rights Reserved
        </footer>
      </div>
    </ErrorBoundary>
  );
}
