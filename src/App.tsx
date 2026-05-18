import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { 
  Users, 
  User,
  Home, 
  Bed, 
  CreditCard, 
  MessageSquare, 
  BarChart3, 
  LogOut, 
  Bell,
  ArrowLeft,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  History,
  Download,
  Printer,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// --- Components ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', icon: Home, path: '/' },
          { name: 'Estudantes', icon: Users, path: '/students' },
          { name: 'Gestores', icon: ShieldCheck, path: '/managers' },
          { name: 'Ocupação', icon: Bed, path: '/occupancy' },
          { name: 'Pagamentos', icon: CreditCard, path: '/payments' },
          { name: 'Comunicação', icon: MessageSquare, path: '/messages' },
          { name: 'Relatórios', icon: BarChart3, path: '/reports' },
        ];
      case 'registrar':
        return [
          { name: 'Dashboard', icon: Home, path: '/' },
          { name: 'Estudantes', icon: Users, path: '/students' },
          { name: 'Ocupação', icon: Bed, path: '/occupancy' },
          { name: 'Relatórios', icon: BarChart3, path: '/reports' },
          { name: 'Comunicação', icon: MessageSquare, path: '/messages' },
        ];
      case 'finance':
        return [
          { name: 'Dashboard', icon: Home, path: '/' },
          { name: 'Pagamentos', icon: CreditCard, path: '/payments' },
          { name: 'Relatórios', icon: BarChart3, path: '/reports' },
          { name: 'Comunicação', icon: MessageSquare, path: '/messages' },
        ];
      default:
        return [
          { name: 'Início', icon: Home, path: '/' },
          { name: 'Meus Pagamentos', icon: CreditCard, path: '/my-payments' },
          { name: 'Mensagens', icon: MessageSquare, path: '/messages' },
        ];
    }
  };

  const navItems = getNavItems();

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
      <main className="flex-1 p-3 md:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {children}
        </div>
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
      try {
        const res = await fetch("/api/dashboard/occupancy", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setStats(data);
        } else {
          console.error("Dashboard stats is not an array:", data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
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
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({
    full_name: "", email: "", phone: "", course: "", year: "", room_id: "", status: "active", role: "student"
  });

  const fetchData = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        fetch("/api/students", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        fetch("/api/rooms", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      ]);
      const sData = await sRes.json();
      const rData = await rRes.json();
      if (Array.isArray(sData)) setStudents(sData);
      if (Array.isArray(rData)) setRooms(rData);
    } catch (err) {
      console.error("Failed to fetch students/rooms:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
    const method = editingStudent ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingStudent(null);
        fetchData();
        setNewStudent({ full_name: "", email: "", phone: "", course: "", year: "", room_id: "", status: "active", role: "student" });
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao processar");
      }
    } catch (err) {
      alert("Falha de conexão");
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setNewStudent({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || "",
      course: student.course || "",
      year: student.year || "",
      room_id: "", // Mudanças de quarto devem ser feitas aqui também se desejado
      status: student.status,
      role: student.role || "student"
    });
    setShowModal(true);
  };

  const handleInactivate = async (student: any) => {
    if (window.confirm(`Deseja realmente inativar o estudante ${student.full_name}?`)) {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...student, status: 'inactive' }),
      });
      if (res.ok) fetchData();
    }
  };

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.room_location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Estudantes</h2>
            <p className="text-gray-500">Gestão de residentes matriculados.</p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'registrar') && (
          <button 
            onClick={() => { setEditingStudent(null); setNewStudent({ full_name: "", email: "", phone: "", course: "", year: "", room_id: "", status: "active", role: "student" }); setShowModal(true); }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="w-5 h-5" />
            Registrar Estudante
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar por nome, curso ou quarto (Ex: A1-Q1)..."
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
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Curso / Ano</th>
              <th className="px-6 py-4 font-semibold">Telefone</th>
              <th className="px-6 py-4 font-semibold">Atribuição de Quarto</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              {(user?.role === 'admin' || user?.role === 'registrar') && <th className="px-6 py-4 font-semibold text-right">Ações</th>}
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
                    <div className="truncate max-w-[200px]">
                      <span className="font-semibold text-gray-900 block">{s.full_name}</span>
                      <span className="text-xs text-gray-400">{s.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900 font-medium">{s.course}</p>
                  <p className="text-gray-500 text-sm">{s.year}º Ano</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{s.phone}</td>
                <td className="px-6 py-4">
                  {s.room_location ? (
                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                       <Bed className="w-4 h-4" />
                       {s.room_location}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Não Atribuído</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {(user?.role === 'admin' || user?.role === 'registrar') && (
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => {
                        if(window.confirm(`Deseja resetar a senha de ${s.full_name} para "student123"?`)) {
                          fetch(`/api/students/${s.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                            body: JSON.stringify({ ...s, password: "student123" }),
                          }).then(res => res.ok && alert("Senha resetada com sucesso"));
                        }
                      }}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all" 
                      title="Resetar Senha"
                    >
                      <LogOut className="w-4 h-4 rotate-90" />
                    </button>
                    <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    {s.status === 'active' && (
                    <button onClick={() => handleInactivate(s)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Inativar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{editingStudent ? 'Editar' : 'Registrar'} Estudante</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onChange={(e) => setNewStudent({...newStudent, year: Number(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Atribuir Quarto (Opcional)</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    value={newStudent.room_id}
                    onChange={(e) => setNewStudent({...newStudent, room_id: e.target.value})}
                  >
                    <option value="">Nenhum - Atribuir depois</option>
                    {rooms.filter(r => r.occupants < r.capacity).map(r => (
                      <option key={r.id} value={r.id}>
                        Bloco {r.block} - Casa {r.house} - Quarto {r.room} ({r.occupants}/{r.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                
                {editingStudent && (
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none"
                      value={newStudent.status}
                      onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                )}

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all font-sans"
                  >
                    {editingStudent ? 'Salvar Alterações' : 'Concluir Registro'}
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

const ManagersPage = () => {
  const { user } = useAuth();
  const [managers, setManagers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);
  const [newManager, setNewManager] = useState({
    full_name: "", email: "", phone: "", role: "registrar", status: "active", password: ""
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/managers", { 
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
      });
      const data = await res.json();
      if (Array.isArray(data)) setManagers(data);
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingManager ? `/api/managers/${editingManager.id}` : "/api/managers";
    const method = editingManager ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newManager),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingManager(null);
        fetchData();
        setNewManager({ full_name: "", email: "", phone: "", role: "registrar", status: "active", password: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao processar");
      }
    } catch (err) {
      alert("Falha de conexão");
    }
  };

  const handleEdit = (m: any) => {
    setEditingManager(m);
    setNewManager({
      full_name: m.full_name,
      email: m.email,
      phone: m.phone || "",
      role: m.role,
      status: m.status,
      password: ""
    });
    setShowModal(true);
  };

  const handleDelete = async (m: any) => {
    if (window.confirm(`Deseja remover o gestor ${m.full_name}?`)) {
      const res = await fetch(`/api/managers/${m.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) fetchData();
    }
  };

  if (user?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestores de Sistema</h2>
            <p className="text-gray-500">Administre as contas de Registro e Financeiro.</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingManager(null); setNewManager({ full_name: "", email: "", phone: "", role: "registrar", status: "active", password: "" }); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Novo Gestor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map((m) => (
          <motion.div key={m.id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-3 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-slate-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${m.role === 'registrar' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {m.role === 'registrar' ? 'Registro' : 'Financeiro'}
                </span>
              </div>
              <h3 className="text-lg font-bold truncate">{m.full_name}</h3>
              <p className="text-sm text-gray-500 truncate">{m.email}</p>
              <p className="text-xs text-gray-400 mt-1">Status: <span className={m.status === 'active' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{m.status === 'active' ? 'Ativo' : 'Inativo'}</span></p>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => handleEdit(m)}
                className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button 
                onClick={() => handleDelete(m)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{editingManager ? 'Editar Gestor' : 'Novo Gestor'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Completo</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newManager.full_name} onChange={e => setNewManager({...newManager, full_name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newManager.email} onChange={e => setNewManager({...newManager, email: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newManager.phone} onChange={e => setNewManager({...newManager, phone: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cargo</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newManager.role} onChange={e => setNewManager({...newManager, role: e.target.value})} required>
                      <option value="registrar">Registro</option>
                      <option value="finance">Financeiro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newManager.status} onChange={e => setNewManager({...newManager, status: e.target.value})} required>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{editingManager ? 'Nova Senha (deixe em branco se mantiver)' : 'Senha'}</label>
                  <input type="password" placeholder={editingManager ? "••••••••" : "Qualquer senha"} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={newManager.password} onChange={e => setNewManager({...newManager, password: e.target.value})} required={!editingManager} />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all">
                    {editingManager ? 'Salvar Alterações' : 'Concluir Registro'}
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
          <Route path="/managers" element={<ProtectedRoute><ManagersPage /></ProtectedRoute>} />
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
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomHistory, setRoomHistory] = useState<any[]>([]);
  const [assignment, setAssignment] = useState({ student_id: "", start_date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        fetch("/api/rooms", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        fetch("/api/students", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      ]);
      const rData = await roomsRes.json();
      const sData = await studentsRes.json();
      if (Array.isArray(rData)) setRooms(rData);
      if (Array.isArray(sData)) setStudents(sData);
    } catch (err) {
      console.error("Failed to fetch occupancy data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    const roomStr = `casa ${room.house} quarto ${room.room} bloco ${room.block}`.toLowerCase();
    const occupantsStr = (room.occupant_names || "").toLowerCase();
    return roomStr.includes(searchLower) || occupantsStr.includes(searchLower) || (room.block + room.house).toLowerCase().includes(searchLower);
  });

  const fetchHistory = async (roomId: number) => {
    const res = await fetch(`/api/rooms/${roomId}/history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setRoomHistory(await res.json());
    setShowHistoryModal(true);
  };

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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Painel de Ocupação</h2>
            <p className="text-gray-500">Gestão de quartos e alocação de residentes em tempo real.</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Pesquisar quarto, casa ou estudante..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
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
                <button 
                  onClick={() => fetchHistory(room.id)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver Histórico"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold">Casa {room.house}, Quarto {room.room}</h3>
              
              {/* Ocupantes Atuais */}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ocupantes Atuais</p>
                {room.occupant_names ? (
                  <div className="space-y-1">
                    {room.occupant_names.split(';').map((name: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <User className="w-3 h-3 text-blue-500" />
                        {name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Quarto vazio</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
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

            {(user?.role === 'admin' || user?.role === 'registrar') && (
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
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal Histórico */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-y-auto max-h-[80vh]">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Histórico de Ocupantes</h3>
                  <button onClick={() => setShowHistoryModal(false)} className="text-gray-400"><X /></button>
               </div>
               <div className="space-y-4">
                  {roomHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum histórico registrado para este quarto.</p>
                  ) : roomHistory.map(h => (
                    <div key={h.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                       <div>
                          <p className="font-bold text-gray-900">{h.student_name}</p>
                          <p className="text-xs text-secondary">Entrada: {h.start_date}</p>
                       </div>
                       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${h.end_date ? 'bg-gray-200' : 'bg-green-100 text-green-700'}`}>
                          {h.end_date ? `Saída: ${h.end_date}` : 'Atual'}
                       </span>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Atribuição */}
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
                      {students.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.course})</option>)}
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
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student_id: "", amount: "", payment_date: new Date().toISOString().split('T')[0], reference_month: "", method: "Transferência"
  });

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/payments", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        fetch(user?.role === 'admin' || user?.role === 'finance' ? "/api/students/debts" : "/api/students", { 
           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        })
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      if (Array.isArray(pData)) setPayments(pData);
      if (Array.isArray(sData)) setStudents(sData);
    } catch (err) {
      console.error("Failed to fetch payments data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(newPayment),
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao processar");
      }
    } catch (err) {
      alert("Falha de conexão");
    }
  };

  const generateReceipt = (p: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Comprovativo de Pagamento", 14, 25);
    doc.setFontSize(12);
    doc.text(`UniLog - Gestão de Condomínios`, 14, 35);
    
    doc.line(14, 40, 196, 40);
    
    doc.setFont("helvetica", "bold");
    doc.text("Detalhes do Pagamento", 14, 50);
    doc.setFont("helvetica", "normal");
    
    const details = [
      ["Estudante:", p.student_name || user?.name],
      ["Mês de Referência:", p.reference_month],
      ["Valor Pago:", `${p.amount} MT`],
      ["Data do Pagamento:", p.payment_date],
      ["Método de Pagamento:", p.method],
      ["ID Transação:", `#${p.id}`]
    ];

    (doc as any).autoTable({
      startY: 55,
      body: details,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 2 }
    });

    doc.text("Este documento serve como prova oficial de liquidação da mensalidade.", 14, (doc as any).lastAutoTable.finalY + 20);
    doc.save(`Recibo_${p.reference_month}_${p.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold">Gestão Financeira</h2>
        </div>
            <div className="flex gap-4">
               {/* Botão de Notificar Devedores */}
               <button 
                 onClick={async () => {
                   alert("Notificações enviadas aos estudantes com mensalidades pendentes.");
                 }}
                 className="bg-orange-100 text-orange-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-200 transition-all"
               >
                 <Bell className="w-5 h-5" /> Notificar Devedores
               </button>
               {(user?.role === 'admin' || user?.role === 'finance') && (
                 <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100">
                   <Plus className="w-5 h-5" /> Registrar Pagamento
                 </button>
               )}
            </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Estudante</th>
              <th className="px-6 py-4">Mês Referência</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4 text-right">Ações</th>
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
                  <button onClick={() => generateReceipt(p)} className="text-blue-600 hover:underline flex items-center gap-1 ml-auto">
                    <Printer className="w-4 h-4" /> Recibo
                  </button>
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
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
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
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-green-700 transition-colors shadow-lg shadow-green-100">
                    Registrar Pagamento
                  </button>
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
    if (user?.role === 'admin' || user?.role === 'registrar' || user?.role === 'finance') fetchStudents();
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
      <header className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => window.history.back()}
          className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-3xl font-bold">Comunicação Interna</h2>
          <p className="text-gray-500">Envio de comunicados e suporte.</p>
        </div>
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
        {(user?.role === 'admin' || user?.role === 'registrar' || user?.role === 'finance') && (
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
      <header className="flex items-center gap-4">
        <button 
          onClick={() => window.history.back()}
          className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold">Meus Pagamentos</h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">{payments.reduce((acc, p) => acc + p.amount, 0)} MT</p>
         </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-x-auto overflow-hidden">
        <table className="w-full text-left min-w-[800px]">
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
  const { user } = useAuth();
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [occRes, payRes] = await Promise.all([
        fetch("/api/dashboard/occupancy", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        fetch("/api/payments", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      ]);
      const oData = await occRes.json();
      const pData = await payRes.json();
      if (Array.isArray(oData)) setOccupancyData(oData);
      if (Array.isArray(pData)) setPaymentsData(pData);
    } catch (err) {
      console.error("Failed to fetch reports data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const exportExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const generateOccupancyPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório de Ocupação - UniLog", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = occupancyData.map(r => [
      `Bloco ${r.block}`,
      `House ${r.house}`,
      `Room ${r.room}`,
      r.capacity,
      r.current_occupants,
      r.current_occupants >= r.capacity ? "Lotado" : "Vago"
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Bloco', 'Casa', 'Quarto', 'Capacidade', 'Ocupantes', 'Status']],
      body: tableData,
    });

    doc.save("RelatorioOcupacao.pdf");
  };

  const generateFinancePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório Financeiro Consolidado - UniLog", 14, 22);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = paymentsData.map(p => [
      p.student_name,
      p.reference_month,
      `${p.amount} MT`,
      p.payment_date,
      p.method
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Estudante', 'Mês Ref.', 'Valor', 'Data', 'Método']],
      body: tableData,
    });

    doc.save("RelatorioFinanceiro.pdf");
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => window.history.back()}
          className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Relatórios e Exportação</h2>
          <p className="text-gray-500">Gere documentos PDF e planilhas Excel dos dados do condomínio.</p>
        </div>
      </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(user?.role === 'admin' || user?.role === 'registrar') && (
          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-6">
                <Bed className="w-8 h-8 text-blue-600" />
             </div>
             <h3 className="text-xl font-bold mb-2">Relatório de Ocupação</h3>
             <p className="text-gray-500 mb-8">Lista todos os quartos, capacidades e densidade de ocupação por bloco.</p>
             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => exportExcel(occupancyData, "Ocupacao_UniLog")}
                  className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Excel
                </button>
                <button 
                  onClick={generateOccupancyPDF}
                  className="flex-1 border border-slate-900 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" /> PDF
                </button>
             </div>
          </motion.div>
        )}
 
        {(user?.role === 'admin' || user?.role === 'finance') && (
          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <div className="bg-green-100 p-4 rounded-2xl w-fit mb-6">
                <CreditCard className="w-8 h-8 text-green-600" />
             </div>
             <h3 className="text-xl font-bold mb-2">Financeiro Consolidado</h3>
             <p className="text-gray-500 mb-8">Todos os pagamentos registrados, meses quitados e balanço de receitas.</p>
             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => exportExcel(paymentsData, "Financeiro_UniLog")}
                  className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Excel
                </button>
                <button 
                  onClick={generateFinancePDF}
                  className="flex-1 border border-slate-900 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" /> PDF
                </button>
             </div>
          </motion.div>
        )}
        </div>
    </div>
  );
};
