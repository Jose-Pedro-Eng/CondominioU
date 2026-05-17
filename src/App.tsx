import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { 
  Users, 
  Home, 
  Bed, 
  CreditCard, 
  MessageSquare, 
  BarChart3, 
  LogOut, 
  Bell,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Components ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = user?.role === 'admin' ? [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Estudantes', icon: Users, path: '/students' },
    { name: 'Ocupação', icon: Bed, path: '/occupancy' },
    { name: 'Pagamentos', icon: CreditCard, path: '/payments' },
    { name: 'Comunicação', icon: MessageSquare, path: '/messages' },
    { name: 'Relatórios', icon: BarChart3, path: '/reports' },
  ] : [
    { name: 'Início', icon: Home, path: '/' },
    { name: 'Meus Pagamentos', icon: CreditCard, path: '/my-payments' },
    { name: 'Mensagens', icon: MessageSquare, path: '/messages' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold font-sans">UniLog</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-slate-900 p-4 sticky top-0 z-50 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-bold uppercase tracking-wider">UniLog</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-slate-900 pt-20 px-6"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-xl text-slate-300"
                >
                  <item.icon className="w-6 h-6" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 text-xl text-red-400 pt-4 border-t border-slate-800 w-full"
              >
                <LogOut className="w-6 h-6" />
                Sair
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

// --- Pages ---

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        navigate("/");
      } else {
        setError(data.message || "Erro no login");
      }
    } catch (err) {
      setError("Falha na conexão com o servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-600 inline-block p-4 rounded-2xl mb-4">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">UniLog</h1>
          <p className="text-gray-500 mt-2">Bem-vindo ao portal residencial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Palavra-passe</label>
            <input
              type="password"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/dashboard/occupancy", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
  }, []);

  const totalRooms = stats.length;
  const occupiedRooms = stats.filter(s => s.current_occupants === s.capacity).length;
  const freeRooms = stats.filter(s => s.current_occupants === 0).length;
  const partialRooms = stats.filter(s => s.current_occupants > 0 && s.current_occupants < s.capacity).length;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Olá, {user?.name}!</h2>
        <p className="text-gray-500">Resumo da situação atual do condomínio.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Quartos', value: totalRooms, icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Ocupação Total', value: occupiedRooms, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Disponíveis', value: freeRooms, icon: Bed, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Ocupação Parcial', value: partialRooms, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Resumo por Bloco</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {['A', 'B'].map((block) => (
            <div key={block} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${block === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                  Bloco {block} - {block === 'A' ? 'Masculino' : 'Feminino'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                 <div>
                    <p className="text-secondary text-sm">Quartos Totais</p>
                    <p className="text-xl font-bold">{stats.filter(s => s.block === block).length}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-secondary text-sm">Ocupantes</p>
                    <p className="text-xl font-bold">{stats.filter(s => s.block === block).reduce((acc, curr) => acc + curr.current_occupants, 0)}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: "", email: "", phone: "", course: "", year: "", location: ""
  });

  const fetchStudents = async () => {
    const res = await fetch("/api/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(newStudent),
    });
    if (res.ok) {
      setShowModal(false);
      fetchStudents();
      setNewStudent({ full_name: "", email: "", phone: "", course: "", year: "", location: "" });
    }
  };

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Estudantes</h2>
          <p className="text-gray-500">Gestão de residentes matriculados.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Registrar Estudante
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou curso..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 border border-gray-200 px-6 py-3 rounded-2xl font-medium text-gray-600 hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Curso / Ano</th>
              <th className="px-6 py-4 font-semibold">Telefone</th>
              <th className="px-6 py-4 font-semibold">Localização</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {s.full_name[0]}
                    </div>
                    <span className="font-semibold text-gray-900">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900 font-medium">{s.course}</p>
                  <p className="text-gray-500 text-sm">{s.year}º Ano</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{s.phone}</td>
                <td className="px-6 py-4 text-gray-600">{s.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline font-medium">Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Registrar Novo Estudante</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.full_name}
                    onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ano de Frequência</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização Origem</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.location}
                    onChange={(e) => setNewStudent({...newStudent, location: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
                  >
                    Salvar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/occupancy" element={<ProtectedRoute><OccupancyPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/my-payments" element={<ProtectedRoute><MyPaymentsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const OccupancyPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [assignment, setAssignment] = useState({ student_id: "", start_date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    const [roomsRes, studentsRes] = await Promise.all([
      fetch("/api/rooms", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
      fetch("/api/students", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    ]);
    const roomsData = await roomsRes.json();
    const studentsData = await studentsRes.json();
    setRooms(roomsData);
    setStudents(studentsData);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/occupancy", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ ...assignment, room_id: selectedRoom.id }),
    });
    if (res.ok) {
      setShowAssignModal(false);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Painel de Ocupação</h2>
        <p className="text-gray-500">Gestão de quartos e alocação de residentes em tempo real.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.block === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                  Bloco {room.block}
                </span>
                <span className="text-gray-400 font-mono text-sm">{room.block}{room.house}-Q{room.room}</span>
              </div>
              <h3 className="text-lg font-bold">Casa {room.house}, Quarto {room.room}</h3>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Capacidade: {room.capacity}</span>
                <span className={`font-bold ${room.occupants >= room.capacity ? 'text-red-500' : 'text-green-500'}`}>
                  {room.occupants} / {room.capacity} Ocupados
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${room.occupants >= room.capacity ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${(room.occupants / room.capacity) * 100}%` }}
                />
              </div>
            </div>

            <button 
              disabled={room.occupants >= room.capacity}
              onClick={() => { setSelectedRoom(room); setShowAssignModal(true); }}
              className={`mt-6 w-full py-3 rounded-2xl font-bold transition-all ${
                room.occupants >= room.capacity 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
              }`}
            >
              Atribuir Estudante
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Atribuir ao Quarto {selectedRoom?.block}{selectedRoom?.house}-Q{selectedRoom?.room}</h3>
                <form onSubmit={handleAssign} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Selecionar Estudante</label>
                    <select 
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                      value={assignment.student_id}
                      onChange={(e) => setAssignment({...assignment, student_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.course})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Entrada</label>
                    <input 
                      type="date"
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                      value={assignment.start_date}
                      onChange={(e) => setAssignment({...assignment, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-4">Confirmar Atribuição</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student_id: "", amount: "", payment_date: new Date().toISOString().split('T')[0], reference_month: "", method: "Transferência"
  });

  const fetchData = async () => {
    const [pRes, sRes] = await Promise.all([
      fetch("/api/payments", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
      fetch("/api/students", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    ]);
    setPayments(await pRes.json());
    setStudents(await sRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify(newPayment),
    });
    if (res.ok) {
      setShowModal(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestão Financeira</h2>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100">
          <Plus className="w-5 h-5" /> Registrar Pagamento
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Estudante</th>
              <th className="px-6 py-4">Mês Referência</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4 text-right">Comprovativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-bold">{p.student_name}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">{p.reference_month}</td>
                <td className="px-6 py-4 font-bold text-green-600">{p.amount} MT</td>
                <td className="px-6 py-4 text-gray-500">{p.payment_date}</td>
                <td className="px-6 py-4 text-gray-600">{p.method}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline">Ver Recibo</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Pagamento */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Novo Pagamento</h3>
                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1 font-medium">Estudante</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newPayment.student_id} onChange={e => setNewPayment({...newPayment, student_id: e.target.value})} required>
                      <option value="">Selecione...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm mb-1 font-medium">Valor (MT)</label>
                     <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} required />
                  </div>
                  <div>
                     <label className="block text-sm mb-1 font-medium">Mês de Referência (ex: Maio 2024)</label>
                     <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newPayment.reference_month} onChange={e => setNewPayment({...newPayment, reference_month: e.target.value})} required />
                  </div>
                  <div>
                     <label className="block text-sm mb-1 font-medium">Data do Pagamento</label>
                     <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newPayment.payment_date} onChange={e => setNewPayment({...newPayment, payment_date: e.target.value})} required />
                  </div>
                  <button className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl mt-4">Registrar Pagamento</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [type, setType] = useState<"individual" | "broadcast">("broadcast");

  const fetchMessages = async () => {
    const res = await fetch("/api/messages", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    setMessages(await res.json());
  };

  const fetchStudents = async () => {
    const res = await fetch("/api/students", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    setStudents(await res.json());
  };

  useEffect(() => { 
    fetchMessages(); 
    if (user?.role === 'admin') fetchStudents();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ content, recipient_id: type === 'broadcast' ? null : recipientId, type }),
    });
    if (res.ok) {
      setContent("");
      fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-6">
        <h2 className="text-3xl font-bold">Comunicação Interna</h2>
        <p className="text-gray-500">Envio de comunicados e suporte.</p>
      </header>

      <div className="flex-1 overflow-y-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] p-4 rounded-2xl ${m.sender_id === user?.id ? 'self-end bg-blue-600 text-white' : 'self-start bg-gray-100 text-gray-800'}`}>
            <p className="text-[10px] font-bold uppercase mb-1 opacity-70">
              {m.type === 'broadcast' ? '📢 Comunicado' : m.sender_name}
            </p>
            <p className="text-sm">{m.content}</p>
            <p className="text-[10px] mt-1 text-right opacity-50">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        {user?.role === 'admin' && (
          <div className="flex gap-4">
            <select className="p-3 bg-gray-50 rounded-xl outline-none" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="broadcast">📢 Geral (Todos)</option>
              <option value="individual">👤 Individual</option>
            </select>
            {type === 'individual' && (
              <select className="flex-1 p-3 bg-gray-50 rounded-xl outline-none" value={recipientId} onChange={e => setRecipientId(e.target.value)} required>
                <option value="">Selecionar Destinatário...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            )}
          </div>
        )}
        <div className="flex gap-4">
          <input 
            type="text" 
            className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none" 
            placeholder="Escreva sua mensagem..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">Enviar</button>
        </div>
      </form>
    </div>
  );
};

const MyPaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  useEffect(() => {
    const fetchMy = async () => {
      const res = await fetch("/api/payments", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPayments(await res.json());
    };
    fetchMy();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Meus Pagamentos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">{payments.reduce((acc, p) => acc + p.amount, 0)} MT</p>
         </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Mês</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4 text-right">Recibo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-bold">{p.reference_month}</td>
                <td className="px-6 py-4 text-green-600 font-bold">{p.amount} MT</td>
                <td className="px-6 py-4 text-gray-500">{p.payment_date}</td>
                <td className="px-6 py-4 text-gray-500">{p.method}</td>
                <td className="px-6 py-4 text-right">
                   <button className="text-blue-600 hover:underline">Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Relatórios e Exportação</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold mb-4">Ocupação Mensal</h3>
           <p className="text-gray-500 mb-6">Relatório detalhado de quartos, capacidade e ocupantes atuais.</p>
           <div className="flex gap-4">
              <button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-2xl">Exportar Excel</button>
              <button className="flex-1 border border-slate-900 text-slate-900 font-bold py-3 rounded-2xl">Gerar PDF</button>
           </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold mb-4">Financeiro Consolidado</h3>
           <p className="text-gray-500 mb-6">Total de pagamentos, dívidas ativas e saldo individual.</p>
           <div className="flex gap-4">
              <button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-2xl">Exportar Excel</button>
              <button className="flex-1 border border-slate-900 text-slate-900 font-bold py-3 rounded-2xl">Gerar PDF</button>
           </div>
        </div>
      </div>
    </div>
  );
};
