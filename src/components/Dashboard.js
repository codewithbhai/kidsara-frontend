import React, { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { 
  Trash2, Edit2, Plus, Image, Music, FolderPlus, Package, 
  X, Check, Sun, Moon, LayoutGrid, Search, 
  Sparkles, Bell, User, Menu, Star
} from "lucide-react";

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false; // Default light mode
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}

function DashboardContent() {
  const { darkMode, setDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop";

  const [categoryForm, setCategoryForm] = useState({ name: "", image: "" });
  const [itemForm, setItemForm] = useState({
    name: "", image: "", description: "", sound_url: "", categoryId: ""
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories/list");
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items/list");
      setItems(res?.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/categories/create", categoryForm);
      showMessage("Category created successfully!", "success");
      setCategoryForm({ name: "", image: "" });
      setShowCategoryForm(false);
      fetchCategories();
    } catch (err) {
      showMessage("Failed to create category", "error");
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Delete this category? All items will be deleted.")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/delete/${categoryId}`);
        showMessage("Category deleted successfully!", "success");
        fetchCategories();
        fetchItems();
      } catch (err) {
        showMessage("Failed to delete category", "error");
      }
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/items/update/${editingItem.id}`, itemForm);
        showMessage("Item updated successfully!", "success");
      } else {
        await axios.post("http://localhost:5000/api/items/create", itemForm);
        showMessage("Item added successfully!", "success");
      }
      setItemForm({ name: "", image: "", description: "", sound_url: "", categoryId: "" });
      setShowItemForm(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      showMessage(`Failed to ${editingItem ? "update" : "add"} item`, "error");
    }
    setLoading(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      image: item.image || "",
      description: item.description || item.descriptions || "",
      sound_url: item.sound_url || "",
      categoryId: item.category_id || item.categoryId || ""
    });
    setShowItemForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/items/delete/${itemId}`);
        showMessage("Item deleted successfully!", "success");
        fetchItems();
      } catch (err) {
        showMessage("Failed to delete item", "error");
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_IMAGE;
  };

  const filterItems = () => {
    const filtered = {};
    Object.keys(items).forEach((category) => {
      if (selectedCategory !== "all" && category !== selectedCategory) return;
      const filteredItems = items[category]?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || item.descriptions || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredItems?.length > 0) {
        filtered[category] = filteredItems;
      }
    });
    return filtered;
  };

  const filteredItems = filterItems();
  const totalItems = Object.values(items).flat().length;

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Light Mode Background */}
      <div className={`fixed inset-0 -z-10 transition-all duration-500 ${
        darkMode 
          ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" 
          : "bg-gradient-to-br from-rose-50 via-white to-orange-50"
      }`} />
      
      {/* Animated Shapes - Light Mode */}
      {!darkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>
      )}
      
      {/* Dark Mode Shapes */}
      {darkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      )}

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-slideIn ${
          message.type === "success" 
            ? "bg-emerald-500 text-white" 
            : "bg-red-500 text-white"
        }`}>
          {message.type === "success" ? <Check className="size-4" /> : <X className="size-4" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 transition-all duration-500 ease-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${
        darkMode 
          ? "bg-gray-900/95 backdrop-blur-xl border-r border-gray-800" 
          : "bg-white/95 backdrop-blur-xl border-r border-gray-200"
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="relative">
                <div className={`absolute inset-0 rounded-2xl blur-lg ${
                  darkMode ? "bg-indigo-500" : "bg-rose-500"
                } opacity-50`} />
                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  darkMode ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-rose-500 to-orange-500"
                }`}>
                  <Sparkles className="size-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent"
                }`}>
                  Kidsara
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Learning Management</p>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
                { id: "items", icon: Package, label: "All Items" },
                { id: "categories", icon: FolderPlus, label: "Categories" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    activeTab === item.id
                      ? darkMode
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25"
                      : darkMode
                        ? "text-gray-400 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group ${
                darkMode 
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <>
                    <Sun className="size-5 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="size-5 group-hover:rotate-12 transition-transform duration-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${
                darkMode ? "bg-indigo-600" : "bg-gray-300"
              }`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
                  darkMode ? "left-4 bg-white" : "left-0.5 bg-white"
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Bar */}
        <div className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-all duration-300 ${
          darkMode 
            ? "bg-gray-900/70 border-gray-800" 
            : "bg-white/70 border-gray-200"
        }`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Menu className="size-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex-1 max-w-md mx-4">
                <div className="relative group">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 size-4 transition-colors ${
                    darkMode ? "text-gray-500 group-focus-within:text-indigo-400" : "text-gray-400 group-focus-within:text-rose-500"
                  }`} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 ${
                      darkMode 
                        ? "border-gray-700 bg-gray-800/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-50/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className={`relative p-2 rounded-xl transition ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}>
                  <Bell className="size-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                </button>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                  darkMode ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-rose-500 to-orange-500"
                }`}>
                  <User className="size-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${
              darkMode 
                ? "text-white" 
                : "bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent"
            }`}>
              Welcome back! 👋
            </h1>
            <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Manage your learning content with style
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 ${
              darkMode 
                ? "bg-gray-800/50 border border-gray-700 hover:shadow-2xl" 
                : "bg-white/50 border border-gray-200 hover:shadow-2xl"
            }`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                darkMode ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10" : "bg-gradient-to-r from-rose-500/10 to-orange-500/10"
              }`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Items</p>
                    <p className={`text-3xl font-bold mt-2 ${darkMode ? "text-white" : "text-gray-800"}`}>{totalItems}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${
                    darkMode ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-rose-500 to-orange-500"
                  }`}>
                    <Package className="size-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 ${
              darkMode 
                ? "bg-gray-800/50 border border-gray-700 hover:shadow-2xl" 
                : "bg-white/50 border border-gray-200 hover:shadow-2xl"
            }`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                darkMode ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10" : "bg-gradient-to-r from-rose-500/10 to-orange-500/10"
              }`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Categories</p>
                    <p className={`text-3xl font-bold mt-2 ${darkMode ? "text-white" : "text-gray-800"}`}>{categories.length}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${
                    darkMode ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-rose-500 to-orange-500"
                  }`}>
                    <FolderPlus className="size-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => { setShowCategoryForm(!showCategoryForm); setShowItemForm(false); setEditingItem(null); }}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                showCategoryForm 
                  ? darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                  : darkMode
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              <Plus className="size-4" /> Add Category
            </button>
            <button
              onClick={() => { setShowItemForm(!showItemForm); setShowCategoryForm(false); setEditingItem(null); }}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                showItemForm 
                  ? darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                  : darkMode
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              <Package className="size-4" /> {editingItem ? "Edit Item" : "Add Item"}
            </button>
          </div>

          {/* Forms */}
          {(showCategoryForm || showItemForm) && (
            <div className={`mb-8 rounded-2xl overflow-hidden shadow-xl ${
              darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white/50 border border-gray-200"
            }`}>
              {showCategoryForm && (
                <form onSubmit={handleCategorySubmit} className="p-8">
                  <h2 className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>Create New Category</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                        darkMode 
                          ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                          : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                      }`}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                        darkMode 
                          ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                          : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                      }`}
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-lg"
                    }`}>
                      {loading ? "Creating..." : "Create Category"}
                    </button>
                    <button type="button" onClick={() => setShowCategoryForm(false)} className={`px-6 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? "border-gray-700 hover:bg-gray-700 text-gray-300"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {showItemForm && (
                <form onSubmit={handleItemSubmit} className="p-8">
                  <h2 className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                        darkMode 
                          ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                          : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                      }`}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={itemForm.image}
                      onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                      className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                        darkMode 
                          ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                          : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Sound URL (optional)"
                      value={itemForm.sound_url}
                      onChange={(e) => setItemForm({ ...itemForm, sound_url: e.target.value })}
                      className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                        darkMode 
                          ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                          : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                      }`}
                    />
                    <select
                      value={itemForm.categoryId}
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                      className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                        darkMode 
                          ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                          : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                      }`}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    placeholder="Description"
                    rows="3"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className={`w-full mt-4 px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                      darkMode 
                        ? "border-gray-700 bg-gray-900/50 text-gray-300 focus:ring-indigo-500 focus:border-transparent"
                        : "border-gray-200 bg-white/50 text-gray-700 focus:ring-rose-500 focus:border-transparent"
                    }`}
                  />
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-lg"
                    }`}>
                      {loading ? (editingItem ? "Updating..." : "Adding...") : (editingItem ? "Update Item" : "Add Item")}
                    </button>
                    <button type="button" onClick={() => { setShowItemForm(false); setEditingItem(null); }} className={`px-6 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? "border-gray-700 hover:bg-gray-700 text-gray-300"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                selectedCategory === "all"
                  ? darkMode
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
                  : darkMode
                    ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                    : "bg-white/50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? darkMode
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                      : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
                    : darkMode
                      ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700"
                      : "bg-white/50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items Grid - 6 per row */}
          <div>
            {Object.keys(filteredItems).length === 0 ? (
              <div className={`rounded-2xl p-16 text-center ${
                darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white/50 border border-gray-200"
              }`}>
                <Package className="size-16 text-gray-400 mx-auto mb-4" />
                <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No items found. Start by adding some items!
                </p>
              </div>
            ) : (
              Object.keys(filteredItems).map((category) => (
                <div key={category} className="mb-10">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{category}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full backdrop-blur-sm ${
                      darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
                    }`}>
                      {filteredItems[category]?.length} items
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {filteredItems[category]?.map((item) => (
                      <div
                        key={item.id}
                        className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                          darkMode 
                            ? "bg-gray-800/50 border border-gray-700 hover:shadow-2xl" 
                            : "bg-white/50 border border-gray-200 hover:shadow-2xl"
                        }`}
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={item.image || DEFAULT_IMAGE}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={handleImageError}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-1.5 bg-white rounded-xl shadow-lg hover:bg-rose-50 transition text-rose-500"
                              title="Edit"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 bg-white rounded-xl shadow-lg hover:bg-red-50 transition text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          {item.sound_url && (
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                              <Music className="size-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className={`font-semibold text-sm truncate ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {item.name}
                          </h4>
                          <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {item.description || item.descriptions || "No description"}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <Star className="size-3 text-amber-500 fill-amber-500" />
                            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>4.5</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}